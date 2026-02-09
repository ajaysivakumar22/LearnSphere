'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAPICache, CACHE_KEYS } from '@/lib/api-cache';

/**
 * OPTIMIZED Course interface matching the API response
 */
export interface Course {
    id: string;
    title: string;
    description: string;
    tags: string[];
    imageUrl: string | null;
    isPublished: boolean;
    viewsCount: number;
    duration: string;
    rating: number;
    contentsCount: number;
    createdBy: string;
    createdAt: string;
    creatorRole?: string;
    scheduledPublishDate?: string;
    assignedInstructor?: string;
    price: number;
    currency: string;
    isPaid: boolean;
}

interface CourseAPIContextType {
    courses: Course[];
    loading: boolean;
    error: string | null;
    refresh: (forceRefresh?: boolean) => Promise<void>;
    createCourse: (title: string, description?: string, tags?: string[], scheduledPublishDate?: string, assignedInstructor?: string, price?: number, currency?: string, isPaid?: boolean) => Promise<Course | null>;
    updateCourse: (id: string, updates: Partial<Course>) => Promise<Course | null>;
    deleteCourse: (id: string) => Promise<boolean>;
    togglePublish: (id: string) => Promise<boolean>;
    prefetch: () => void;
}

const CourseAPIContext = createContext<CourseAPIContextType>({
    courses: [],
    loading: true,
    error: null,
    refresh: async () => { },
    createCourse: async () => null,
    updateCourse: async () => null,
    deleteCourse: async () => false,
    togglePublish: async () => false,
    prefetch: () => { },
});

export function useCourseAPI() {
    return useContext(CourseAPIContext);
}

export function CourseAPIProvider({ children }: { children: React.ReactNode }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { fetchWithCache, invalidate, set, get } = useAPICache();
    const isInitialMount = useRef(true);
    const fetchInProgress = useRef(false);

    // Optimized fetch with caching
    const refresh = useCallback(async (forceRefresh: boolean = false) => {
        // Prevent duplicate fetches
        if (fetchInProgress.current && !forceRefresh) {
            return;
        }

        fetchInProgress.current = true;

        try {
            // Don't show loading spinner for cache hits
            const cached = get<Course[]>(CACHE_KEYS.COURSES);
            if (!forceRefresh && cached) {
                setCourses(cached);
                setLoading(false);
                fetchInProgress.current = false;
                return;
            }

            if (!cached) {
                setLoading(true);
            }
            setError(null);

            const data = await fetchWithCache<Course[]>(
                CACHE_KEYS.COURSES,
                async () => {
                    const res = await fetch('/api/courses');
                    if (!res.ok) {
                        throw new Error('Failed to fetch courses');
                    }
                    return res.json();
                },
                { forceRefresh, ttlMs: 30_000 } // 30 second cache
            );

            setCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch courses');
        } finally {
            setLoading(false);
            fetchInProgress.current = false;
        }
    }, [fetchWithCache, get]);

    // Prefetch function for route transitions
    const prefetch = useCallback(() => {
        // Trigger a background fetch without updating loading state
        const cached = get<Course[]>(CACHE_KEYS.COURSES);
        if (!cached) {
            fetchWithCache<Course[]>(
                CACHE_KEYS.COURSES,
                async () => {
                    const res = await fetch('/api/courses');
                    if (!res.ok) throw new Error('Failed to fetch');
                    return res.json();
                },
                { ttlMs: 30_000 }
            ).then(data => {
                setCourses(data);
            }).catch(() => {
                // Silent fail for prefetch
            });
        }
    }, [fetchWithCache, get]);

    // Initial fetch - only once
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            refresh();
        }
    }, [refresh]);

    // Optimized create with instant UI update
    const createCourse = useCallback(async (title: string, description?: string, tags?: string[], scheduledPublishDate?: string, assignedInstructor?: string, price?: number, currency?: string, isPaid?: boolean): Promise<Course | null> => {
        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, description, tags,
                    scheduledPublishDate, assignedInstructor,
                    price: price ?? 0,
                    currency: currency ?? 'INR',
                    isPaid: isPaid ?? false
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create course');
            }

            const newCourse = await res.json();

            // Optimistic update - add to local state immediately
            setCourses(prev => {
                const updated = [newCourse, ...prev];
                // Update cache with new data
                set(CACHE_KEYS.COURSES, updated, 30_000);
                return updated;
            });

            return newCourse;
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err instanceof Error ? err.message : 'Failed to create course');
            return null;
        }
    }, [set]);

    // Optimized update with instant UI update
    const updateCourse = useCallback(async (id: string, updates: Partial<Course>): Promise<Course | null> => {
        // Optimistic update - update UI immediately
        const originalCourses = [...courses];
        setCourses(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
            set(CACHE_KEYS.COURSES, updated, 30_000);
            return updated;
        });

        try {
            const res = await fetch(`/api/courses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!res.ok) {
                // Rollback on error
                setCourses(originalCourses);
                set(CACHE_KEYS.COURSES, originalCourses, 30_000);
                const error = await res.json();
                throw new Error(error.error || 'Failed to update course');
            }

            const updatedCourse = await res.json();

            // Confirm with actual server data
            setCourses(prev => {
                const updated = prev.map(c => c.id === id ? { ...c, ...updatedCourse } : c);
                set(CACHE_KEYS.COURSES, updated, 30_000);
                return updated;
            });

            return updatedCourse;
        } catch (err) {
            console.error('Error updating course:', err);
            setError(err instanceof Error ? err.message : 'Failed to update course');
            return null;
        }
    }, [courses, set]);

    // Optimized delete with instant UI update
    const deleteCourse = useCallback(async (id: string): Promise<boolean> => {
        // Optimistic update
        const originalCourses = [...courses];
        setCourses(prev => {
            const updated = prev.filter(c => c.id !== id);
            set(CACHE_KEYS.COURSES, updated, 30_000);
            return updated;
        });

        try {
            const res = await fetch(`/api/courses/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                // Rollback on error
                setCourses(originalCourses);
                set(CACHE_KEYS.COURSES, originalCourses, 30_000);
                const error = await res.json();
                throw new Error(error.error || 'Failed to delete course');
            }

            // Invalidate related caches
            invalidate(CACHE_KEYS.course(id));

            return true;
        } catch (err) {
            console.error('Error deleting course:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete course');
            return false;
        }
    }, [courses, set, invalidate]);

    // Optimized toggle publish with instant UI update
    const togglePublish = useCallback(async (id: string): Promise<boolean> => {
        const course = courses.find(c => c.id === id);
        if (!course) return false;

        const updated = await updateCourse(id, { isPublished: !course.isPublished });
        return updated !== null;
    }, [courses, updateCourse]);

    return (
        <CourseAPIContext.Provider value={{
            courses,
            loading,
            error,
            refresh,
            createCourse,
            updateCourse,
            deleteCourse,
            togglePublish,
            prefetch,
        }}>
            {children}
        </CourseAPIContext.Provider>
    );
}
