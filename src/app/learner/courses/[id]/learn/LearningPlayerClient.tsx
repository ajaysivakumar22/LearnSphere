'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Download, Check, Menu, X,
    Video, FileText, Image, HelpCircle, ArrowLeft,
    Search, Star, Circle, Loader2
} from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { markLearningActivity } from '@/lib/useStreak';
import { useAuth } from '@/lib/auth-context';
import { useQuizRecovery } from '@/lib/use-quiz-recovery';

/* ======================================================================
   TYPES
   ====================================================================== */
interface ContentAttachment {
    type: 'document' | 'video' | 'quiz';
    label: string;
}

export interface CourseContent {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'document' | 'image' | 'quiz';
    duration: number;
    status: 'completed' | 'in_progress' | 'not_started';
    allowDownload: boolean;
    attachments: ContentAttachment[];
    contentUrl?: string;
    questions?: QuizQuestion[];
}

export interface QuizQuestion {
    id?: string;
    text: string;
    question?: string;
    options: string[];
    correctAnswer: number;
    correctIndex?: number;
}

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface CourseMetadata {
    id: string;
    title: string;
    description: string;
    tags: string[];
    imageUrl: string;
}

/* ======================================================================
   HELPER COMPONENTS
   ====================================================================== */
function Stars({ rating, size = 16, interactive = false, onChange }: { rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" disabled={!interactive}
                    onClick={() => interactive && onChange?.(s)}
                    className={cn('transition-colors', interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default')}>
                    <Star style={{ width: size, height: size }}
                        className={cn(s <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-muted-foreground/40')} />
                </button>
            ))}
        </div>
    );
}

// Icon mappings
const typeIcons: Record<string, typeof Video> = { video: Video, document: FileText, image: Image, quiz: HelpCircle };

/* ======================================================================
   MAIN COMPONENT
   ====================================================================== */
interface LearningPlayerClientProps {
    course: CourseMetadata;
    initialContents: CourseContent[];
    initialCompletedIds: string[];
    isEnrolled: boolean;
    userId?: string;
}

export default function LearningPlayerClient({
    course,
    initialContents,
    initialCompletedIds,
    isEnrolled: initialIsEnrolled,
    userId
}: LearningPlayerClientProps) {
    const router = useRouter();
    const { isLoggedIn } = useAuth(); // Client-side auth check

    /* ---- State ---- */
    // Merge initial completed IDs into content status
    const [contents, setContents] = useState<CourseContent[]>(() =>
        initialContents.map(c => ({
            ...c,
            status: initialCompletedIds.includes(c.id) ? 'completed' : c.status
        }))
    );

    const [currentIdx, setCurrentIdx] = useState(0);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Quiz state
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
    const [quizSelected, setQuizSelected] = useState<number | null>(null); // Current question selection
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({}); // All answers
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [courseCompleted, setCourseCompleted] = useState(false);
    const [resumeNotification, setResumeNotification] = useState(false);
    const [contentSearch, setContentSearch] = useState('');

    /* ---- Computeds ---- */
    const currentContent = contents[currentIdx] || {
        id: 'loading', title: 'Loading...', description: '', type: 'video',
        duration: 0, status: 'not_started', allowDownload: false, attachments: []
    };

    const completedCount = contents.filter(c => c.status === 'completed').length;
    const progressPct = Math.round((completedCount / contents.length) * 100) || 0;
    const progressGradient = `linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)`;
    const avgRating = 4.8; // Mock rating
    const allCompleted = completedCount === contents.length;

    const filteredContents = useMemo(() => {
        if (!contentSearch) return contents;
        return contents.filter(c => c.title.toLowerCase().includes(contentSearch.toLowerCase()));
    }, [contents, contentSearch]);

    // Quiz Recovery Hook (depends on currentContent)
    const { restoredState, saveProgress, clearProgress } = useQuizRecovery(
        currentContent.id,
        userId
    );

    // Restore quiz state if available
    useEffect(() => {
        if (restoredState && !quizCompleted && !quizStarted) {
            setQuizStarted(true);
            setQuizQuestionIdx(restoredState.currentQuestionIndex);
            setQuizAnswers(restoredState.answers);
            // set current selection based on restored answer
            const currentAns = restoredState.answers[restoredState.currentQuestionIndex];
            if (currentAns !== undefined) {
                setQuizSelected(currentAns);
            }
            setResumeNotification(true);
            // Auto-hide notification
            setTimeout(() => setResumeNotification(false), 4000);
        }
    }, [restoredState, quizCompleted, quizStarted]);

    // Overview state
    const [activeTab, setActiveTab] = useState<'overview' | 'ratings'>('overview');
    const [reviews, setReviews] = useState<Review[]>([]);



    // ... (rest of computeds)

    /* ---- Handlers ---- */
    const openContent = (idx: number) => {
        setCurrentIdx(idx);
        setIsPlayerOpen(true);
        // Reset quiz state when switching content
        setQuizStarted(false);
        setQuizQuestionIdx(0);
        setQuizSelected(null);
        setQuizAnswers({});
        setQuizCompleted(false);
        setShowRewardModal(false);
        setResumeNotification(false);

        setContents((prev) => prev.map((c, i) =>
            i === idx && c.status === 'not_started' ? { ...c, status: 'in_progress' } : c
        ));
    };

    const handleQuizOptionSelect = (optionIndex: number) => {
        setQuizSelected(optionIndex);
        const newAnswers = { ...quizAnswers, [quizQuestionIdx]: optionIndex };
        setQuizAnswers(newAnswers);
        saveProgress(quizQuestionIdx, newAnswers);
    };

    const markComplete = useCallback(async (idx: number) => {
        if (!userId) return; // Only logged in users track progress

        const content = contents[idx];
        if (!content) return;

        // 1. Optimistic Update
        let newContents: CourseContent[] = [];
        setContents((prev) => {
            newContents = prev.map((c, i) =>
                i === idx ? { ...c, status: 'completed' as const } : c
            );
            return newContents;
        });

        // 2. Calc Progress
        const completed = newContents.filter(c => c.status === 'completed').length;
        const pct = Math.round((completed / newContents.length) * 100);

        // 3. Persist to API
        try {
            await fetch('/api/progress/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: course.id,
                    progressPct: pct,
                    completedLessonId: content.id
                })
            });
            markLearningActivity();
        } catch (e) {
            console.error('Failed to sync progress', e);
        }

        // 4. Save to LocalStorage (backup)
        try {
            const completedIds = newContents.filter(c => c.status === 'completed').map(c => c.id);
            localStorage.setItem(`courseProgress_${course.id}`, JSON.stringify({ completedIds }));
        } catch { }

    }, [course.id, userId, contents]);

    const goNextContent = () => {
        markComplete(currentIdx);
        const nextIdx = currentIdx + 1;
        if (nextIdx < contents.length) {
            openContent(nextIdx);
        } else {
            // End of course
            setCourseCompleted(true);
        }
    };

    const handleQuizProceed = () => {
        const questions = currentContent.questions || [];
        const isLast = quizQuestionIdx === questions.length - 1;

        // Ensure current answer is saved
        if (quizSelected !== null) {
            const newAnswers = { ...quizAnswers, [quizQuestionIdx]: quizSelected };
            setQuizAnswers(newAnswers);
        }

        if (isLast) {
            setQuizCompleted(true);
            markComplete(currentIdx);
            clearProgress(); // Clear local storage on success
            setShowRewardModal(true);
        } else {
            const nextIdx = quizQuestionIdx + 1;
            setQuizQuestionIdx(nextIdx);

            // Check if we already have an answer for the next question (resumed state)
            const existingAnswer = quizAnswers[nextIdx];
            setQuizSelected(existingAnswer ?? null);

            // Save state pointing to next question
            saveProgress(nextIdx, quizAnswers);
        }
    };

    // ... (rest of the file) ...


    if (isPlayerOpen) {
        const isQuiz = currentContent.type === 'quiz';
        const questions = currentContent.questions || [];
        const isLastQuestion = quizQuestionIdx === questions.length - 1;

        return (
            <div className="flex h-screen bg-gray-900">
                {/* ---- Sidebar ---- */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="flex w-80 shrink-0 flex-col overflow-hidden border-r border-gray-700 bg-gray-800"
                        >
                            {/* Header */}
                            <div className="border-b border-gray-700 p-4">
                                <Link href="/learner/my-courses"
                                    className="mb-3 flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                                    <ArrowLeft className="h-4 w-4" /> Back to My Courses
                                </Link>
                                <h2 className="text-lg font-bold text-white line-clamp-2">{course.title}</h2>
                                <p className="mt-1 text-sm text-gray-400">{progressPct}% Completed</p>
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                                </div>
                            </div>

                            {/* Content list */}
                            <div className="flex-1 overflow-y-auto py-2">
                                {contents.map((content, idx) => {
                                    const isActive = idx === currentIdx;
                                    const isCompleted = content.status === 'completed';
                                    return (
                                        <div key={content.id}>
                                            <button
                                                onClick={() => openContent(idx)}
                                                className={cn(
                                                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                                                    isActive ? 'bg-primary/20 text-white' : 'text-gray-300 hover:bg-gray-700',
                                                    isCompleted && !isActive && 'text-blue-400'
                                                )}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className={cn('truncate text-sm font-medium', isCompleted && 'text-blue-400')}>
                                                        {content.title}
                                                    </p>
                                                </div>
                                                {isCompleted ? (
                                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                ) : content.status === 'in_progress' ? (
                                                    <div className="h-5 w-5 shrink-0 rounded-full border-2 border-yellow-400" />
                                                ) : (
                                                    <Circle className="h-5 w-5 shrink-0 text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* ---- Main area ---- */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top bar */}
                    <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-6 py-3">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white">
                                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                        {currentContent.allowDownload && (
                            <button className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
                                <Download className="h-4 w-4" /> Download
                            </button>
                        )}
                    </div>

                    {/* Description bar */}
                    <div className="border-b border-gray-700 bg-gray-800/50 px-6 py-3">
                        <p className="text-sm text-gray-400">{currentContent.description || 'No description available'}</p>
                    </div>

                    {/* Content area */}
                    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
                        {!isQuiz && (
                            <>
                                <h2 className="mb-6 text-2xl font-bold text-white text-center">{currentContent.title}</h2>
                                <div className="flex h-full w-full max-w-4xl items-center justify-center rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">

                                    {/* Actual Content Rendering */}
                                    {currentContent.type === 'video' ? (
                                        <div className="text-center text-white">
                                            <Video className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                                            <p className="text-lg font-medium">Video Player Placeholder</p>
                                            {currentContent.contentUrl ?
                                                <p className="text-xs text-blue-400 mt-2">{currentContent.contentUrl}</p>
                                                : <p className="text-sm text-gray-400">No URL provided</p>
                                            }
                                        </div>
                                    ) : currentContent.type === 'image' ? (
                                        <div className="text-center">
                                            <Image className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                                            <p className="text-lg font-medium text-white">Image Viewer</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                                            <p className="text-lg font-medium text-white">Document Viewer</p>
                                        </div>
                                    )}

                                </div>
                            </>
                        )}

                        {isQuiz && !quizStarted && !quizCompleted && (
                            <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-8 text-center">
                                <HelpCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                                <h2 className="mb-2 text-2xl font-bold text-white">{currentContent.title}</h2>
                                <p className="mb-2 text-gray-400">{questions.length} Questions</p>
                                <p className="mb-6 text-sm text-gray-500">Multiple attempts are allowed</p>
                                {userId ? (
                                    <Button variant="odoo" className="px-8" onClick={() => setQuizStarted(true)}>
                                        Start Quiz
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-yellow-400">Sign in to attempt quizzes and earn points</p>
                                        <Link href="/sign-in">
                                            <Button variant="odoo" className="px-8">Sign In to Start</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quiz content section */}
                        {isQuiz && quizStarted && !quizCompleted && (
                            <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl relative">
                                {resumeNotification && (
                                    <div className="absolute -top-12 left-0 right-0 mx-auto flex w-max items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-400 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
                                        style={{ opacity: 1 }}>
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        Quiz progress resumed
                                    </div>
                                )}
                                {questions.length > 0 ? (
                                    <>
                                        <p className="mb-4 text-sm font-medium text-gray-400">
                                            Question {quizQuestionIdx + 1} of {questions.length}
                                        </p>
                                        <h3 className="mb-8 text-xl font-bold text-white">
                                            {questions[quizQuestionIdx].text}
                                        </h3>
                                        <div className="space-y-3">
                                            {questions[quizQuestionIdx].options.map((opt, oi) => (
                                                <button
                                                    key={oi}
                                                    onClick={() => handleQuizOptionSelect(oi)}
                                                    className={cn(
                                                        'flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all',
                                                        quizSelected === oi
                                                            ? 'border-primary bg-primary/10 text-white'
                                                            : 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                                                        quizSelected === oi ? 'border-primary bg-primary text-white' : 'border-gray-600'
                                                    )}>
                                                        {String.fromCharCode(65 + oi)}
                                                    </div>
                                                    <span>{opt}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-8 flex justify-end">
                                            <Button
                                                variant="odoo"
                                                disabled={quizSelected === null}
                                                onClick={handleQuizProceed}
                                                className="px-8"
                                            >
                                                {isLastQuestion ? 'Proceed and Complete Quiz' : 'Proceed'}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-gray-400">No questions configured for this quiz.</div>
                                )}
                            </div>
                        )}

                        {isQuiz && quizCompleted && !showRewardModal && (
                            <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                                    <Check className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold text-white">Quiz Completed!</h2>
                                <p className="text-gray-400">You have earned 20 points</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom bar */}
                    <div className="flex items-center justify-end border-t border-gray-700 bg-gray-800 px-6 py-4">
                        {allCompleted && userId ? (
                            <button
                                onClick={() => {
                                    if (!userId) return;
                                    setCourseCompleted(true);
                                    setIsPlayerOpen(false);
                                    markComplete(currentIdx);
                                }}
                                className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700"
                            >
                                Complete this course
                            </button>
                        ) : (
                            <button
                                onClick={goNextContent}
                                disabled={currentIdx === contents.length - 1 && !isQuiz}
                                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                            >
                                Next Content <ChevronRight className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ---- Reward Modal ---- */}
                <AnimatePresence>
                    {showRewardModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative mx-4 w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-8"
                            >
                                <button
                                    onClick={() => setShowRewardModal(false)}
                                    className="absolute right-4 top-4 text-gray-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="text-center">
                                    <p className="mb-2 text-4xl">&#x1F389;</p>
                                    <h2 className="mb-1 text-2xl font-bold text-white">Bingo! You have earned!</h2>
                                    <p className="mb-6 text-3xl font-extrabold text-primary">20 Points</p>
                                    <p className="mt-3 text-sm text-gray-400">
                                        Reach the next rank to gain more points.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="relative h-48 w-full bg-gradient-to-br from-purple-500 via-pink-400 to-orange-300 dark:from-purple-900 dark:via-pink-800 dark:to-orange-700 md:h-64">
                <div className="absolute inset-0 bg-black/20" />
                <button
                    onClick={() => router.push('/learner/my-courses')}
                    className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
            </div>

            <div className="container mx-auto px-4">
                <div className="mt-6 mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50">
                        <Video className="h-8 w-8 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <Badge variant="secondary" className="mb-1">{course.tags?.[0] || 'Course'}</Badge>
                        <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    </div>
                </div>

                {/* Guest Banner */}
                {!userId && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
                            <UserIcon className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-yellow-600 dark:text-yellow-400">Browsing as Guest</p>
                            <p className="text-sm text-muted-foreground">
                                <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link> to track progress, attempt quizzes, and earn points.
                            </p>
                        </div>
                    </div>
                )}

                {/* Course Completed Banner */}
                {courseCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500">
                            <Check className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-green-600 dark:text-green-400">Course Completed!</p>
                            <p className="text-sm text-muted-foreground">Congratulations! You have successfully completed this course.</p>
                        </div>
                    </motion.div>
                )}

                <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                            {progressPct}% Completed
                        </span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span><strong className="text-foreground">{contents.length}</strong> Content</span>
                            <span><strong className="text-green-600">{completedCount}</strong> Completed</span>
                            <span><strong className="text-orange-500">{contents.length - completedCount}</strong> Incomplete</span>
                        </div>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%`, background: progressGradient }} />
                    </div>
                </div>

                <div className="mb-4 flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
                    <button onClick={() => setActiveTab('overview')}
                        className={cn('flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                            activeTab === 'overview' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                        Course Overview
                    </button>
                    <button onClick={() => setActiveTab('ratings')}
                        className={cn('flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                            activeTab === 'ratings' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                        Ratings and Reviews
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="pb-8">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input type="text" placeholder="Search content..."
                                value={contentSearch} onChange={(e) => setContentSearch(e.target.value)}
                                className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>

                        {filteredContents.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">No content details available yet.</div>
                        ) : (
                            <div className="rounded-xl border border-border bg-card shadow-sm">
                                {filteredContents.map((content, idx) => {
                                    const realIdx = contents.indexOf(content);
                                    const Icon = typeIcons[content.type] || FileText;
                                    const isCompleted = content.status === 'completed';
                                    const isInProgress = content.status === 'in_progress';
                                    return (
                                        <div key={content.id}>
                                            <button
                                                onClick={() => openContent(realIdx)}
                                                className={cn(
                                                    'flex w-full items-center gap-4 border-b border-border px-5 py-4 text-left transition-colors hover:bg-muted/50',
                                                    idx === filteredContents.length - 1 && 'border-b-0'
                                                )}
                                            >
                                                <span className="w-6 shrink-0 text-sm font-medium text-muted-foreground">
                                                    {realIdx + 1}.
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <p className={cn('text-sm font-medium', isCompleted ? 'text-blue-500' : 'text-foreground')}>
                                                        {content.title}
                                                    </p>
                                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Icon className="h-3 w-3" /> {content.type}
                                                    </p>
                                                </div>

                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                                                    {isCompleted ? (
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                                                            <Check className="h-3.5 w-3.5 text-white" />
                                                        </div>
                                                    ) : isInProgress ? (
                                                        <div className="h-6 w-6 rounded-full border-2 border-yellow-400" />
                                                    ) : (
                                                        <Circle className="h-6 w-6 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ratings' && (
                    <div className="pb-8">
                        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-5xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
                                <Stars rating={Math.round(avgRating)} size={24} />
                            </div>
                            <div className="bg-yellow-500/10 text-yellow-600 px-4 py-2 rounded-lg text-sm font-medium">
                                Feature coming soon
                            </div>
                        </div>

                        <div className="p-10 text-center text-muted-foreground">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                <Star className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">Ratings & Reviews</h3>
                            <p className="max-w-md mx-auto mt-2">Reviews will be enabled once enough students have completed this course.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function UserIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
