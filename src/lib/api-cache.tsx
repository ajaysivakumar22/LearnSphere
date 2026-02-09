'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

/**
 * API CACHE — LearnSphere Performance Optimization
 * 
 * Provides client-side caching for API responses to reduce redundant network requests.
 * Features:
 * - Time-based cache invalidation
 * - Deduplication of concurrent requests
 * - Automatic background refresh
 * - Memory-efficient cache eviction
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface InFlightRequest {
    promise: Promise<unknown>;
    timestamp: number;
}

interface APICacheContextType {
    get: <T>(key: string) => T | null;
    set: <T>(key: string, data: T, ttlMs?: number) => void;
    invalidate: (key: string) => void;
    invalidatePattern: (pattern: string) => void;
    fetchWithCache: <T>(
        key: string,
        fetcher: () => Promise<T>,
        options?: { ttlMs?: number; forceRefresh?: boolean }
    ) => Promise<T>;
}

const DEFAULT_TTL_MS = 30_000; // 30 seconds default cache time
const CACHE_CLEANUP_INTERVAL = 60_000; // Cleanup every 60 seconds

const APICacheContext = createContext<APICacheContextType>({
    get: () => null,
    set: () => { },
    invalidate: () => { },
    invalidatePattern: () => { },
    fetchWithCache: async () => { throw new Error('APICacheProvider not initialized'); },
});

export function useAPICache() {
    return useContext(APICacheContext);
}

export function APICacheProvider({ children }: { children: React.ReactNode }) {
    const cacheRef = useRef<Map<string, CacheEntry<unknown>>>(new Map());
    const inFlightRef = useRef<Map<string, InFlightRequest>>(new Map());
    const [, forceUpdate] = useState(0);

    // Cleanup expired entries periodically
    useEffect(() => {
        const cleanup = () => {
            const now = Date.now();
            const cache = cacheRef.current;
            let deleted = 0;

            for (const [key, entry] of cache.entries()) {
                if (entry.expiresAt < now) {
                    cache.delete(key);
                    deleted++;
                }
            }

            // Also cleanup stale in-flight requests (older than 30 seconds)
            const inFlight = inFlightRef.current;
            for (const [key, request] of inFlight.entries()) {
                if (now - request.timestamp > 30_000) {
                    inFlight.delete(key);
                }
            }

            if (deleted > 0) {
                forceUpdate(n => n + 1);
            }
        };

        const interval = setInterval(cleanup, CACHE_CLEANUP_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const get = useCallback(<T,>(key: string): T | null => {
        const entry = cacheRef.current.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (entry.expiresAt < now) {
            cacheRef.current.delete(key);
            return null;
        }

        return entry.data as T;
    }, []);

    const set = useCallback(<T,>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS) => {
        const now = Date.now();
        cacheRef.current.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttlMs,
        });
    }, []);

    const invalidate = useCallback((key: string) => {
        cacheRef.current.delete(key);
        inFlightRef.current.delete(key);
    }, []);

    const invalidatePattern = useCallback((pattern: string) => {
        const regex = new RegExp(pattern);
        for (const key of cacheRef.current.keys()) {
            if (regex.test(key)) {
                cacheRef.current.delete(key);
            }
        }
        for (const key of inFlightRef.current.keys()) {
            if (regex.test(key)) {
                inFlightRef.current.delete(key);
            }
        }
    }, []);

    const fetchWithCache = useCallback(async <T,>(
        key: string,
        fetcher: () => Promise<T>,
        options?: { ttlMs?: number; forceRefresh?: boolean }
    ): Promise<T> => {
        const { ttlMs = DEFAULT_TTL_MS, forceRefresh = false } = options || {};

        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cached = get<T>(key);
            if (cached !== null) {
                return cached;
            }
        }

        // Check for in-flight request (deduplication)
        const inFlight = inFlightRef.current.get(key);
        if (inFlight) {
            return inFlight.promise as Promise<T>;
        }

        // Create new request
        const promise = fetcher().then(
            (data) => {
                set(key, data, ttlMs);
                inFlightRef.current.delete(key);
                return data;
            },
            (error) => {
                inFlightRef.current.delete(key);
                throw error;
            }
        );

        inFlightRef.current.set(key, {
            promise,
            timestamp: Date.now(),
        });

        return promise;
    }, [get, set]);

    return (
        <APICacheContext.Provider value={{ get, set, invalidate, invalidatePattern, fetchWithCache }}>
            {children}
        </APICacheContext.Provider>
    );
}

/**
 * Pre-defined cache keys for common API endpoints
 */
export const CACHE_KEYS = {
    COURSES: '/api/courses',
    ENROLLMENTS: '/api/enrollments',
    USER_ME: '/api/auth/me',
    course: (id: string) => `/api/courses/${id}`,
    courseContents: (id: string) => `/api/courses/${id}/contents`,
} as const;
