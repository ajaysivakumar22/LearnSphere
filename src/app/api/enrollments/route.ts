/**
 * POST /api/enroll — Enroll in a course (authenticated learners only)
 *
 * - Uses getOrCreateUserFromClerk() for auth + user sync
 * - Inserts into enrollments with status='enrolled', progress_pct=0
 * - UNIQUE(user_id, course_id) prevents duplicates at DB level
 * - Rejects gracefully on duplicate
 */

import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'learner') {
      return NextResponse.json(
        { error: 'Only learners can enroll in courses' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 },
      );
    }

    // Verify the course exists and is published
    const { rows: courseRows } = await query(
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
    const { rows: existingRows } = await query(
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

    const { rows } = await query(
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
    console.error('[POST /api/enroll]', err);
    return NextResponse.json(
      { error: 'Failed to enroll' },
      { status: 500 },
    );
  }
}
