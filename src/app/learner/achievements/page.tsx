'use client';

import { motion } from 'framer-motion';
import BadgeDisplay from '@/components/learner/BadgeDisplay';
import { Trophy, BookOpen, Clock, Star, Zap, Target } from 'lucide-react';

const achievements = [
  { title: 'First Course Completed', description: 'Complete your first course', unlocked: true, icon: BookOpen, emoji: '📖' },
  { title: 'Quiz Master', description: 'Score 100% on any quiz', unlocked: true, icon: Star, emoji: '🧠' },
  { title: 'Speed Learner', description: 'Complete a course in under 1 hour', unlocked: false, icon: Zap, emoji: '⚡' },
  { title: 'Top Achiever', description: 'Reach 100 total points', unlocked: false, icon: Trophy, emoji: '🏆' },
  { title: 'Consistent Learner', description: 'Log in 7 days in a row', unlocked: false, icon: Target, emoji: '🎯' },
  { title: 'Time Master', description: 'Spend 50+ hours learning', unlocked: false, icon: Clock, emoji: '⏰' },
];

export default function AchievementsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Achievements</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Badge Display */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <BadgeDisplay totalPoints={85} />
          </div>
        </div>

        {/* Achievements List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-xl border border-border bg-card p-6 shadow-sm transition-opacity ${
                    !achievement.unlocked ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                        achievement.unlocked
                          ? 'bg-primary/10'
                          : 'bg-muted'
                      }`}
                    >
                      {achievement.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="mt-3 text-xs font-medium text-green-600 dark:text-green-400">✓ Unlocked</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
