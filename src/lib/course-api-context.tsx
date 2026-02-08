'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Course interface matching the API response
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
}

interface CourseAPIContextType {
    courses: Course[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    createCourse: (title: string, description?: string, tags?: string[]) => Promise<Course | null>;
    updateCourse: (id: string, updates: Partial<Course>) => Promise<Course | null>;
    deleteCourse: (id: string) => Promise<boolean>;
    togglePublish: (id: string) => Promise<boolean>;
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
});

export function useCourseAPI() {
    return useContext(CourseAPIContext);
}

export function CourseAPIProvider({ children }: { children: React.ReactNode }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch courses from API
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/courses');
            if (!res.ok) {
                throw new Error('Failed to fetch courses');
            }
            const data = await res.json();
            setCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        refresh();
    }, [refresh]);

    // Create a new course
    const createCourse = useCallback(async (title: string, description?: string, tags?: string[]): Promise<Course | null> => {
        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, tags }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create course');
            }

            const newCourse = await res.json();
            // Add to local state
            setCourses(prev => [newCourse, ...prev]);
            return newCourse;
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err instanceof Error ? err.message : 'Failed to create course');
            return null;
        }
    }, []);

    // Update a course
    const updateCourse = useCallback(async (id: string, updates: Partial<Course>): Promise<Course | null> => {
        try {
            const res = await fetch(`/api/courses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update course');
            }

            const updatedCourse = await res.json();
            // Update local state
            setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedCourse } : c));
            return updatedCourse;
        } catch (err) {
            console.error('Error updating course:', err);
            setError(err instanceof Error ? err.message : 'Failed to update course');
            return null;
        }
    }, []);

    // Delete a course
    const deleteCourse = useCallback(async (id: string): Promise<boolean> => {
        try {
            const res = await fetch(`/api/courses/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to delete course');
            }

            // Remove from local state
            setCourses(prev => prev.filter(c => c.id !== id));
            return true;
        } catch (err) {
            console.error('Error deleting course:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete course');
            return false;
        }
    }, []);

    // Toggle publish status
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
        }}>
            {children}
        </CourseAPIContext.Provider>
    );
}
