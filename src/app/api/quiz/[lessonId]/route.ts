/**
 * GET  /api/quiz/[lessonId] — Quiz questions for a lesson (guest-safe)
 * POST /api/quiz/[lessonId] — Add a quiz question (admin/instructor only)
 *
 * correct_answer is HIDDEN from learners and guests on GET.
 * Only admin/instructor can see correct_answer.
 */

import { NextResponse } from 'next/server';
import { query } from '@/db';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

// ────────────────────────────────────────────────────────────────
// GET /api/quiz/[lessonId]
// ────────────────────────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await params;

    // Verify the lesson exists and is a quiz type
    const { rows: lessonRows } = await query(
      'SELECT id, type FROM lessons WHERE id = $1',
      [lessonId],
    );
    if (lessonRows.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Determine requester role (null = guest)
    let user: { role: string } | null = null;
    try {
      user = await getOrCreateUserFromClerk();
    } catch {
      // Guest request — proceed without role
    }

    const isPrivileged =
      user?.role === 'admin' || user?.role === 'instructor';

    const { rows } = await query(
      `SELECT
         id,
         lesson_id      AS "lessonId",
         question,
         options,
         ${isPrivileged ? 'correct_answer AS "correctAnswer",' : ''}
         order_index    AS "orderIndex"
       FROM quiz_questions
       WHERE lesson_id = $1
       ORDER BY order_index ASC`,
      [lessonId],
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[GET /api/quiz/[lessonId]]', err);
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────────
// POST /api/quiz/[lessonId] — Add question (admin/instructor only)
// ────────────────────────────────────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const user = await getOrCreateUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.role !== 'instructor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { lessonId } = await params;

    // Verify lesson exists and belongs to a course the user owns
    const { rows: lessonRows } = await query(
      `SELECT l.id
       FROM lessons l
       JOIN courses c ON c.id = l.course_id
       WHERE l.id = $1 AND c.created_by = $2`,
      [lessonId, user.id],
    );
    if (lessonRows.length === 0) {
      return NextResponse.json(
        { error: 'Lesson not found or course not owned by you' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { question, options, correctAnswer, orderIndex } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'question is required' },
        { status: 400 },
      );
    }
    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'options must be an array with at least 2 items' },
        { status: 400 },
      );
    }
    if (
      typeof correctAnswer !== 'number' ||
      correctAnswer < 0 ||
      correctAnswer >= options.length
    ) {
      return NextResponse.json(
        { error: 'correctAnswer must be a valid 0-based index' },
        { status: 400 },
      );
    }

    const { rows } = await query(
      `INSERT INTO quiz_questions (lesson_id, question, options, correct_answer, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         lesson_id      AS "lessonId",
         question,
         options,
         correct_answer AS "correctAnswer",
         order_index    AS "orderIndex"`,
      [lessonId, question.trim(), options, correctAnswer, orderIndex ?? 0],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('[POST /api/quiz/[lessonId]]', err);
    return NextResponse.json(
      { error: 'Failed to add quiz question' },
      { status: 500 },
    );
  }
}
