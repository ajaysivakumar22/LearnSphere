/**
 * POST /api/quiz/attempt — Submit quiz answers (authenticated learners only)
 *
 * Accepts: { lessonId, answers: [{ questionId, selectedAnswer }] }
 *
 * For each answer:
 *   - Fetches correct_answer from quiz_questions
 *   - Computes is_correct
 *   - points_awarded = POINTS_PER_CORRECT (fixed constant) if correct, else 0
 *   - Inserts row into quiz_attempts
 *
 * After all answers:
 *   - Sums total points awarded
 *   - Increments users.total_points
 *   - Optionally upgrades users.badge_level based on thresholds
 *
 * Entire operation wrapped in a single transaction.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/db';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

// ── Fixed reward constants (no quiz_reward_config column exists) ──
const POINTS_PER_CORRECT = 10;

// Badge thresholds — upgrade badge_level when total_points crosses these
const BADGE_THRESHOLDS: { minPoints: number; badge: string }[] = [
  { minPoints: 500, badge: 'Master' },
  { minPoints: 200, badge: 'Expert' },
  { minPoints: 100, badge: 'Advanced' },
  { minPoints: 50, badge: 'Intermediate' },
  { minPoints: 10, badge: 'Beginner' },
  { minPoints: 0, badge: 'Newbie' },
];

function badgeForPoints(totalPoints: number): string {
  for (const tier of BADGE_THRESHOLDS) {
    if (totalPoints >= tier.minPoints) return tier.badge;
  }
  return 'Newbie';
}

// ── Types ──
interface AnswerInput {
  questionId: string;
  selectedAnswer: number;
}

interface AttemptResult {
  questionId: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  pointsAwarded: number;
}

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'learner') {
      return NextResponse.json(
        { error: 'Only learners can attempt quizzes' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { lessonId, answers } = body as {
      lessonId?: string;
      answers?: AnswerInput[];
    };

    // ── Input validation ──
    if (!lessonId || typeof lessonId !== 'string') {
      return NextResponse.json(
        { error: 'lessonId is required' },
        { status: 400 },
      );
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'answers must be a non-empty array' },
        { status: 400 },
      );
    }
    for (const a of answers) {
      if (!a.questionId || typeof a.selectedAnswer !== 'number') {
        return NextResponse.json(
          { error: 'Each answer must have questionId (string) and selectedAnswer (number)' },
          { status: 400 },
        );
      }
    }

    // ── Verify lesson exists ──
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify the lesson exists
      const lessonCheck = await client.query(
        'SELECT id, course_id FROM lessons WHERE id = $1',
        [lessonId],
      );
      if (lessonCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Lesson not found' },
          { status: 404 },
        );
      }
      const courseId = lessonCheck.rows[0].course_id;

      // Fetch all questions for this lesson to validate answers
      const questionRows = await client.query(
        'SELECT id, correct_answer FROM quiz_questions WHERE lesson_id = $1',
        [lessonId],
      );
      const questionMap = new Map<string, number>();
      for (const q of questionRows.rows) {
        questionMap.set(q.id, q.correct_answer);
      }

      // Validate all questionIds belong to this lesson
      for (const a of answers) {
        if (!questionMap.has(a.questionId)) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: `Question ${a.questionId} does not belong to lesson ${lessonId}` },
            { status: 400 },
          );
        }
      }

      // ── Process each answer ──
      const results: AttemptResult[] = [];
      let totalPointsAwarded = 0;

      for (const answer of answers) {
        const correctAnswer = questionMap.get(answer.questionId)!;
        const isCorrect = answer.selectedAnswer === correctAnswer;
        const pointsAwarded = isCorrect ? POINTS_PER_CORRECT : 0;

        await client.query(
          `INSERT INTO quiz_attempts (user_id, question_id, selected_answer, is_correct, points_awarded)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, answer.questionId, answer.selectedAnswer, isCorrect, pointsAwarded],
        );

        totalPointsAwarded += pointsAwarded;

        results.push({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer,
          isCorrect,
          pointsAwarded,
        });
      }

      // ── Update user's total_points and badge_level ──
      const userUpdate = await client.query(
        `UPDATE users
         SET total_points = total_points + $1,
             updated_at   = now()
         WHERE id = $2
         RETURNING total_points`,
        [totalPointsAwarded, user.id],
      );

      const newTotalPoints = userUpdate.rows[0].total_points;
      const newBadge = badgeForPoints(newTotalPoints);

      await client.query(
        `UPDATE users
         SET badge_level = $1
         WHERE id = $2 AND badge_level IS DISTINCT FROM $1`,
        [newBadge, user.id],
      );

      // ── Optionally update enrollment progress ──
      // Check if user is enrolled in the course that owns this lesson
      const enrollmentRows = await client.query(
        `SELECT id, status, progress_pct
         FROM enrollments
         WHERE user_id = $1 AND course_id = $2`,
        [user.id, courseId],
      );

      if (enrollmentRows.rows.length > 0) {
        const enrollment = enrollmentRows.rows[0];
        // Only update if not already completed
        if (enrollment.status !== 'completed') {
          // Count total lessons and completed quiz lessons for progress calc
          const totalLessonsRes = await client.query(
            'SELECT COUNT(*)::int AS count FROM lessons WHERE course_id = $1',
            [courseId],
          );
          const totalLessons = totalLessonsRes.rows[0].count;

          // Count quiz lessons that have all questions answered by this user
          const completedQuizLessonsRes = await client.query(
            `SELECT COUNT(DISTINCT l.id)::int AS count
             FROM lessons l
             WHERE l.course_id = $1
               AND l.type = 'quiz'
               AND NOT EXISTS (
                 SELECT 1 FROM quiz_questions qq
                 WHERE qq.lesson_id = l.id
                   AND NOT EXISTS (
                     SELECT 1 FROM quiz_attempts qa
                     WHERE qa.question_id = qq.id
                       AND qa.user_id = $2
                   )
               )`,
            [courseId, user.id],
          );
          const completedQuizLessons = completedQuizLessonsRes.rows[0].count;

          // New progress = at least the quiz-based progress
          // (non-quiz lesson progress is tracked client-side)
          if (totalLessons > 0) {
            const quizProgress = Math.round(
              (completedQuizLessons / totalLessons) * 100,
            );
            // Only increase, never decrease
            const newProgress = Math.max(enrollment.progress_pct, quizProgress);
            if (newProgress > enrollment.progress_pct) {
              let newStatus = enrollment.status;
              const setCompletedAt =
                newProgress === 100 ? ', completed_at = now()' : '';
              if (newProgress === 100) {
                newStatus = 'completed';
              } else if (newProgress > 0 && enrollment.status === 'enrolled') {
                newStatus = 'in_progress';
              }

              await client.query(
                `UPDATE enrollments
                 SET progress_pct = $1,
                     status = $2::enrollment_status
                     ${setCompletedAt}
                 WHERE id = $3`,
                [newProgress, newStatus, enrollment.id],
              );
            }
          }
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({
        lessonId,
        results,
        totalPointsAwarded,
        newTotalPoints,
        newBadge,
        correctCount: results.filter((r) => r.isCorrect).length,
        totalQuestions: results.length,
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[POST /api/quiz/attempt]', err);
    return NextResponse.json(
      { error: 'Failed to submit quiz attempt' },
      { status: 500 },
    );
  }
}
