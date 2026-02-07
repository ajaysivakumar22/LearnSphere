'use client';

import { motion } from 'framer-motion';
import { getBadgeLevel } from '@/lib/utils';
import { cn } from '@/lib/utils';

const badges = [
  { name: 'Starter', points: 0, emoji: '🌱', color: 'from-gray-400 to-gray-600' },
  { name: 'Newbie', points: 10, emoji: '🟢', color: 'from-green-400 to-green-600' },
  { name: 'Explorer', points: 40, emoji: '🧭', color: 'from-blue-400 to-blue-600' },
  { name: 'Achiever', points: 80, emoji: '⭐', color: 'from-yellow-400 to-yellow-600' },
  { name: 'Specialist', points: 150, emoji: '🎯', color: 'from-purple-400 to-purple-600' },
  { name: 'Expert', points: 250, emoji: '👑', color: 'from-orange-400 to-orange-600' },
  { name: 'Master', points: 350, emoji: '🏆', color: 'from-red-400 to-red-600' },
  { name: 'Legend', points: 500, emoji: '💎', color: 'from-cyan-400 to-cyan-600' },
];

export default function BadgeDisplay({ totalPoints }: { totalPoints: number }) {
  const currentBadge = getBadgeLevel(totalPoints);
  const maxPoints = 500;
  const progressAngle = Math.min((totalPoints / maxPoints) * 360, 360);

  return (
    <div className="space-y-5">
      {/* Circular points display */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative mx-auto inline-flex items-center justify-center"
        >
          <div className="relative h-36 w-36">
            {/* Background circle */}
            <svg className="h-full w-full -rotate-90" viewBox="0 0 144 144">
              <circle
                cx="72" cy="72" r="62"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted"
              />
              <circle
                cx="72" cy="72" r="62"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(progressAngle / 360) * 2 * Math.PI * 62} ${2 * Math.PI * 62}`}
                className="text-primary"
                stroke="url(#badgeGradient)"
              />
              <defs>
                <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">Total</span>
              <span className="text-3xl font-extrabold text-primary">{totalPoints}</span>
              <span className="text-xs font-medium text-muted-foreground">Points</span>
            </div>
          </div>
        </motion.div>
        <h3 className="mt-3 text-lg font-bold text-foreground">{currentBadge}</h3>
      </div>

      {/* Badges list */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Badges</h4>
        {badges.map((badge) => {
          const isUnlocked = totalPoints >= badge.points;
          const isCurrent = currentBadge === badge.name;
          return (
            <div
              key={badge.name}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors',
                isCurrent
                  ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                  : 'border-border',
                !isUnlocked && 'opacity-50'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{badge.emoji}</span>
                <div>
                  <p className={cn('text-sm font-medium', isCurrent ? 'text-primary' : 'text-foreground')}>
                    {badge.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{badge.points} Points</p>
                </div>
              </div>
              {isUnlocked && (
                <span className="text-sm text-green-500">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
