'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface ContentItem {
    id: string;
    title: string;
    category: 'Video' | 'Document' | 'Image' | 'Quiz';
    url?: string;
    description?: string;
}

interface CourseContent {
    contents: ContentItem[];
    description: string;
    quizQuestions: QuizQuestion[];
    options: CourseOptions;
}

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    points: number;
}

interface CourseOptions {
    isPaid: boolean;
    price: number;
    enrollmentLimit: number;
    certificateEnabled: boolean;
    discussionEnabled: boolean;
    completionCriteria: 'all_lessons' | 'quiz_pass' | 'manual';
    scheduledPublishDate?: string;
    assignedInstructor?: string;
    showCourseTo: 'everyone' | 'signed_in';
    isOpen: boolean;
    isInvitation: boolean;
}

interface ContentStore {
    courseContents: Record<string, CourseContent>;
    getContent: (courseId: string) => CourseContent;
    setContents: (courseId: string, contents: ContentItem[]) => void;
    addContent: (courseId: string, content: ContentItem) => void;
    updateContent: (courseId: string, content: ContentItem) => void;
    removeContent: (courseId: string, contentId: string) => void;
    setDescription: (courseId: string, description: string) => void;
    setQuizQuestions: (courseId: string, questions: QuizQuestion[]) => void;
    setOptions: (courseId: string, options: Partial<CourseOptions>) => void;
    getScheduledCourses: () => { courseId: string; scheduledDate: string }[];
}

const defaultOptions: CourseOptions = {
    isPaid: false,
    price: 0,
    enrollmentLimit: 0,
    certificateEnabled: true,
    discussionEnabled: false,
    completionCriteria: 'all_lessons',
    showCourseTo: 'everyone',
    isOpen: true,
    isInvitation: false,
};

const defaultContent: CourseContent = {
    contents: [],
    description: '',
    quizQuestions: [],
    options: { ...defaultOptions },
};

const ContentStoreContext = createContext<ContentStore | null>(null);

import { useAuth } from '@/lib/auth-context';

const BASE_STORAGE_KEY = 'learnsphere-content-store';

export function ContentStoreProvider({ children }: { children: ReactNode }) {
    const { userId } = useAuth();
    const [courseContents, setCourseContents] = useState<Record<string, CourseContent>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount or user change
    useEffect(() => {
        if (typeof window !== 'undefined' && userId) {
            const key = `${BASE_STORAGE_KEY}-${userId}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    setCourseContents(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse content store', e);
                }
            } else {
                setCourseContents({}); // Reset if no data for this user
            }
        }
        setIsLoaded(true);
    }, [userId]);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined' && userId) {
            const key = `${BASE_STORAGE_KEY}-${userId}`;
            localStorage.setItem(key, JSON.stringify(courseContents));
        }
    }, [courseContents, isLoaded, userId]);

    const getContent = useCallback((courseId: string): CourseContent => {
        return courseContents[courseId] || { ...defaultContent, options: { ...defaultOptions } };
    }, [courseContents]);

    const setContents = useCallback((courseId: string, contents: ContentItem[]) => {
        setCourseContents(prev => ({
            ...prev,
            [courseId]: {
                ...getContent(courseId),
                contents,
            }
        }));
    }, [getContent]);

    const addContent = useCallback((courseId: string, content: ContentItem) => {
        setCourseContents(prev => {
            const current = prev[courseId] || { ...defaultContent, options: { ...defaultOptions } };
            return {
                ...prev,
                [courseId]: {
                    ...current,
                    contents: [...current.contents, content],
                }
            };
        });
    }, []);

    const updateContent = useCallback((courseId: string, content: ContentItem) => {
        setCourseContents(prev => {
            const current = prev[courseId] || { ...defaultContent, options: { ...defaultOptions } };
            return {
                ...prev,
                [courseId]: {
                    ...current,
                    contents: current.contents.map(c => c.id === content.id ? content : c),
                }
            };
        });
    }, []);

    const removeContent = useCallback((courseId: string, contentId: string) => {
        setCourseContents(prev => {
            const current = prev[courseId] || { ...defaultContent, options: { ...defaultOptions } };
            return {
                ...prev,
                [courseId]: {
                    ...current,
                    contents: current.contents.filter(c => c.id !== contentId),
                }
            };
        });
    }, []);

    const setDescription = useCallback((courseId: string, description: string) => {
        setCourseContents(prev => ({
            ...prev,
            [courseId]: {
                ...getContent(courseId),
                description,
            }
        }));
    }, [getContent]);

    const setQuizQuestions = useCallback((courseId: string, questions: QuizQuestion[]) => {
        setCourseContents(prev => ({
            ...prev,
            [courseId]: {
                ...getContent(courseId),
                quizQuestions: questions,
            }
        }));
    }, [getContent]);

    const setOptions = useCallback((courseId: string, options: Partial<CourseOptions>) => {
        setCourseContents(prev => {
            const current = prev[courseId] || { ...defaultContent, options: { ...defaultOptions } };
            return {
                ...prev,
                [courseId]: {
                    ...current,
                    options: { ...current.options, ...options },
                }
            };
        });
    }, []);

    const getScheduledCourses = useCallback(() => {
        return Object.entries(courseContents)
            .filter(([_, content]) => content.options.scheduledPublishDate)
            .map(([courseId, content]) => ({
                courseId,
                scheduledDate: content.options.scheduledPublishDate!,
            }));
    }, [courseContents]);

    return (
        <ContentStoreContext.Provider value={{
            courseContents,
            getContent,
            setContents,
            addContent,
            updateContent,
            removeContent,
            setDescription,
            setQuizQuestions,
            setOptions,
            getScheduledCourses,
        }}>
            {children}
        </ContentStoreContext.Provider>
    );
}

export function useContentStore() {
    const context = useContext(ContentStoreContext);
    if (!context) {
        throw new Error('useContentStore must be used within a ContentStoreProvider');
    }
    return context;
}
