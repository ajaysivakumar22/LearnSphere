
import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

// PUT /api/lessons/[id]
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
        const { title, type, contentUrl, duration, orderIndex } = body;

        // Verify ownership via course
        // We need to join lessons -> courses to check created_by
        const { rows: ownerCheck } = await query(
            `SELECT c.id 
       FROM lessons l 
       JOIN courses c ON l.course_id = c.id 
       WHERE l.id = $1 AND (c.created_by = $2 OR $3 = 'admin')`,
            [id, user.id, user.role]
        );

        if (ownerCheck.length === 0) {
            return NextResponse.json({ error: 'Lesson not found or access denied' }, { status: 404 });
        }

        const { rows } = await query(
            `UPDATE lessons
       SET title = COALESCE($1, title),
           type = COALESCE($2, type),
           content_url = COALESCE($3, content_url),
           duration = COALESCE($4, duration),
           order_index = COALESCE($5, order_index),
           updated_at = now()
       WHERE id = $6
       RETURNING *`,
            [title, type, contentUrl, duration, orderIndex, id]
        );

        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error('[PUT /api/lessons/[id]]', err);
        return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
    }
}

// DELETE /api/lessons/[id]
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

        const { rows: ownerCheck } = await query(
            `SELECT c.id 
       FROM lessons l 
       JOIN courses c ON l.course_id = c.id 
       WHERE l.id = $1 AND (c.created_by = $2 OR $3 = 'admin')`,
            [id, user.id, user.role]
        );

        if (ownerCheck.length === 0) {
            return NextResponse.json({ error: 'Lesson not found or access denied' }, { status: 404 });
        }

        await query('DELETE FROM lessons WHERE id = $1', [id]);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/lessons/[id]]', err);
        return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
    }
}
