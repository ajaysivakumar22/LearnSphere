/**
 * POST /api/progress/update — Update enrollment progress (authenticated learners only)
 *
 * Accepts: { courseId, progressPct }
 *
 * Rules:
 * - progressPct must be between 0 and 100
 * - progressPct must be >= current value (no backward movement)
 * - Status transitions:
 *     'enrolled'    → 'in_progress'  when progress > 0
 *     'in_progress' → 'completed'    when progress = 100
 * - completed_at is set when status becomes 'completed'
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
        { error: 'Only learners can update progress' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { courseId, progressPct, completedLessonId } = body;

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 },
      );
    }

    // If completedLessonId is provided, track it in lesson_progress
    if (completedLessonId && typeof completedLessonId === 'string') {
      await query(
        `INSERT INTO lesson_progress (user_id, lesson_id, is_completed, completed_at)
          VALUES ($1, $2, true, now())
          ON CONFLICT (user_id, lesson_id) DO UPDATE SET is_completed = true, completed_at = now()`,
        [user.id, completedLessonId]
      );
    }

    if (
      typeof progressPct !== 'number' ||
      !Number.isInteger(progressPct) ||
      progressPct < 0 ||
      progressPct > 100
    ) {
      return NextResponse.json(
        { error: 'progressPct must be an integer between 0 and 100' },
        { status: 400 },
      );
    }

    // Fetch current enrollment
    const { rows: enrollments } = await query(
      `SELECT id, status, progress_pct AS "progressPct"
       FROM enrollments
       WHERE user_id = $1 AND course_id = $2`,
      [user.id, courseId],
    );

    if (enrollments.length === 0) {
      // Auto-enroll if not enrolled? strict mode: error
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 },
      );
    }

    const enrollment = enrollments[0];

    // Cannot decrease progress
    if (progressPct < enrollment.progressPct) {
      // Just return current state instead of error to be idempotent/resilient
      return NextResponse.json(enrollment);
    }

    // Determine new status
    let newStatus: string = enrollment.status;
    if (progressPct === 100) {
      newStatus = 'completed';
    } else if (progressPct > 0 && enrollment.status === 'enrolled') {
      newStatus = 'in_progress';
    }

    // If status is completed, set completed_at. If already completed, keep original date (don't overwrite)
    // But here we are updating.
    let setCompletedAt = '';
    if (newStatus === 'completed' && enrollment.status !== 'completed') {
      setCompletedAt = ', completed_at = now()';
    }

    const { rows: updated } = await query(
      `UPDATE enrollments
       SET progress_pct = $1,
           status       = $2::enrollment_status
           ${setCompletedAt}
       WHERE user_id = $3 AND course_id = $4
       RETURNING
         id,
         user_id      AS "userId",
         course_id    AS "courseId",
         status,
         progress_pct AS "progressPct"`,
      [progressPct, newStatus, user.id, courseId],
    );

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error('[POST /api/progress/update]', err);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 },
    );
  }
}
