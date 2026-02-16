'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, User, Loader2, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCachedFetch } from '@/lib/use-cached-fetch';

interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string | null;
  isPublished: boolean;
  viewsCount: number;
  duration: string;
  rating: number;
  contentsCount: number;
  isPaid?: boolean;
  price?: number;
}

interface Enrollment {
  id: string;
  courseId: string;
  status: string;
}

export default function ExplorePage() {
  const { isLoggedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Optimized: Use cached fetch for courses - shows cached data instantly
  const { data: courses, loading: coursesLoading, error: coursesError } = useCachedFetch<Course[]>(
    '/api/courses',
    async () => {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const json = await res.json();
      return Array.isArray(json) ? json : json.data;
    },
    { ttlMs: 30_000, staleWhileRevalidate: true }
  );

  // Optimized: Use cached fetch for enrollments
  const { data: enrollmentsData } = useCachedFetch<{ enrollments: Enrollment[] }>(
    '/api/enrollments',
    async () => {
      const res = await fetch('/api/enrollments');
      if (!res.ok) throw new Error('Failed to fetch enrollments');
      return res.json();
    },
    { ttlMs: 30_000, enabled: isLoaded && isLoggedIn, staleWhileRevalidate: true }
  );

  const enrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];
    return enrollmentsData.enrollments.map((e: { id: string; courseId?: string }) => ({
      id: e.id,
      courseId: e.courseId || e.id,
      status: 'enrolled',
    }));
  }, [enrollmentsData]);

  // Enrolling state
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  // Only show published courses - memoized for performance
  const publishedCourses = useMemo<Course[]>(() => {
    // Handle both array (legacy) and object response (paginated)
    // Cast to unknown first to avoid TS errors if types conflict, then safely extract data
    const raw = courses as unknown;
    const list: Course[] = Array.isArray(raw)
      ? (raw as Course[])
      : (raw as { data: Course[] })?.data || [];

    return list.filter((c) => c.isPublished);
  }, [courses]);

  const allTags = useMemo(() =>
    Array.from(new Set(publishedCourses.flatMap((c) => c.tags || []))),
    [publishedCourses]
  );

  const filtered = useMemo(() =>
    publishedCourses.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || (c.tags || []).includes(selectedTag);
      return matchesSearch && matchesTag;
    }),
    [publishedCourses, searchQuery, selectedTag]
  );

  const isEnrolled = (courseId: string) => {
    return enrollments.some((e: Enrollment) => e.courseId === courseId || e.id === courseId);
  };

  const handleEnroll = async (course: Course) => {
    if (!isLoggedIn) {
      router.push('/sign-in');
      return;
    }

    // Check if already enrolled
    if (isEnrolled(course.id)) {
      router.push(`/learner/courses/${course.id}/learn`);
      return;
    }

    setEnrollingCourseId(course.id);
    setEnrollmentError(null);

    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });

      if (res.ok) {
        // Navigate to the course - cache will be refreshed on next visit
        router.push(`/learner/courses/${course.id}/learn`);
      } else {
        const error = await res.json();
        if (res.status === 409) {
          // Already enrolled - navigate anyway
          router.push(`/learner/courses/${course.id}/learn`);
        } else {
          setEnrollmentError(error.error || 'Failed to enroll');
        }
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      setEnrollmentError('Failed to enroll. Please try again.');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const getButtonState = (course: Course) => {
    const enrolled = isEnrolled(course.id);
    const isEnrolling = enrollingCourseId === course.id;

    if (isEnrolling) {
      return {
        label: 'Enrolling...',
        icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
        variant: 'outline' as const,
        disabled: true,
      };
    }

    if (enrolled) {
      return {
        label: 'Continue Learning',
        icon: <CheckCircle className="mr-2 h-4 w-4" />,
        variant: 'odoo' as const,
        disabled: false,
      };
    }

    if (!isLoggedIn) {
      return {
        label: 'Sign In to Enroll',
        icon: <User className="mr-2 h-4 w-4" />,
        variant: 'outline' as const,
        disabled: false,
      };
    }

    return {
      label: 'Enroll & Start Learning',
      icon: null,
      variant: 'odoo' as const,
      disabled: false,
    };
  };

  // Loading state
  if (coursesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Explore Courses</h1>

      {/* Catalog Info Banner - Explains shared catalog vs user-specific progress */}
      <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300">
              Public Course Catalog
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This catalog shows all published courses available to everyone.
              {isLoggedIn ? (
                <span className="text-foreground"> Your personal progress, enrollments, and completions are tracked separately in your account and will not be visible to other learners.</span>
              ) : (
                <span className="text-foreground"> Sign in to enroll in courses, track your progress, earn points, and save your learning journey.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Error states */}
      {coursesError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {coursesError}
        </div>
      )}

      {enrollmentError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {enrollmentError}
          <button
            onClick={() => setEnrollmentError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${!selectedTag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${selectedTag === tag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course, index) => {
          const btnState = getButtonState(course);
          const enrolled = isEnrolled(course.id);

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
                <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40">
                  {enrolled && (
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Enrolled
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{course.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{course.description || 'No description available.'}</p>

                  <div className="mb-3 flex flex-wrap gap-1">
                    {(course.tags || []).map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{course.viewsCount || 0} views</span>
                    <span>{course.contentsCount || 0} lessons</span>
                    <span>⭐ {course.rating?.toFixed(1) || '0.0'}</span>
                  </div>

                  {/* User-specific data notice */}
                  {isLoggedIn && enrolled && (
                    <div className="mb-3 flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1.5 text-xs text-green-700 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      <span>You are enrolled in this course</span>
                    </div>
                  )}

                  <Button
                    variant={btnState.variant}
                    className="w-full"
                    disabled={btnState.disabled}
                    onClick={() => handleEnroll(course)}
                  >
                    {btnState.icon}
                    {btnState.label}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && !coursesLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">No courses found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || selectedTag
              ? 'Try a different search or tag filter.'
              : 'No published courses are available yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
