/**
 * /api/enrollments — Enrollment management API
 *
 * GET  - Get current user's enrollments with course details
 * POST - Enroll in a course (authenticated learners only)
 *
 * - Uses getOrCreateUserFromClerk() for auth + user sync
 * - UNIQUE(user_id, course_id) prevents duplicates at DB level
 */

import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

export const runtime = 'nodejs';

// Type for enrollment rows from DB
interface EnrollmentRow {
  id: string;
  courseId: string;
  status: string;
  progressPct: number;
  enrolledAt: Date;
  completedAt: Date | null;
  title: string;
  description: string;
  imageUrl: string | null;
  totalLessons: string;
}

interface CourseRow {
  id: string;
}

interface ExistingEnrollmentRow {
  id: string;
  status: string;
  progressPct: number;
}

interface NewEnrollmentRow {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progressPct: number;
  enrolledAt: Date;
}

/**
 * GET /api/enrollments — Get current user's enrolled courses
 */
export async function GET() {
  try {
    const user = await getOrCreateUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch enrollments with course details
    const { rows } = await query<EnrollmentRow>(
      `SELECT 
         e.id,
         e.course_id AS "courseId",
         e.status,
         e.progress_pct AS "progressPct",
         e.enrolled_at AS "enrolledAt",
         e.completed_at AS "completedAt",
         c.title,
         c.description,
         c.image_url AS "imageUrl",
         (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS "totalLessons"
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [user.id],
    );

    // Transform to the format expected by the frontend
    const enrollments = rows.map((row) => ({
      id: row.courseId,
      enrollmentId: row.id,
      title: row.title,
      description: row.description || '',
      progress: row.progressPct || 0,
      lessonsCompleted: Math.round((row.progressPct / 100) * parseInt(row.totalLessons)) || 0,
      totalLessons: parseInt(row.totalLessons) || 0,
      imageUrl: row.imageUrl,
      status: row.status === 'completed'
        ? 'completed'
        : row.progressPct > 0
          ? 'in_progress'
          : 'not_started',
    }));

    return NextResponse.json({ enrollments });
  } catch (err) {
    console.error('[GET /api/enrollments]', err);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/enrollments — Enroll in a course (authenticated learners only)
 */
export async function POST(request: Request) {
  try {
    const user = await getOrCreateUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // All authenticated users can enroll in courses

    const body = await request.json();
    const { courseId } = body;

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 },
      );
    }

    // Verify the course exists and is published
    const { rows: courseRows } = await query<CourseRow>(
      'SELECT id FROM courses WHERE id = $1 AND is_published = true',
      [courseId],
    );
    if (courseRows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found or not available' },
        { status: 404 },
      );
    }

    // Check for existing enrollment (avoid relying solely on DB error)
    const { rows: existingRows } = await query<ExistingEnrollmentRow>(
      'SELECT id, status, progress_pct AS "progressPct" FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [user.id, courseId],
    );
    if (existingRows.length > 0) {
      return NextResponse.json(
        {
          error: 'Already enrolled',
          enrollment: existingRows[0],
        },
        { status: 409 },
      );
    }

    const { rows } = await query<NewEnrollmentRow>(
      `INSERT INTO enrollments (user_id, course_id, status, progress_pct)
       VALUES ($1, $2, 'enrolled', 0)
       RETURNING
         id,
         user_id      AS "userId",
         course_id    AS "courseId",
         status,
         progress_pct AS "progressPct",
         enrolled_at  AS "enrolledAt"`,
      [user.id, courseId],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    // Catch the unique constraint violation just in case of race condition
    if (
      err instanceof Error &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === '23505'
    ) {
      return NextResponse.json(
        { error: 'Already enrolled' },
        { status: 409 },
      );
    }
    console.error('[POST /api/enrollments]', err);
    return NextResponse.json(
      { error: 'Failed to enroll' },
      { status: 500 },
    );
  }
}
