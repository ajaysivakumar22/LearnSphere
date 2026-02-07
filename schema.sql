-- =============================================================================
-- LearnSphere — PostgreSQL V1 Schema
-- Target: PostgreSQL 15+
-- ID Strategy: UUID (gen_random_uuid) — avoids sequential exposure, safe for
--              distributed systems, matches existing string-based IDs in the app.
-- =============================================================================

-- Enable UUID generation (built-in from PG 13+, explicit for clarity)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'learner');
CREATE TYPE lesson_type AS ENUM ('video', 'document', 'image', 'quiz');
CREATE TYPE enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed');

-- -----------------------------------------------------------------------------
-- 1. USERS
-- -----------------------------------------------------------------------------

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    role          user_role NOT NULL DEFAULT 'learner',
    password_hash TEXT,                          -- nullable: auth strategy TBD
    avatar_url    TEXT,
    bio           TEXT,
    total_points  INTEGER NOT NULL DEFAULT 0,
    badge_level   TEXT NOT NULL DEFAULT 'Newbie',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. COURSES
-- -----------------------------------------------------------------------------

CREATE TABLE courses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    tags          TEXT[] NOT NULL DEFAULT '{}',   -- PostgreSQL native array
    image_url     TEXT,
    is_published  BOOLEAN NOT NULL DEFAULT false,
    views_count   INTEGER NOT NULL DEFAULT 0,
    duration      TEXT NOT NULL DEFAULT '00:00',  -- display string, e.g. "25:30"
    rating        NUMERIC(2,1) NOT NULL DEFAULT 0.0,
    created_by    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_is_published ON courses(is_published);

-- -----------------------------------------------------------------------------
-- 3. LESSONS (course content items)
-- -----------------------------------------------------------------------------

CREATE TABLE lessons (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    type          lesson_type NOT NULL,
    content_url   TEXT,                          -- video/doc/image URL
    duration      INTEGER NOT NULL DEFAULT 0,    -- seconds
    order_index   INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (course_id, order_index)
);

CREATE INDEX idx_lessons_course_id ON lessons(course_id);

-- -----------------------------------------------------------------------------
-- 4. ENROLLMENTS
-- -----------------------------------------------------------------------------

CREATE TABLE enrollments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status        enrollment_status NOT NULL DEFAULT 'enrolled',
    progress_pct  INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at  TIMESTAMPTZ,

    UNIQUE (user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- -----------------------------------------------------------------------------
-- 5. QUIZ QUESTIONS
-- -----------------------------------------------------------------------------

CREATE TABLE quiz_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question        TEXT NOT NULL,
    options         TEXT[] NOT NULL,              -- e.g. {'Option A','Option B','Option C','Option D'}
    correct_answer  INTEGER NOT NULL,            -- 0-based index into options[]
    order_index     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_correct_answer_range CHECK (correct_answer >= 0)
);

CREATE INDEX idx_quiz_questions_lesson_id ON quiz_questions(lesson_id);

-- -----------------------------------------------------------------------------
-- 6. QUIZ ATTEMPTS
-- -----------------------------------------------------------------------------

CREATE TABLE quiz_attempts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id      UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_answer  INTEGER NOT NULL,           -- 0-based index
    is_correct       BOOLEAN NOT NULL,
    points_awarded   INTEGER NOT NULL DEFAULT 0,
    attempted_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_question_id ON quiz_attempts(question_id);
