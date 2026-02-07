-- LearnSphere Database Setup
-- Run this in Supabase SQL Editor after running drizzle push

-- ============================================================================
-- STEP 1: Enable Row Level Security on all tables
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Users Table Policies
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 3: Courses Table Policies
-- ============================================================================

-- Instructors can view their own courses
CREATE POLICY "courses_instructor_select" ON courses
  FOR SELECT 
  USING (admin_id = auth.uid());

-- Instructors can create courses
CREATE POLICY "courses_instructor_insert" ON courses
  FOR INSERT 
  WITH CHECK (admin_id = auth.uid());

-- Instructors can update their own courses
CREATE POLICY "courses_instructor_update" ON courses
  FOR UPDATE 
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- Instructors can delete their own courses
CREATE POLICY "courses_instructor_delete" ON courses
  FOR DELETE 
  USING (admin_id = auth.uid());

-- Learners can view published courses based on visibility
CREATE POLICY "courses_learner_select" ON courses
  FOR SELECT 
  USING (
    is_published = true 
    AND (
      visibility = 'everyone' 
      OR (visibility = 'signed_in' AND auth.uid() IS NOT NULL)
    )
  );

-- ============================================================================
-- STEP 4: Lessons Table Policies
-- ============================================================================

-- Instructors can manage lessons in their courses
CREATE POLICY "lessons_instructor_all" ON lessons
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.admin_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.admin_id = auth.uid()
    )
  );

-- Enrolled learners can view lessons
CREATE POLICY "lessons_learner_select" ON lessons
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = lessons.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 5: Enrollments Table Policies
-- ============================================================================

-- Users can view their own enrollments
CREATE POLICY "enrollments_select_own" ON enrollments
  FOR SELECT 
  USING (user_id = auth.uid());

-- Users can create their own enrollments
CREATE POLICY "enrollments_insert_own" ON enrollments
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can update their own enrollments
CREATE POLICY "enrollments_update_own" ON enrollments
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Instructors can view enrollments for their courses
CREATE POLICY "enrollments_instructor_select" ON enrollments
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 6: Quizzes Table Policies
-- ============================================================================

-- Instructors can manage quizzes in their courses
CREATE POLICY "quizzes_instructor_all" ON quizzes
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = quizzes.course_id
      AND courses.admin_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = quizzes.course_id
      AND courses.admin_id = auth.uid()
    )
  );

-- Enrolled learners can view quizzes
CREATE POLICY "quizzes_learner_select" ON quizzes
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 7: Quiz Questions Table Policies
-- ============================================================================

-- Instructors can manage quiz questions
CREATE POLICY "quiz_questions_instructor_all" ON quiz_questions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND courses.admin_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND courses.admin_id = auth.uid()
    )
  );

-- Enrolled learners can view quiz questions
CREATE POLICY "quiz_questions_learner_select" ON quiz_questions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 8: Quiz Attempts Table Policies
-- ============================================================================

-- Users can view their own quiz attempts
CREATE POLICY "quiz_attempts_select_own" ON quiz_attempts
  FOR SELECT 
  USING (user_id = auth.uid());

-- Users can create their own quiz attempts
CREATE POLICY "quiz_attempts_insert_own" ON quiz_attempts
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Instructors can view attempts for their quizzes
CREATE POLICY "quiz_attempts_instructor_select" ON quiz_attempts
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_attempts.quiz_id
      AND courses.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 9: Lesson Progress Table Policies
-- ============================================================================

-- Users can view their own progress
CREATE POLICY "lesson_progress_select_own" ON lesson_progress
  FOR SELECT 
  USING (user_id = auth.uid());

-- Users can create their own progress
CREATE POLICY "lesson_progress_insert_own" ON lesson_progress
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "lesson_progress_update_own" ON lesson_progress
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Instructors can view progress for their courses
CREATE POLICY "lesson_progress_instructor_select" ON lesson_progress
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN courses ON courses.id = lessons.course_id
      WHERE lessons.id = lesson_progress.lesson_id
      AND courses.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 10: Reviews Table Policies
-- ============================================================================

-- Anyone can view reviews
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT 
  USING (true);

-- Users can create reviews for courses they're enrolled in
CREATE POLICY "reviews_insert_enrolled" ON reviews
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = reviews.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- Users can update their own reviews
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE 
  USING (user_id = auth.uid());

-- ============================================================================
-- STEP 11: Create Functions for Auto-updating Badges
-- ============================================================================

-- Function to calculate badge level
CREATE OR REPLACE FUNCTION calculate_badge_level(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF points >= 120 THEN RETURN 'Master';
  ELSIF points >= 100 THEN RETURN 'Expert';
  ELSIF points >= 80 THEN RETURN 'Specialist';
  ELSIF points >= 60 THEN RETURN 'Achiever';
  ELSIF points >= 40 THEN RETURN 'Explorer';
  ELSIF points >= 20 THEN RETURN 'Newbie';
  ELSE RETURN 'Newbie';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update badge when points change
CREATE OR REPLACE FUNCTION update_user_badge()
RETURNS TRIGGER AS $$
BEGIN
  NEW.badge_level := calculate_badge_level(NEW.total_points);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_badge_update
  BEFORE INSERT OR UPDATE OF total_points ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_badge();

-- ============================================================================
-- STEP 12: Create Storage Buckets (Run in Supabase Dashboard)
-- ============================================================================

-- Create these buckets in Supabase Storage:
-- 1. course-images (public)
-- 2. lesson-content (private, accessible with RLS)
-- 3. user-avatars (public)

-- Storage policies for lesson-content bucket:
-- CREATE POLICY "Instructors can upload content" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'lesson-content' 
--     AND auth.uid() IS NOT NULL
--   );

-- CREATE POLICY "Enrolled users can view content" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'lesson-content'
--   );

-- ============================================================================
-- STEP 13: Insert Sample Data (Optional)
-- ============================================================================

-- Sample admin user (replace with your auth.uid())
-- INSERT INTO users (id, email, role, total_points, badge_level)
-- VALUES 
--   ('your-auth-uuid', 'admin@learnsphere.com', 'admin', 0, 'Newbie');

-- Sample course
-- INSERT INTO courses (title, description, tags, is_published, visibility, access_rule, admin_id)
-- VALUES 
--   ('Introduction to Odoo AI', 'Learn the basics of Odoo AI', ARRAY['AI', 'Odoo', 'Basics'], true, 'everyone', 'open', 'your-auth-uuid');

-- ============================================================================
-- Setup Complete!
-- ============================================================================

-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Create storage buckets in Supabase Dashboard
-- 3. Update .env.local with your credentials
-- 4. Run: npm run db:push
-- 5. Run: npm run dev
