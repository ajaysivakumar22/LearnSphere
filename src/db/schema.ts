/**
 * DATABASE SCHEMA — LearnSphere
 *
 * Target database: PostgreSQL
 *
 * STATUS: Placeholder only. No ORM or query builder configured yet.
 * This file will hold table/model definitions once a PostgreSQL
 * client or ORM (e.g. Drizzle, Prisma, Knex) is chosen.
 *
 * PLANNED TABLES:
 * - users          (id, email, role, total_points, badge_level, timestamps)
 * - courses        (id, title, description, tags, is_published, views_count, timestamps)
 * - lessons        (id, title, type, content_url, duration, order_index, course_id)
 * - enrollments    (id, user_id, course_id, status, progress_pct, timestamps)
 * - quiz_questions (id, lesson_id, question, options, correct_answer)
 * - quiz_attempts  (id, user_id, question_id, selected_answer, is_correct, timestamps)
 *
 * CURRENT STATE:
 * Course data lives in CourseStoreProvider (src/lib/course-store.tsx) backed by localStorage.
 * Auth data lives in AuthProvider (src/lib/auth-context.tsx) backed by localStorage.
 *
 * IMPORTANT: Do not import this file until an ORM/client is configured in ./index.ts.
 */

export {};
