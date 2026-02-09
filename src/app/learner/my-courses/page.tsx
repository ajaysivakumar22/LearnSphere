'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Flame, ChevronDown, User, BookOpen, Loader2 } from 'lucide-react';
import CourseCard from '@/components/learner/CourseCard';
import BadgeDisplay from '@/components/learner/BadgeDisplay';
import { useStreak } from '@/lib/useStreak';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  imageUrl: string | null;
  status: 'in_progress' | 'completed' | 'not_started';
  tags?: string[];
  isPaid?: boolean;
  price?: number;
}

interface UserProfile {
  id: string;
  name: string;
  totalPoints: number;
  badgeLevel: string;
}

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoggedIn, isLoaded } = useAuth();
  const {
    timezone, timezones, currentStreak, longestStreak,
    todayCompleted, changeTimezone,
  } = useStreak();

  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's enrolled courses and profile from the API
  useEffect(() => {
    if (!isLoaded || !isLoggedIn) {
      if (isLoaded && !isLoggedIn) setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [enrollmentsRes, profileRes] = await Promise.all([
          fetch('/api/enrollments'),
          fetch('/api/user/me')
        ]);

        if (!enrollmentsRes.ok) {
          if (enrollmentsRes.status === 401) {
            setError('Please sign in to view your courses');
            return;
          }
          throw new Error('Failed to fetch enrollments');
        }

        const enrollmentsData = await enrollmentsRes.json();
        setCourses(enrollmentsData.enrollments || []);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your courses. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoaded, isLoggedIn]);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in prompt for unauthenticated users
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to view your courses</h2>
          <p className="text-muted-foreground text-center mb-6">
            Track your progress, earn points, and continue learning from where you left off.
          </p>
          <Link
            href="/sign-in"
            className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <h1 className="mb-4 text-3xl font-bold text-foreground">My Courses</h1>

          {/* User-Specific Data Notice */}
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Your personal dashboard</span> — Progress, enrollments, and completions shown here are private to your account.
            </p>
          </div>

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

          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Course Grid */}
          {filteredCourses.length > 0 ? (
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
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">No courses enrolled yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Explore our catalog and enroll in courses to start learning!
              </p>
              <Link
                href="/learner/explore"
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* Profile Sidebar */}
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-center text-lg font-bold text-foreground">My Profile</h2>
            {/* Dynamic Badge Display */}
            <BadgeDisplay totalPoints={userProfile?.totalPoints || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}
