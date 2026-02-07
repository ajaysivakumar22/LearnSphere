'use client';

import { Trophy, Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getBadgeLevel } from '@/lib/utils';
import { cn } from '@/lib/utils';

const badges = [
  { name: 'Newbie', points: 20, color: 'bg-gray-500' },
  { name: 'Explorer', points: 40, color: 'bg-blue-500' },
  { name: 'Achiever', points: 60, color: 'bg-green-500' },
  { name: 'Specialist', points: 80, color: 'bg-purple-500' },
  { name: 'Expert', points: 100, color: 'bg-orange-500' },
  { name: 'Master', points: 120, color: 'bg-red-500' },
];

export default function BadgeDisplay({ totalPoints }: { totalPoints: number }) {
  const currentBadge = getBadgeLevel(totalPoints);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative mx-auto inline-flex items-center justify-center"
        >
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
              <div className="text-center">
                <Trophy className="mx-auto h-10 w-10 text-purple-600" />
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalPoints}</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
            </div>
          </div>
        </motion.div>
        <h3 className="mt-4 text-xl font-bold text-gray-900">{currentBadge}</h3>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Badges</h4>
        {badges.map((badge) => {
          const isUnlocked = totalPoints >= badge.points;
          return (
            <div
              key={badge.name}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    isUnlocked ? badge.color : 'bg-gray-200'
                  )}
                >
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{badge.name}</p>
                  <p className="text-xs text-gray-600">{badge.points} Points</p>
                </div>
              </div>
              {isUnlocked && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
