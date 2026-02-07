'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Flame, ChevronDown } from 'lucide-react';
import CourseCard from '@/components/learner/CourseCard';
import BadgeDisplay from '@/components/learner/BadgeDisplay';
import { useStreak } from '@/lib/useStreak';

const enrolledCourses = [
  {
    id: '1',
    title: 'Basics of Odoo CRM',
    description: 'Learn CRM fundamentals with Odoo. Build pipelines, manage leads, and automate your sales process.',
    progress: 75,
    lessonsCompleted: 9,
    totalLessons: 12,
    imageUrl: null,
    status: 'in_progress' as const,
    tags: ['CRM', 'Odoo'],
  },
  {
    id: '2',
    title: 'Advanced Python Programming',
    description: 'Deep dive into Python with advanced concepts and real-world projects.',
    progress: 100,
    lessonsCompleted: 24,
    totalLessons: 24,
    imageUrl: null,
    status: 'completed' as const,
    tags: ['Python', 'Programming'],
  },
  {
    id: '3',
    title: 'Web Development Masterclass',
    description: 'Complete web development course covering HTML, CSS, JavaScript, and React.',
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 32,
    imageUrl: null,
    status: 'not_started' as const,
    tags: ['Web', 'React'],
    isPaid: true,
    price: 500,
  },
  {
    id: '4',
    title: 'Data Science Essentials',
    description: 'Introduction to data science and analytics with hands-on projects.',
    progress: 20,
    lessonsCompleted: 3,
    totalLessons: 16,
    imageUrl: null,
    status: 'in_progress' as const,
    tags: ['Data Science', 'ML'],
  },
];

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    timezone, timezones, currentStreak, longestStreak,
    todayCompleted, changeTimezone,
  } = useStreak();

  type CourseStatus = 'in_progress' | 'completed' | 'not_started';
  type EnrolledCourse = typeof enrolledCourses[number] & { status: CourseStatus };
  const [courses, setCourses] = useState<EnrolledCourse[]>(enrolledCourses as EnrolledCourse[]);

  // Sync sample completed courses and load progress from localStorage
  useEffect(() => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('completedCourses') || '[]');
      const fromData = enrolledCourses
        .filter(c => c.status === 'completed')
        .map(c => c.id);
      const merged = [...new Set([...existing, ...fromData])];
      localStorage.setItem('completedCourses', JSON.stringify(merged));

      // Update course progress from localStorage
      setCourses(enrolledCourses.map(course => {
        // Check if course is completed
        if (merged.includes(course.id)) {
          return { ...course, progress: 100, status: 'completed' as const, lessonsCompleted: course.totalLessons };
        }
        // Check for saved progress
        const savedProgress = localStorage.getItem(`courseProgress_${course.id}`);
        if (savedProgress) {
          try {
            const data = JSON.parse(savedProgress) as { completedCount: number; totalContents: number; progressPct: number };
            return {
              ...course,
              progress: data.progressPct,
              lessonsCompleted: data.completedCount,
              totalLessons: data.totalContents,
              status: (data.progressPct >= 100 ? 'completed' : data.progressPct > 0 ? 'in_progress' : course.status) as CourseStatus,
            };
          } catch {}
        }
        return course;
      }) as EnrolledCourse[]);
    } catch {}
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <h1 className="mb-6 text-3xl font-bold text-foreground">My Courses</h1>

          {/* Streak Indicator */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/10">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">
                  <span className="mr-1">🔥</span>{currentStreak} day streak
                </p>
                <p className="text-xs text-muted-foreground">
                  {todayCompleted ? '✅ Today completed' : '⬜ Not completed today'}
                  {longestStreak > 0 && ` • Best: ${longestStreak} days`}
                </p>
              </div>
            </div>
            <div className="relative">
              <select
                value={timezone}
                onChange={(e) => changeTimezone(e.target.value)}
                className="appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-8 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course, index) => (
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

          {filteredCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
              <p className="text-lg text-muted-foreground">No courses found.</p>
              <p className="text-sm text-muted-foreground">Try a different search or explore new courses!</p>
            </div>
          )}
        </div>

        {/* Profile Sidebar */}
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-center text-lg font-bold text-foreground">My Profile</h2>
            <BadgeDisplay totalPoints={85} />
          </div>
        </div>
      </div>
    </div>
  );
}
