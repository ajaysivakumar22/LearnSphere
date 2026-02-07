'use client';

import { motion } from 'framer-motion';
import BadgeDisplay from '@/components/learner/BadgeDisplay';
import { Trophy, BookOpen, Clock, Star } from 'lucide-react';

const achievements = [
  { title: 'First Course Completed', description: 'Complete your first course', unlocked: true, icon: BookOpen },
  { title: 'Quiz Master', description: 'Score 100% on any quiz', unlocked: true, icon: Star },
  { title: 'Speed Learner', description: 'Complete a course in under 1 hour', unlocked: false, icon: Clock },
  { title: 'Top Achiever', description: 'Reach 100 total points', unlocked: false, icon: Trophy },
];

export default function AchievementsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Achievements</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Badge Display */}
        <div className="lg:col-span-1">
          <div className="card-odoo p-6">
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
                  className={`card-odoo p-6 ${!achievement.unlocked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        achievement.unlocked ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="mt-3 text-xs font-medium text-green-600">✓ Unlocked</div>
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
