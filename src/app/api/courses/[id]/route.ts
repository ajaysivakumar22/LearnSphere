/**
 * GET    /api/courses/[id] — Single course (guest-safe)
 * PUT    /api/courses/[id] — Update course (admin/instructor, owner only)
 * DELETE /api/courses/[id] — Delete course (admin/instructor, owner only)
 */

import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

// ────────────────────────────────────────────────────────────────
// GET /api/courses/[id]
// ────────────────────────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { rows } = await query(
      `SELECT
         c.id,
         c.title,
         c.description,
         c.tags,
         c.image_url      AS "imageUrl",
         c.is_published   AS "isPublished",
         c.views_count    AS "viewsCount",
         c.duration,
         c.rating,
         c.created_by     AS "createdBy",
         c.created_at     AS "createdAt",
         u.role           AS "creatorRole",
         COUNT(l.id)::int AS "contentsCount"
       FROM courses c
       LEFT JOIN lessons l ON l.course_id = c.id
       LEFT JOIN users u   ON u.id = c.created_by
       WHERE c.id = $1
       GROUP BY c.id, u.role`,
      [id],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[GET /api/courses/[id]]', err);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────────
// PUT /api/courses/[id] (admin/instructor, must own)
// ────────────────────────────────────────────────────────────────
export async function PUT(
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

    const { id } = await params;
    const body = await request.json();
    const { title, description, tags, imageUrl, isPublished, duration } = body;

    // Build dynamic query based on role
    const isAdmin = user.role === 'admin';

    const sqlParams = [
      title ?? null,
      description ?? null,
      tags ?? null,
      imageUrl ?? null,
      isPublished ?? null,
      duration ?? null,
      id, // $7 for WHERE clause
      ...(isAdmin ? [] : [user.id]), // $8 for instructor ownership check
    ];

    let queryText = `UPDATE courses
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           tags        = COALESCE($3, tags),
           image_url   = COALESCE($4, image_url),
           is_published= COALESCE($5, is_published),
           duration    = COALESCE($6, duration),
           updated_at  = now()
       WHERE id = $7`;

    if (!isAdmin) {
      queryText += ` AND created_by = $8`;
    }

    queryText += `
       RETURNING
         id,
         title,
         description,
         tags,
         image_url     AS "imageUrl",
         is_published  AS "isPublished",
         views_count   AS "viewsCount",
         duration,
         rating,
         created_by    AS "createdBy",
         created_at    AS "createdAt"`;

    const { rows } = await query(queryText, sqlParams);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found or not owned by you' },
        { status: 404 },
      );
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PUT /api/courses/[id]]', err);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────────
// DELETE /api/courses/[id] (admin: any course, instructor: own only)
// ────────────────────────────────────────────────────────────────
export async function DELETE(
  _request: Request,
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

    const { id } = await params;

    // Admin can delete ANY course, instructor can only delete their own
    let rowCount: number | null;
    if (user.role === 'admin') {
      const result = await query('DELETE FROM courses WHERE id = $1', [id]);
      rowCount = result.rowCount;
    } else {
      const result = await query(
        'DELETE FROM courses WHERE id = $1 AND created_by = $2',
        [id, user.id],
      );
      rowCount = result.rowCount;
    }

    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'Course not found or not owned by you' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('[DELETE /api/courses/[id]]', err);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 },
    );
  }
}
