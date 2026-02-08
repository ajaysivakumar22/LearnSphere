/**
 * GET /api/reports/courses — Get enrollment statistics for all courses
 * 
 * Returns aggregated enrollment stats per course:
 * - Total enrollments
 * - Yet to start (progress = 0)
 * - In progress (0 < progress < 100)
 * - Completed (progress = 100 or status = 'completed')
 */

import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

export const runtime = 'nodejs';

interface CourseStats {
    total: number;
    yetToStart: number;
    inProgress: number;
    completed: number;
}

interface EnrollmentRow {
    courseId: string;
    total: string;
    yetToStart: string;
    inProgress: string;
    completed: string;
}

export async function GET() {
    try {
        // Only admin/instructor can access reports
        const user = await getOrCreateUserFromClerk();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (user.role !== 'admin' && user.role !== 'instructor') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get enrollment stats grouped by course
        const { rows } = await query<EnrollmentRow>(
            `SELECT 
         e.course_id AS "courseId",
         COUNT(*)::text AS total,
         SUM(CASE WHEN e.progress_pct = 0 THEN 1 ELSE 0 END)::text AS "yetToStart",
         SUM(CASE WHEN e.progress_pct > 0 AND e.progress_pct < 100 AND e.status != 'completed' THEN 1 ELSE 0 END)::text AS "inProgress",
         SUM(CASE WHEN e.progress_pct >= 100 OR e.status = 'completed' THEN 1 ELSE 0 END)::text AS "completed"
       FROM enrollments e
       GROUP BY e.course_id`,
        );

        // Create a map of courseId -> stats
        const stats: Record<string, CourseStats> = {};
        for (const row of rows) {
            stats[row.courseId] = {
                total: parseInt(row.total) || 0,
                yetToStart: parseInt(row.yetToStart) || 0,
                inProgress: parseInt(row.inProgress) || 0,
                completed: parseInt(row.completed) || 0,
            };
        }

        return NextResponse.json({ stats });
    } catch (err) {
        console.error('[GET /api/reports/courses]', err);
        return NextResponse.json(
            { error: 'Failed to fetch report data' },
            { status: 500 },
        );
    }
}
