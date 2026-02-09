'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, BookOpen, Clock, Star, Zap, Target, Loader2, Award, CheckCircle, TrendingUp, Flame } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCachedFetch } from '@/lib/use-cached-fetch';

interface Enrollment {
  id: string;
  status: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
}

interface UserData {
  totalPoints?: number;
  createdAt?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  emoji: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  category: 'learning' | 'consistency' | 'mastery';
}

export default function AchievementsPage() {
  const { isLoggedIn, isLoaded } = useAuth();

  // Fetch user enrollments
  const { data: enrollmentsData, loading: enrollmentsLoading } = useCachedFetch<{ enrollments: Enrollment[] }>(
    '/api/enrollments',
    async () => {
      const res = await fetch('/api/enrollments');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    { ttlMs: 30_000, enabled: isLoaded && isLoggedIn, staleWhileRevalidate: true }
  );

  // Fetch user data
  const { data: userData, loading: userLoading } = useCachedFetch<UserData>(
    '/api/auth/me',
    async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    { ttlMs: 60_000, enabled: isLoaded && isLoggedIn, staleWhileRevalidate: true }
  );

  const enrollments = enrollmentsData?.enrollments || [];
  const totalPoints = userData?.totalPoints || 0;

  // Calculate achievement metrics
  const metrics = useMemo(() => {
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const totalEnrolled = enrollments.length;
    const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + (e.lessonsCompleted || 0), 0);
    const perfectScoreCourses = enrollments.filter(e => e.progress === 100).length;

    return {
      completedCourses,
      totalEnrolled,
      totalLessonsCompleted,
      perfectScoreCourses,
      totalPoints,
    };
  }, [enrollments, totalPoints]);

  // Dynamic achievements based on user progress
  const achievements: Achievement[] = useMemo(() => [
    {
      id: 'first_course',
      title: 'First Steps',
      description: 'Enroll in your first course',
      icon: BookOpen,
      emoji: '📚',
      unlocked: metrics.totalEnrolled >= 1,
      progress: Math.min(metrics.totalEnrolled, 1),
      maxProgress: 1,
      category: 'learning',
    },
    {
      id: 'course_completed',
      title: 'Course Completed',
      description: 'Complete your first course',
      icon: CheckCircle,
      emoji: '✅',
      unlocked: metrics.completedCourses >= 1,
      progress: Math.min(metrics.completedCourses, 1),
      maxProgress: 1,
      category: 'learning',
    },
    {
      id: 'five_courses',
      title: 'Eager Learner',
      description: 'Complete 5 courses',
      icon: TrendingUp,
      emoji: '📈',
      unlocked: metrics.completedCourses >= 5,
      progress: Math.min(metrics.completedCourses, 5),
      maxProgress: 5,
      category: 'learning',
    },
    {
      id: 'ten_courses',
      title: 'Knowledge Seeker',
      description: 'Complete 10 courses',
      icon: Award,
      emoji: '🏅',
      unlocked: metrics.completedCourses >= 10,
      progress: Math.min(metrics.completedCourses, 10),
      maxProgress: 10,
      category: 'learning',
    },
    {
      id: 'fifty_points',
      title: 'Point Collector',
      description: 'Earn 50 points',
      icon: Star,
      emoji: '⭐',
      unlocked: metrics.totalPoints >= 50,
      progress: Math.min(metrics.totalPoints, 50),
      maxProgress: 50,
      category: 'mastery',
    },
    {
      id: 'hundred_points',
      title: 'Point Master',
      description: 'Earn 100 points',
      icon: Trophy,
      emoji: '🏆',
      unlocked: metrics.totalPoints >= 100,
      progress: Math.min(metrics.totalPoints, 100),
      maxProgress: 100,
      category: 'mastery',
    },
    {
      id: 'perfect_score',
      title: 'Perfectionist',
      description: 'Complete a course with 100% progress',
      icon: Target,
      emoji: '🎯',
      unlocked: metrics.perfectScoreCourses >= 1,
      progress: Math.min(metrics.perfectScoreCourses, 1),
      maxProgress: 1,
      category: 'mastery',
    },
    {
      id: 'ten_lessons',
      title: 'Lesson Champ',
      description: 'Complete 10 lessons',
      icon: Zap,
      emoji: '⚡',
      unlocked: metrics.totalLessonsCompleted >= 10,
      progress: Math.min(metrics.totalLessonsCompleted, 10),
      maxProgress: 10,
      category: 'consistency',
    },
    {
      id: 'explorer',
      title: 'Explorer',
      description: 'Enroll in 3 different courses',
      icon: Flame,
      emoji: '🔥',
      unlocked: metrics.totalEnrolled >= 3,
      progress: Math.min(metrics.totalEnrolled, 3),
      maxProgress: 3,
      category: 'consistency',
    },
  ], [metrics]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  // Badge tier based on unlocked achievements
  const getBadgeTier = () => {
    if (unlockedCount >= 8) return { name: 'Legend', color: 'from-yellow-400 to-amber-600', emoji: '👑' };
    if (unlockedCount >= 6) return { name: 'Master', color: 'from-purple-500 to-pink-500', emoji: '💎' };
    if (unlockedCount >= 4) return { name: 'Expert', color: 'from-blue-500 to-cyan-500', emoji: '💫' };
    if (unlockedCount >= 2) return { name: 'Learner', color: 'from-green-500 to-emerald-500', emoji: '🌟' };
    return { name: 'Beginner', color: 'from-gray-400 to-gray-600', emoji: '🌱' };
  };

  const badgeTier = getBadgeTier();

  const loading = enrollmentsLoading || userLoading;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Achievements</h1>
        <p className="text-muted-foreground">Track your learning progress and unlock achievements</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Badge Display */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-lg"
          >
            {/* Current Badge */}
            <div className="mb-6 flex flex-col items-center">
              <div className={`mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${badgeTier.color} text-5xl shadow-xl`}>
                {badgeTier.emoji}
              </div>
              <h2 className="text-2xl font-bold text-foreground">{badgeTier.name}</h2>
              <p className="text-sm text-muted-foreground">Current Tier</p>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Total Points</span>
                <span className="text-lg font-bold text-primary">{metrics.totalPoints}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Courses Completed</span>
                <span className="text-lg font-bold text-green-600">{metrics.completedCourses}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Lessons Done</span>
                <span className="text-lg font-bold text-blue-600">{metrics.totalLessonsCompleted}</span>
              </div>
            </div>

            {/* Progress to next tier */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Achievements Unlocked</span>
                <span className="font-medium text-foreground">{unlockedCount}/{totalAchievements}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${badgeTier.color}`}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              const progressPercent = achievement.maxProgress
                ? Math.round((achievement.progress! / achievement.maxProgress) * 100)
                : 0;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md ${!achievement.unlocked ? 'opacity-60 grayscale' : ''
                    }`}
                >
                  {/* Unlocked glow effect */}
                  {achievement.unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  )}

                  <div className="relative flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl ${achievement.unlocked
                          ? 'bg-gradient-to-br from-primary/20 to-purple-500/20'
                          : 'bg-muted'
                        }`}
                    >
                      {achievement.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                      <p className="mb-2 text-sm text-muted-foreground">{achievement.description}</p>

                      {/* Progress bar */}
                      {achievement.maxProgress && (
                        <div className="mt-2">
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                            <span className={achievement.unlocked ? 'text-green-600' : 'text-muted-foreground'}>
                              {progressPercent}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.5, delay: index * 0.05 }}
                              className={`h-full rounded-full ${achievement.unlocked
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : 'bg-muted-foreground/30'
                                }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unlocked badge */}
                  {achievement.unlocked && (
                    <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm text-white shadow-lg">
                      ✓
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Empty state */}
          {!isLoggedIn && (
            <div className="mt-8 rounded-xl border-2 border-dashed border-border p-12 text-center">
              <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">Sign in to track achievements</h3>
              <p className="text-muted-foreground">Complete courses and earn points to unlock achievements</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
