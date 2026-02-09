/**
 * GET /api/courses/[id]/lessons — Lessons for a course (guest-safe)
 *
 * Returns lessons ordered by order_index.
 * No auth required — guests may browse lesson lists.
 */

import { NextResponse } from 'next/server';
import { query } from '@/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Verify the course exists
    const { rows: courseRows } = await query(
      'SELECT id FROM courses WHERE id = $1',
      [id],
    );
    if (courseRows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Try to fetch with type column, fall back without if it doesn't exist
    let rows;
    try {
      const result = await query(
        `SELECT
           id,
           course_id    AS "courseId",
           title,
           type,
           content_url  AS "contentUrl",
           duration,
           order_index  AS "orderIndex",
           created_at   AS "createdAt"
         FROM lessons
         WHERE course_id = $1
         ORDER BY order_index ASC`,
        [id],
      );
      rows = result.rows;
    } catch {
      // Fall back to query without type column if it doesn't exist
      const result = await query(
        `SELECT
           id,
           course_id    AS "courseId",
           title,
           'video' AS type,
           content_url  AS "contentUrl",
           duration,
           order_index  AS "orderIndex",
           created_at   AS "createdAt"
         FROM lessons
         WHERE course_id = $1
         ORDER BY order_index ASC`,
        [id],
      );
      rows = result.rows;
    }

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[GET /api/courses/[id]/lessons]', err);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/courses/[id]/lessons — Add a lesson (admin/instructor only)
 */
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getOrCreateUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.role !== 'instructor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: courseId } = await params;

    // Verify course exists and is owned by the user
    const { rows: courseRows } = await query(
      'SELECT id FROM courses WHERE id = $1 AND created_by = $2',
      [courseId, user.id],
    );
    if (courseRows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found or not owned by you' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { title, type, contentUrl, duration, orderIndex } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    const validTypes = ['video', 'document', 'image', 'quiz'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 },
      );
    }

    const { rows } = await query(
      `INSERT INTO lessons (course_id, title, type, content_url, duration, order_index)
       VALUES ($1, $2, $3::lesson_type, $4, $5, $6)
       RETURNING
         id,
         course_id   AS "courseId",
         title,
         type,
         content_url AS "contentUrl",
         duration,
         order_index AS "orderIndex",
         created_at  AS "createdAt"`,
      [
        courseId,
        title.trim(),
        type,
        contentUrl ?? null,
        duration ?? 0,
        orderIndex ?? 0,
      ],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('[POST /api/courses/[id]/lessons]', err);
    return NextResponse.json(
      { error: 'Failed to add lesson' },
      { status: 500 },
    );
  }
}
