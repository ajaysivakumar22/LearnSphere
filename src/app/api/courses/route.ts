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
export async function GET() {
  try {
    // Attempt to identify the requester (null = guest)
    let user: { id: string; role: string } | null = null;
    try {
      user = await getOrCreateUserFromClerk();
    } catch {
      // Clerk headers missing → guest request, continue
    }

    const isPrivileged =
      user?.role === 'admin' || user?.role === 'instructor';

    // Guests and learners see only published courses.
    // Admin/instructor see ALL courses.
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
         c.price,
         c.currency,
         c.is_paid        AS "isPaid",
         u.role           AS "creatorRole",
         c.scheduled_publish_date AS "scheduledPublishDate",
         c.assigned_instructor    AS "assignedInstructor",
         COUNT(l.id)::int AS "contentsCount"
       FROM courses c
       LEFT JOIN lessons l ON l.course_id = c.id
       LEFT JOIN users u   ON u.id = c.created_by
       ${isPrivileged ? '' : 'WHERE c.is_published = true'}
       GROUP BY c.id, u.role, c.scheduled_publish_date, c.assigned_instructor, c.price, c.currency, c.is_paid
       ORDER BY c.created_at DESC`,
    );

    return NextResponse.json(rows);
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
    const { title, description, tags, imageUrl, duration, scheduledPublishDate, assignedInstructor, price, currency, isPaid } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 },
      );
    }

    // Try to insert with new columns, fall back if they don't exist (basic compatibility)
    // Note: In a real app we'd run a migration. Here we'll just try to use them.

    const insertQuery = `
      INSERT INTO courses (title, description, tags, image_url, duration, created_by, scheduled_publish_date, assigned_instructor, price, currency, is_paid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        created_at    AS "createdAt",
        scheduled_publish_date AS "scheduledPublishDate",
        assigned_instructor    AS "assignedInstructor",
        price,
        currency,
        is_paid       AS "isPaid"`;

    const params = [
      title.trim(),
      (description ?? '').trim(),
      tags ?? [],
      imageUrl ?? null,
      duration ?? '0:00',
      user.id,
      scheduledPublishDate ?? null,
      assignedInstructor ?? null,
      price ?? 0,
      currency ?? 'INR',
      isPaid ?? false
    ];

    try {
      const { rows } = await query(insertQuery, params);
      return NextResponse.json(rows[0], { status: 201 });
    } catch (err: any) {
      // Self-healing: If column missing (42703), add them and retry
      if (err.code === '42703') {
        console.log('[POST /api/courses] Missing columns detected. Attempting to add them...');
        try {
          await query(`
                    ALTER TABLE courses 
                    ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP,
                    ADD COLUMN IF NOT EXISTS assigned_instructor TEXT,
                    ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
                    ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
                    ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
                `);
          // Retry insert
          const { rows } = await query(insertQuery, params);
          return NextResponse.json(rows[0], { status: 201 });
        } catch (retryErr) {
          console.error('[POST /api/courses] Retry failed', retryErr);
          throw retryErr;
        }
      }
      throw err;
    }

  } catch (err) {
    console.error('[POST /api/courses]', err);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 },
    );
  }
}
