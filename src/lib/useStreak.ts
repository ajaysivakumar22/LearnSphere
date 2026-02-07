'use client';

import { useState, useEffect, useCallback } from 'react';

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

/* ── Standalone function (call from any page) ─────────────────────── */

/**
 * Records a learning activity for today.
 * Safe to call multiple times — only the first call per calendar day
 * (in the selected timezone) increments the streak.
 */
export function markLearningActivity(): void {
  if (typeof window === 'undefined') return;
  try {
    const tz = localStorage.getItem('streak_timezone') || 'UTC';
    const today = getTodayInTimezone(tz);
    const raw = localStorage.getItem('streak_data');
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
    localStorage.setItem('streak_data', JSON.stringify(data));
  } catch {
    /* SSR / private browsing */
  }
}

/* ── React hook (use in components that render streak UI) ──────────── */

export function useStreak() {
  const [timezone, setTimezone] = useState('UTC');
  const [streak, setStreak] = useState<StreakState>(EMPTY_STREAK);

  /** Read localStorage and reconcile with the given timezone. */
  const refreshStreak = useCallback((tz: string) => {
    try {
      const raw = localStorage.getItem('streak_data');
      if (!raw) return;
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
      /* ignore */
    }
  }, []);

  // Hydrate on mount
  useEffect(() => {
    const savedTz = localStorage.getItem('streak_timezone') || 'UTC';
    setTimezone(savedTz);
    refreshStreak(savedTz);
  }, [refreshStreak]);

  const changeTimezone = useCallback(
    (tz: string) => {
      setTimezone(tz);
      localStorage.setItem('streak_timezone', tz);
      refreshStreak(tz);
    },
    [refreshStreak],
  );

  const doMarkActivity = useCallback(() => {
    markLearningActivity();
    refreshStreak(timezone);
  }, [timezone, refreshStreak]);

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
