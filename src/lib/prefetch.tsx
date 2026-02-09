'use client';

import { useEffect } from 'react';
import { useAPICache, CACHE_KEYS } from './api-cache';

/**
 * ROUTE PREFETCHING — LearnSphere Performance Optimization
 * 
 * Prefetches data for anticipated navigation targets to make
 * page transitions feel instant.
 */

// Common routes and their data requirements
const PREFETCH_ROUTES = {
    '/learner/explore': [CACHE_KEYS.COURSES],
    '/learner/my-courses': [CACHE_KEYS.COURSES, CACHE_KEYS.ENROLLMENTS],
    '/learner/profile': [CACHE_KEYS.USER_ME, CACHE_KEYS.ENROLLMENTS],
    '/admin/courses': [CACHE_KEYS.COURSES],
} as const;

// Fetchers for each cache key
const FETCHERS: Record<string, () => Promise<unknown>> = {
    [CACHE_KEYS.COURSES]: async () => {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    },
    [CACHE_KEYS.ENROLLMENTS]: async () => {
        const res = await fetch('/api/enrollments');
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    },
    [CACHE_KEYS.USER_ME]: async () => {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    },
};

/**
 * Hook to prefetch data for a route on hover/focus
 */
export function usePrefetchRoute() {
    const { fetchWithCache, get } = useAPICache();

    return (route: string) => {
        const keys = PREFETCH_ROUTES[route as keyof typeof PREFETCH_ROUTES];
        if (!keys) return;

        // Prefetch all required data for this route
        for (const key of keys) {
            // Only prefetch if not already cached
            if (get(key) === null) {
                const fetcher = FETCHERS[key];
                if (fetcher) {
                    fetchWithCache(key, fetcher, { ttlMs: 30_000 }).catch(() => {
                        // Silent fail for prefetch
                    });
                }
            }
        }
    };
}

/**
 * Component to prefetch data when user hovers over navigation links
 */
export function PrefetchOnHover({
    route,
    children,
    className,
}: {
    route: string;
    children: React.ReactNode;
    className?: string;
}) {
    const prefetch = usePrefetchRoute();

    return (
        <div
            onMouseEnter={() => prefetch(route)}
            onFocus={() => prefetch(route)}
            className={className}
        >
            {children}
        </div>
    );
}

/**
 * Prefetch common routes on app load for instant navigation
 */
export function PrefetchCommonRoutes() {
    const { fetchWithCache, get } = useAPICache();

    useEffect(() => {
        // Delay prefetch to not block initial render
        const timer = setTimeout(() => {
            // Prefetch courses (most commonly accessed)
            if (get(CACHE_KEYS.COURSES) === null) {
                fetchWithCache(CACHE_KEYS.COURSES, FETCHERS[CACHE_KEYS.COURSES], {
                    ttlMs: 30_000,
                }).catch(() => {
                    // Silent fail
                });
            }
        }, 2000); // Wait 2 seconds after initial load

        return () => clearTimeout(timer);
    }, [fetchWithCache, get]);

    return null;
}
