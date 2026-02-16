import { currentUser } from '@clerk/nextjs/server';
import { query } from '@/db';
import LearningPlayerClient, { CourseContent, QuizQuestion, CourseMetadata } from './LearningPlayerClient';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  // 1. Fetch Course
  const { rows: courses } = await query(
    `SELECT id, title, description, tags, image_url as "imageUrl" 
     FROM courses WHERE id = $1`,
    [id]
  );

  if (courses.length === 0) {
    notFound();
  }
  const course = courses[0] as CourseMetadata;

  // 2. Fetch Lessons
  const { rows: lessons } = await query(
    `SELECT id, title, type, duration, content_url as "contentUrl"
     FROM lessons 
     WHERE course_id = $1 
     ORDER BY order_index ASC`,
    [id]
  );

  // 3. Parse Lessons into CourseContent (and extract quizzes)
  const initialContents: CourseContent[] = [];

  lessons.forEach((l: any) => {
    let questions: QuizQuestion[] | undefined = undefined;

    if (l.type === 'quiz') {
      try {
        if (l.contentUrl) {
          const qs = JSON.parse(l.contentUrl);
          questions = qs.map((q: any) => ({
            text: q.question || q.text,
            options: q.options,
            correctAnswer: q.correctIndex !== undefined ? q.correctIndex : q.correctAnswer
          }));
        }
      } catch (e) {
        console.error(`Failed to parse quiz for lesson ${l.id}`, e);
      }
    }

    initialContents.push({
      id: l.id,
      title: l.title || (l.type === 'quiz' ? 'Course Quiz' : 'Untitled Lesson'),
      description: l.type === 'quiz' ? 'Test your knowledge' : '',
      type: l.type,
      duration: l.duration || (l.type === 'quiz' ? 10 : 5),
      status: 'not_started',
      allowDownload: false,
      attachments: [],
      contentUrl: l.contentUrl,
      questions: questions
    });
  });

  // 4. Fetch Enrollment & Progress
  let completedLessonIds: string[] = [];
  let isEnrolled = false;
  let dbUserId: string | undefined = undefined;

  if (email) {
    const { rows: users } = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (users.length > 0) {
      dbUserId = users[0].id;

      // Check Enrollment
      const { rows: enrolls } = await query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [dbUserId, id]
      );

      if (enrolls.length > 0) {
        isEnrolled = true;

        // Fetch Progress
        // We attempt to fetch from lesson_progress if it exists, otherwise fallback to empty
        // Since we can't easily check check table existence in a single query cross-db without info schema,
        // we wrap in try-catch to avoid crashing if table is missing.
        try {
          const { rows: progress } = await query(
            `SELECT lp.lesson_id 
                     FROM lesson_progress lp
                     JOIN lessons l ON l.id = lp.lesson_id
                     WHERE l.course_id = $1 AND lp.user_id = $2 AND lp.is_completed = true`,
            [id, dbUserId]
          );
          completedLessonIds = progress.map(row => row.lesson_id);
        } catch (err) {
          // Table likely missing or schema mismatch.
          // We silently fail on progress fetch rather than crashing the page.
          // Client will rely on local storage or optimistic updates for now.
          console.warn('Could not fetch lesson_progress. Table might be missing.');
        }
      }
    }
  }

  return (
    <LearningPlayerClient
      course={course}
      initialContents={initialContents}
      initialCompletedIds={completedLessonIds}
      isEnrolled={isEnrolled}
      userId={dbUserId}
    />
  );
}
