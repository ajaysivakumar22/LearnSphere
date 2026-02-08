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
    const { courseId, progressPct } = body;

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 },
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
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 },
      );
    }

    const enrollment = enrollments[0];

    // Cannot decrease progress
    if (progressPct < enrollment.progressPct) {
      return NextResponse.json(
        {
          error: `Progress cannot decrease (current: ${enrollment.progressPct}, requested: ${progressPct})`,
        },
        { status: 400 },
      );
    }

    // Already completed — no further updates
    if (enrollment.status === 'completed') {
      return NextResponse.json(
        { error: 'Course already completed' },
        { status: 400 },
      );
    }

    // Determine new status
    let newStatus: string = enrollment.status;
    if (progressPct === 100) {
      newStatus = 'completed';
    } else if (progressPct > 0 && enrollment.status === 'enrolled') {
      newStatus = 'in_progress';
    }

    const setCompletedAt =
      newStatus === 'completed' ? ', completed_at = now()' : '';

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
         progress_pct AS "progressPct",
         enrolled_at  AS "enrolledAt",
         completed_at AS "completedAt"`,
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
