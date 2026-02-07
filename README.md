# LearnSphere - eLearning Platform

A production-grade, dual-sided eLearning platform built with Next.js 15, Supabase, and Drizzle ORM.

## 🎯 Features

### Admin/Instructor Backoffice
- **Courses Dashboard** - Kanban & List views with course management
- **Course Editor** - 4-tab interface (Content, Description, Options, Quiz)
- **Reporting Dashboard** - Participant tracking with customizable columns
- **Quiz Builder** - Advanced quiz creation with reward logic

### Learner Website
- **My Courses** - Progress tracking with gamification
- **Learning Player** - Full-screen player with sidebar navigation
- **Reviews & Ratings** - Course feedback system
- **Badge System** - 6-tier achievement system

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI, Radix UI
- **Icons**: Lucide React
- **State**: Nuqs + Zustand
- **Animation**: Framer Motion
- **DnD**: @dnd-kit

## 📁 Project Structure

```
learnsphere/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin backoffice routes
│   │   ├── learner/            # Learner website routes
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── admin/              # Admin components
│   │   ├── learner/            # Learner components
│   │   └── shared/             # Shared components
│   ├── db/
│   │   ├── schema.ts           # Database schema
│   │   └── index.ts            # DB client
│   └── lib/
│       └── utils.ts            # Utility functions
├── public/                     # Static assets
└── drizzle/                    # Migrations
```

## 🗄️ Database Schema

### Tables

1. **users** - User authentication and profile
2. **courses** - Course information
3. **lessons** - Course content (video/document/image/quiz)
4. **enrollments** - User course enrollments
5. **quizzes** - Quiz metadata
6. **quiz_questions** - Individual quiz questions
7. **quiz_attempts** - User quiz attempts for points calculation
8. **lesson_progress** - Lesson completion tracking
9. **reviews** - Course reviews and ratings

### Badge System

Points-based progression:
- **Newbie**: 0-19 points
- **Explorer**: 20-39 points
- **Achiever**: 40-59 points
- **Specialist**: 60-79 points
- **Expert**: 80-99 points
- **Master**: 100+ points

## 🔒 Row-Level Security (RLS) Policies

Apply these policies in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Courses: Instructors can manage their own courses
CREATE POLICY "Instructors can view own courses" ON courses
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Instructors can create courses" ON courses
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Instructors can update own courses" ON courses
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Instructors can delete own courses" ON courses
  FOR DELETE USING (admin_id = auth.uid());

-- Learners can view published courses
CREATE POLICY "Learners can view published courses" ON courses
  FOR SELECT USING (
    is_published = true AND
    (visibility = 'everyone' OR (visibility = 'signed_in' AND auth.uid() IS NOT NULL))
  );

-- Lessons: Instructors manage, learners view if enrolled
CREATE POLICY "Instructors can manage lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.admin_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled learners can view lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = lessons.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- Enrollments: Users manage their own
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create enrollments" ON enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own enrollments" ON enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- Quiz Attempts: Users can view and create own attempts
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Lesson Progress: Users track their own progress
CREATE POLICY "Users can view own progress" ON lesson_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create progress" ON lesson_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON lesson_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Reviews: Users can manage own reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (user_id = auth.uid());

-- Quizzes and Questions: Inherit from course permissions
CREATE POLICY "Instructors can manage quizzes" ON quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = quizzes.course_id
      AND courses.admin_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled users can view quizzes" ON quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage quiz questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND courses.admin_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled users can view quiz questions" ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND enrollments.user_id = auth.uid()
    )
  );
```

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
cd learnsphere
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL` (from Supabase settings)

### 3. Initialize Database

```bash
# Push schema to database
npm run db:push

# Open Drizzle Studio (optional)
npm run db:studio
```

### 4. Apply RLS Policies

Go to Supabase SQL Editor and run the RLS policies above.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Colors (Odoo-inspired)
- **Primary**: `#714B67` (Purple)
- **Secondary**: `#875A7B`
- **Success**: `#28a745`
- **Warning**: `#ffc107`
- **Danger**: `#dc3545`

### Components
- Buttons use `.btn-odoo` class
- Cards use `.card-odoo` class
- Status ribbons for published/draft states
- Progress rings for completion tracking

## 📋 Key Features Implementation

### Course Access Rules
1. **Open**: Anyone can enroll
2. **On Invitation**: Requires manual enrollment
3. **On Payment**: Requires payment (price field becomes visible)

### Quiz Reward System
- Points decrease with each attempt
- 1st try: Full points
- 2nd try: Reduced points
- 3rd try: Minimal points

### Progress Tracking
- Lesson completion marks with blue ticks
- Course progress percentage
- Time spent tracking
- Enrollment status (enrolled/completed)

### Gamification
- Dynamic badge calculation based on total points
- Profile sidebar shows current badge
- Badge levels update automatically

## 🔧 Development Tips

### Adding New Components

```bash
# Add shadcn component
npx shadcn-ui@latest add [component-name]
```

### Database Migrations

```bash
# Generate migration
npx drizzle-kit generate:pg

# Push to database
npm run db:push
```

### File Upload

Use Supabase Storage buckets:
- `course-images`
- `lesson-content`
- `user-avatars`

## 📝 Next Steps

1. Implement actual page components (see component structure below)
2. Add authentication flows
3. Create course creation wizard
4. Build learning player
5. Implement payment integration
6. Add email notifications

## 📂 Component Structure

### Admin Components Needed
- `CourseKanban.tsx` - Kanban view
- `CourseList.tsx` - List view
- `CourseEditor.tsx` - 4-tab editor
- `LessonForm.tsx` - Add/edit lessons
- `QuizBuilder.tsx` - Quiz creation
- `ReportingDashboard.tsx` - Analytics

### Learner Components Needed
- `CourseCard.tsx` - Course display card
- `LearningPlayer.tsx` - Content player
- `QuizInterface.tsx` - Quiz taking
- `ProfileSidebar.tsx` - Badge display
- `ReviewForm.tsx` - Review submission

## 🤝 Contributing

This is a hackathon project built following the master prompt specifications.

## 📄 License

MIT
