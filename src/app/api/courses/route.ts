/**
 * GET  /api/courses — List courses (guest-safe)
 * POST /api/courses — Create a course (admin/instructor only)
 */

import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

// ────────────────────────────────────────────────────────────────
// GET /api/courses
// ────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────
// GET /api/courses
// ────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const tags = searchParams.getAll('tags'); // Support ?tags=AI&tags=Python
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    // Attempt to identify the requester (null = guest)
    let user: { id: string; role: string } | null = null;
    try {
      user = await getOrCreateUserFromClerk();
    } catch {
      // Clerk headers missing → guest request, continue
    }

    const isPrivileged = user?.role === 'admin' || user?.role === 'instructor';

    // Base conditions
    const conditions: string[] = [];
    // Allow string arrays for Postgres '&&' operator
    const params: (string | number | string[])[] = [];
    let pIdx = 1; // param index counter

    // 1. Role-based visibility
    if (!isPrivileged) {
      conditions.push(`c.is_published = true`);
    }

    // 2. Search query (title)
    if (q) {
      conditions.push(`c.title ILIKE $${pIdx}`);
      params.push(`%${q}%`);
      pIdx++;
    }

    // 3. Tags filtering
    if (tags.length > 0) {
      conditions.push(`c.tags && $${pIdx}`);
      params.push(tags); // PG driver handles array param automatically
      pIdx++;
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    // Total count query for pagination
    const { rows: countRows } = await query(
      `SELECT COUNT(*) FROM courses c ${whereClause}`,
      params
    );
    const total = parseInt(countRows[0].count);

    // Main data query
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
       ${whereClause}
       GROUP BY c.id, u.role
       ORDER BY c.created_at DESC
       LIMIT $${pIdx} OFFSET $${pIdx + 1}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('[GET /api/courses]', err);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────────
// POST /api/courses (admin/instructor only)
// ────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const user = await getOrCreateUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.role !== 'instructor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, tags, imageUrl, duration } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 },
      );
    }

    const { rows } = await query(
      `INSERT INTO courses (title, description, tags, image_url, duration, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
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
         created_at    AS "createdAt"`,
      [
        title.trim(),
        (description ?? '').trim(),
        tags ?? [],
        imageUrl ?? null,
        duration ?? '0:00',
        user.id,
      ],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('[POST /api/courses]', err);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 },
    );
  }
}
