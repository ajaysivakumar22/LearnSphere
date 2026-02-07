import { pgTable, uuid, text, timestamp, integer, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'instructor', 'learner']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['enrolled', 'completed']);
export const lessonTypeEnum = pgEnum('lesson_type', ['video', 'document', 'image', 'quiz']);
export const visibilityEnum = pgEnum('visibility', ['everyone', 'signed_in']);
export const accessRuleEnum = pgEnum('access_rule', ['open', 'invitation', 'payment']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('learner'),
  totalPoints: integer('total_points').notNull().default(0),
  badgeLevel: text('badge_level').notNull().default('Newbie'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Courses Table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  tags: text('tags').array(),
  imageUrl: text('image_url'),
  isPublished: boolean('is_published').notNull().default(false),
  visibility: visibilityEnum('visibility').notNull().default('everyone'),
  accessRule: accessRuleEnum('access_rule').notNull().default('open'),
  price: decimal('price', { precision: 10, scale: 2 }),
  viewsCount: integer('views_count').notNull().default(0),
  adminId: uuid('admin_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Lessons Table
export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  type: lessonTypeEnum('type').notNull(),
  contentUrl: text('content_url'),
  duration: integer('duration'), // in minutes
  allowDownload: boolean('allow_download').notNull().default(false),
  orderIndex: integer('order_index').notNull(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Enrollments Table
export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  status: enrollmentStatusEnum('status').notNull().default('enrolled'),
  progressPct: integer('progress_pct').notNull().default(0),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  startedAt: timestamp('started_at'),
  timeSpent: integer('time_spent').notNull().default(0), // in minutes
});

// Quizzes Table
export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Quiz Questions Table
export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  options: text('options').array().notNull(),
  correctAnswer: integer('correct_answer').notNull(),
  pointsFirstTry: integer('points_first_try').notNull().default(10),
  pointsSecondTry: integer('points_second_try').notNull().default(5),
  pointsThirdTry: integer('points_third_try').notNull().default(2),
  orderIndex: integer('order_index').notNull(),
});

// Quiz Attempts Table
export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id),
  questionId: uuid('question_id').notNull().references(() => quizQuestions.id),
  attemptNumber: integer('attempt_number').notNull().default(1),
  isCorrect: boolean('is_correct').notNull(),
  pointsEarned: integer('points_earned').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Lesson Progress Table
export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id),
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
});

// Reviews Table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  rating: integer('rating').notNull(),
  review: text('review'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
  quizAttempts: many(quizAttempts),
  lessonProgress: many(lessonProgress),
  reviews: many(reviews),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  admin: one(users, {
    fields: [courses.adminId],
    references: [users.id],
  }),
  lessons: many(lessons),
  enrollments: many(enrollments),
  quizzes: many(quizzes),
  reviews: many(reviews),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  lessonProgress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, {
    fields: [quizzes.courseId],
    references: [courses.id],
  }),
  lesson: one(lessons, {
    fields: [quizzes.lessonId],
    references: [lessons.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
  attempts: many(quizAttempts),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  question: one(quizQuestions, {
    fields: [quizAttempts.questionId],
    references: [quizQuestions.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [reviews.courseId],
    references: [courses.id],
  }),
}));
