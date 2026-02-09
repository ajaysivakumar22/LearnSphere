
import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

// GET /api/progress/course/[id]
// Returns granular lesson completion data for the current user and course
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const user = await getOrCreateUserFromClerk();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: courseId } = await params;

        // Get all completed lesson IDs for this user in this course
        // We join 'lesson_progress' (assuming it exists) or 'enrollment_progress'.
        // Wait, let's check the schema.
        // The previous code in '/api/enrollments' used this subquery:
        // (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id WHERE l.course_id = c.id AND lp.user_id = $1 AND lp.is_completed = true)
        // So 'lesson_progress' table exists.

        const { rows } = await query(
            `SELECT lp.lesson_id 
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       WHERE l.course_id = $1 AND lp.user_id = $2 AND lp.is_completed = true`,
            [courseId, user.id]
        );

        const completedLessonIds = rows.map(r => r.lesson_id);

        return NextResponse.json({
            courseId,
            completedLessonIds
        });

    } catch (err) {
        console.error('[GET /api/progress/course/[id]]', err);
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }
}
