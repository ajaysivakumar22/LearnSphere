'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAPICache } from './api-cache';

/**
 * OPTIMIZED DATA FETCHING HOOKS — LearnSphere
 * 
 * Custom hooks for efficient data fetching with:
 * - Automatic caching
 * - Background refresh
 * - Optimistic loading states
 * - Request deduplication
 */

interface UseCachedFetchOptions {
    ttlMs?: number;
    enabled?: boolean;
    refetchOnMount?: boolean;
    staleWhileRevalidate?: boolean;
}

interface UseCachedFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (forceRefresh?: boolean) => Promise<void>;
}

/**
 * Hook for fetching data with caching support
 */
export function useCachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: UseCachedFetchOptions = {}
): UseCachedFetchResult<T> {
    const {
        ttlMs = 30_000,
        enabled = true,
        refetchOnMount = true,
        staleWhileRevalidate = true,
    } = options;

    const { fetchWithCache, get } = useAPICache();
    const [data, setData] = useState<T | null>(() => get<T>(key));
    const [loading, setLoading] = useState<boolean>(!get<T>(key) && enabled);
    const [error, setError] = useState<string | null>(null);
    const isInitialMount = useRef(true);
    const fetchInProgress = useRef(false);

    const refetch = useCallback(async (forceRefresh: boolean = false) => {
        if (!enabled || fetchInProgress.current) return;

        fetchInProgress.current = true;

        // If we have cached data and staleWhileRevalidate, show it immediately
        const cached = get<T>(key);
        if (staleWhileRevalidate && cached && !forceRefresh) {
            setData(cached);
            setLoading(false);
        } else if (!cached) {
            setLoading(true);
        }

        setError(null);

        try {
            const result = await fetchWithCache<T>(key, fetcher, { ttlMs, forceRefresh });
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
            fetchInProgress.current = false;
        }
    }, [key, fetcher, ttlMs, enabled, staleWhileRevalidate, fetchWithCache, get]);

    useEffect(() => {
        if (!enabled) return;

        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (refetchOnMount || !get<T>(key)) {
                refetch();
            }
        }
    }, [enabled, refetchOnMount, refetch, key, get]);

    return { data, loading, error, refetch };
}

/**
 * Hook for parallel fetching of multiple resources
 */
export function useParallelFetch<T extends Record<string, unknown>>(
    fetchers: Record<keyof T, { key: string; fetcher: () => Promise<unknown> }>,
    options: UseCachedFetchOptions = {}
): {
    data: Partial<T>;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
} {
    const { fetchWithCache, get } = useAPICache();
    const [data, setData] = useState<Partial<T>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        const entries = Object.entries(fetchers) as [keyof T, { key: string; fetcher: () => Promise<unknown> }][];

        try {
            const results = await Promise.all(
                entries.map(async ([name, { key, fetcher }]) => {
                    const result = await fetchWithCache(key, fetcher, options);
                    return [name, result] as const;
                })
            );

            const newData = Object.fromEntries(results) as Partial<T>;
            setData(newData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [fetchers, fetchWithCache, options]);

    useEffect(() => {
        // Check if we have all cached data
        const entries = Object.entries(fetchers) as [keyof T, { key: string; fetcher: () => Promise<unknown> }][];
        const cachedData: Partial<T> = {};
        let allCached = true;

        for (const [name, { key }] of entries) {
            const cached = get(key);
            if (cached !== null) {
                cachedData[name] = cached as T[keyof T];
            } else {
                allCached = false;
            }
        }

        if (allCached && Object.keys(cachedData).length > 0) {
            setData(cachedData);
            setLoading(false);
        } else {
            refetch();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { data, loading, error, refetch };
}

/**
 * Prefetch data for anticipated navigation
 */
export function usePrefetch() {
    const { fetchWithCache } = useAPICache();

    return useCallback((key: string, fetcher: () => Promise<unknown>, ttlMs: number = 30_000) => {
        // Fire and forget - don't await
        fetchWithCache(key, fetcher, { ttlMs }).catch(() => {
            // Silent fail for prefetch
        });
    }, [fetchWithCache]);
}

/**
 * Hook for enrollments with caching
 */
export function useEnrollments() {
    return useCachedFetch<{ enrollments: { id: string; courseId: string; status: string }[] }>(
        '/api/enrollments',
        async () => {
            const res = await fetch('/api/enrollments');
            if (!res.ok) throw new Error('Failed to fetch enrollments');
            return res.json();
        },
        { ttlMs: 30_000, staleWhileRevalidate: true }
    );
}

/**
 * Hook for user data with caching
 */
export function useUserData() {
    return useCachedFetch<{ id: string; role: string; name: string; email: string; totalPoints: number }>(
        '/api/auth/me',
        async () => {
            const res = await fetch('/api/auth/me');
            if (!res.ok) throw new Error('Failed to fetch user data');
            return res.json();
        },
        { ttlMs: 60_000, staleWhileRevalidate: true }
    );
}
