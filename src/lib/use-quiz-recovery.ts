import { useState, useEffect, useCallback } from 'react';

export interface StoredQuizState {
    lessonId: string;
    answers: Record<number, number>; // questionIndex -> selectedOptionIndex
    currentQuestionIndex: number;
    timestamp: number;
}

const STORAGE_KEY_PREFIX = 'quiz_state_';

export function useQuizRecovery(lessonId: string, userId?: string) {
    const key = userId ? `${STORAGE_KEY_PREFIX}${userId}_${lessonId}` : null;
    const [restoredState, setRestoredState] = useState<StoredQuizState | null>(null);

    // Load state on mount
    useEffect(() => {
        if (!key) return;
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw) as StoredQuizState;
                // Basic validation: ensure it matches current lesson
                if (parsed.lessonId === lessonId) {
                    setRestoredState(parsed);
                }
            }
        } catch (e) {
            console.error('Failed to load quiz state', e);
        }
    }, [key, lessonId]);

    // Save state
    const saveProgress = useCallback((questionIndex: number, answers: Record<number, number>) => {
        if (!key) return;
        const state: StoredQuizState = {
            lessonId,
            answers,
            currentQuestionIndex: questionIndex,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, lessonId]);

    // Clear state
    const clearProgress = useCallback(() => {
        if (!key) return;
        localStorage.removeItem(key);
    }, [key]);

    return { restoredState, saveProgress, clearProgress };
}
