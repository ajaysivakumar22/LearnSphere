'use client';

import { motion } from 'framer-motion';
import CourseCard from '@/components/learner/CourseCard';
import BadgeDisplay from '@/components/learner/BadgeDisplay';

const enrolledCourses = [
  {
    id: '1',
    title: 'Basics of Odoo CRM',
    description: 'Learn CRM fundamentals with Odoo',
    progress: 75,
    lessonsCompleted: 9,
    totalLessons: 12,
    imageUrl: null,
    status: 'in_progress' as const,
  },
  {
    id: '2',
    title: 'Advanced Python Programming',
    description: 'Deep dive into Python with advanced concepts',
    progress: 100,
    lessonsCompleted: 24,
    totalLessons: 24,
    imageUrl: null,
    status: 'completed' as const,
  },
  {
    id: '4',
    title: 'Data Science Essentials',
    description: 'Introduction to data science and analytics',
    progress: 20,
    lessonsCompleted: 3,
    totalLessons: 16,
    imageUrl: null,
    status: 'in_progress' as const,
  },
];

export default function MyCoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">My Courses</h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>

          {enrolledCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-lg text-gray-500">You haven&apos;t enrolled in any courses yet.</p>
              <p className="text-sm text-gray-400">Explore courses to get started!</p>
            </div>
          )}
        </div>

        {/* Profile Sidebar */}
        <div className="hidden w-80 lg:block">
          <div className="sticky top-24">
            <BadgeDisplay totalPoints={85} />
          </div>
        </div>
      </div>
    </div>
  );
}
