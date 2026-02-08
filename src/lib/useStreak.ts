'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';

export const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'IST (Asia/Kolkata)', value: 'Asia/Kolkata' },
  { label: 'EST (America/New_York)', value: 'America/New_York' },
  { label: 'PST (America/Los_Angeles)', value: 'America/Los_Angeles' },
  { label: 'CET (Europe/Paris)', value: 'Europe/Paris' },
];

/* ── Date helpers ─────────────────────────────────────────────────── */

function getTodayInTimezone(tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()); // YYYY-MM-DD
}

function getNextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

/* ── Types ────────────────────────────────────────────────────────── */

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  todayCompleted: boolean;
}

const EMPTY_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  todayCompleted: false,
};

/* ── User-specific storage keys ─────────────────────────────────── */

function getStreakDataKey(userId: string | null): string {
  return userId ? `streak_data_${userId}` : 'streak_data_guest';
}

function getStreakTimezoneKey(userId: string | null): string {
  return userId ? `streak_timezone_${userId}` : 'streak_timezone_guest';
}

/* ── Standalone function (call from any page) ─────────────────────── */

/**
 * Records a learning activity for today.
 * Safe to call multiple times — only the first call per calendar day
 * (in the selected timezone) increments the streak.
 * 
 * @param userId - The user's ID for user-specific storage
 */
export function markLearningActivity(userId: string | null = null): void {
  if (typeof window === 'undefined') return;
  try {
    const tzKey = getStreakTimezoneKey(userId);
    const dataKey = getStreakDataKey(userId);

    const tz = localStorage.getItem(tzKey) || 'UTC';
    const today = getTodayInTimezone(tz);
    const raw = localStorage.getItem(dataKey);
    const saved: Partial<StreakState> = raw ? JSON.parse(raw) : {};

    if (saved.lastActiveDate === today) return; // already counted today

    let newStreak = 1;
    if (saved.lastActiveDate) {
      const nextDay = getNextDay(saved.lastActiveDate);
      if (today === nextDay) newStreak = (saved.currentStreak ?? 0) + 1;
    }

    const data: StreakState = {
      currentStreak: newStreak,
      longestStreak: Math.max(saved.longestStreak ?? 0, newStreak),
      lastActiveDate: today,
      todayCompleted: true,
    };
    localStorage.setItem(dataKey, JSON.stringify(data));
  } catch {
    /* SSR / private browsing */
  }
}

/* ── React hook (use in components that render streak UI) ──────────── */

export function useStreak() {
  const { userId, isLoggedIn, isLoaded } = useAuth();
  const [timezone, setTimezone] = useState('UTC');
  const [streak, setStreak] = useState<StreakState>(EMPTY_STREAK);

  // Get storage keys based on user ID
  const dataKey = getStreakDataKey(isLoggedIn ? userId : null);
  const tzKey = getStreakTimezoneKey(isLoggedIn ? userId : null);

  /** Read localStorage and reconcile with the given timezone. */
  const refreshStreak = useCallback((tz: string, key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setStreak(EMPTY_STREAK);
        return;
      }
      const saved: StreakState = JSON.parse(raw);
      const today = getTodayInTimezone(tz);
      const todayCompleted = saved.lastActiveDate === today;

      let currentStreak = saved.currentStreak;
      if (saved.lastActiveDate && saved.lastActiveDate !== today) {
        const nextDay = getNextDay(saved.lastActiveDate);
        if (today !== nextDay) currentStreak = 0; // streak broken
      }

      setStreak({
        currentStreak,
        longestStreak: saved.longestStreak,
        lastActiveDate: saved.lastActiveDate,
        todayCompleted,
      });
    } catch {
      setStreak(EMPTY_STREAK);
    }
  }, []);

  // Hydrate on mount and when user changes
  useEffect(() => {
    if (!isLoaded) return;

    const savedTz = localStorage.getItem(tzKey) || 'UTC';
    setTimezone(savedTz);
    refreshStreak(savedTz, dataKey);
  }, [isLoaded, dataKey, tzKey, refreshStreak]);

  const changeTimezone = useCallback(
    (tz: string) => {
      setTimezone(tz);
      localStorage.setItem(tzKey, tz);
      refreshStreak(tz, dataKey);
    },
    [tzKey, dataKey, refreshStreak],
  );

  const doMarkActivity = useCallback(() => {
    markLearningActivity(isLoggedIn ? userId : null);
    refreshStreak(timezone, dataKey);
  }, [isLoggedIn, userId, timezone, dataKey, refreshStreak]);

  return {
    timezone,
    timezones: TIMEZONES,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    todayCompleted: streak.todayCompleted,
    lastActiveDate: streak.lastActiveDate,
    markLearningActivity: doMarkActivity,
    changeTimezone,
  };
}
