'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Download, Check, Menu, X,
  Video, FileText, Image, HelpCircle, ArrowLeft,
  Search, Star, Circle, ArrowRight, User,
} from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/shared/progress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { markLearningActivity } from '@/lib/useStreak';
import { useAuth } from '@/lib/auth-context';

/* ======================================================================
   TYPES
   ====================================================================== */
interface ContentAttachment {
  type: 'document' | 'video' | 'quiz';
  label: string;
}

interface CourseContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'image' | 'quiz';
  duration: number;
  status: 'completed' | 'in_progress' | 'not_started';
  allowDownload: boolean;
  attachments: ContentAttachment[];
}

interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

/* ======================================================================
   SAMPLE DATA
   ====================================================================== */
const courseInfo = {
  title: 'Basics of Odoo CRM',
  description:
    'Learn the fundamentals of customer relationship management with Odoo. Build pipelines, manage leads, automate your sales process, and generate insightful reports.',
  tag: 'CRM',
};

const initialContents: CourseContent[] = [
  {
    id: '1',
    title: 'Advanced Sales & CRM Automation in Odoo',
    description: 'Learn about advanced sales automation techniques and CRM pipeline management.',
    type: 'video',
    duration: 15,
    status: 'completed',
    allowDownload: false,
    attachments: [
      { type: 'document', label: 'Sales Guide PDF' },
      { type: 'video', label: 'Demo Video' },
    ],
  },
  {
    id: '2',
    title: 'Document',
    description: 'Reference documentation for CRM pipeline setup and configuration.',
    type: 'document',
    duration: 10,
    status: 'not_started',
    allowDownload: true,
    attachments: [
      { type: 'document', label: 'Pipeline Setup Guide' },
    ],
  },
  {
    id: '3',
    title: 'Video',
    description: 'Video walkthrough of the complete CRM workflow and best practices.',
    type: 'video',
    duration: 20,
    status: 'not_started',
    allowDownload: false,
    attachments: [
      { type: 'video', label: 'CRM Walkthrough' },
    ],
  },
  {
    id: '4',
    title: 'Quiz',
    description: 'Test your knowledge of CRM concepts and Odoo functionality.',
    type: 'quiz',
    duration: 10,
    status: 'not_started',
    allowDownload: false,
    attachments: [],
  },
];

const quizQuestions: QuizQuestion[] = [
  {
    text: 'What is the primary purpose of a CRM pipeline?',
    options: [
      'To write code for websites',
      'To track and manage sales opportunities through stages',
      'To design user interfaces',
      'To manage employee schedules',
    ],
    correctAnswer: 1,
  },
  {
    text: 'Which Odoo module is used for lead management?',
    options: [
      'Odoo Accounting',
      'Odoo CRM',
      'Odoo Inventory',
      'Odoo Manufacturing',
    ],
    correctAnswer: 1,
  },
  {
    text: 'What happens when a lead is converted in Odoo CRM?',
    options: [
      'It is deleted from the system',
      'It becomes an opportunity',
      'It is archived automatically',
      'It sends an email to the admin',
    ],
    correctAnswer: 1,
  },
];

const sampleReviews: Review[] = [
  { id: '1', userName: 'Alice Johnson', rating: 5, comment: 'Excellent course! CRM pipeline explanation was very clear.', date: '2025-01-15T10:30:00' },
  { id: '2', userName: 'Bob Smith', rating: 4, comment: 'Great content overall. Could use more hands-on exercises.', date: '2025-01-14T14:20:00' },
  { id: '3', userName: 'Cathy Lee', rating: 5, comment: 'Very well structured. I learned a lot about Odoo CRM features.', date: '2025-01-12T09:15:00' },
  { id: '4', userName: 'David Park', rating: 3, comment: 'Decent course, some sections felt rushed.', date: '2025-01-10T16:45:00' },
  { id: '5', userName: 'Eva Martinez', rating: 4, comment: 'Really enjoyed the lead management module!', date: '2025-01-08T11:00:00' },
];

const typeIcons: Record<string, typeof Video> = { video: Video, document: FileText, image: Image, quiz: HelpCircle };
const attachIcons: Record<string, typeof Video> = { video: Video, document: FileText, quiz: HelpCircle };

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

function AddReviewDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: number, c: string) => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-foreground">Add Your Review</h3>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Rating <span className="text-red-500">*</span></label>
          <Stars rating={rating} size={28} interactive onChange={setRating} />
          {rating === 0 && <p className="mt-1 text-xs text-muted-foreground">Please select a rating</p>}
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Your Review</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
            placeholder="Share your experience..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="odoo" className="flex-1" disabled={rating === 0}
            onClick={() => { onSubmit(rating, comment); onClose(); }}>Submit Review</Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ======================================================================
   MAIN PAGE
   ====================================================================== */
export default function LearningPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  /* ---- State ---- */
  const [contents, setContents] = useState<CourseContent[]>(initialContents);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);

  // Overview state
  const [activeTab, setActiveTab] = useState<'overview' | 'ratings'>('overview');
  const [contentSearch, setContentSearch] = useState('');
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);

  // Load course completion state from localStorage (only for authenticated users)
  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      const completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
      if (completedCourses.includes(resolvedParams.id)) {
        setCourseCompleted(true);
        setContents(prev => prev.map(c => ({ ...c, status: 'completed' as const })));
      } else {
        // Load saved progress for this course
        const savedProgress = localStorage.getItem(`courseProgress_${resolvedParams.id}`);
        if (savedProgress) {
          try {
            const progressData = JSON.parse(savedProgress) as { completedIds: string[] };
            setContents(prev => prev.map(c => ({
              ...c,
              status: progressData.completedIds.includes(c.id) ? 'completed' as const : c.status,
            })));
          } catch {}
        }
      }
    } catch {}
  }, [resolvedParams.id, isLoggedIn]);

  /* ---- Computed ---- */
  const currentContent = contents[currentIdx];
  const completedCount = contents.filter((c) => c.status === 'completed').length;
  const progressPct = Math.round((completedCount / contents.length) * 100);
  const allCompleted = contents.every((c) => c.status === 'completed');

  const filteredContents = contents.filter((c) =>
    c.title.toLowerCase().includes(contentSearch.toLowerCase())
  );

  const avgRating = reviews.length > 0 ? +(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const filteredReviews = useMemo(() => {
    let list = [...reviews];
    if (filterStar !== null) list = list.filter((r) => r.rating === filterStar);
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [reviews, filterStar]);

  const progressGradient = progressPct === 100
    ? '#22c55e'
    : 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)';

  /* ---- Handlers ---- */
  const openContent = (idx: number) => {
    setCurrentIdx(idx);
    setIsPlayerOpen(true);
    setQuizStarted(false);
    setQuizQuestionIdx(0);
    setQuizSelected(null);
    setQuizCompleted(false);
    setShowRewardModal(false);
    setContents((prev) => prev.map((c, i) =>
      i === idx && c.status === 'not_started' ? { ...c, status: 'in_progress' } : c
    ));
  };

  const markComplete = useCallback((idx: number) => {
    if (!isLoggedIn) return; // Guests cannot track progress
    setContents((prev) => {
      const updated = prev.map((c, i) =>
        i === idx ? { ...c, status: 'completed' as const } : c
      );
      // Persist progress to localStorage
      try {
        const completedIds = updated.filter(c => c.status === 'completed').map(c => c.id);
        const completedCount = completedIds.length;
        const totalContents = updated.length;
        const progressPct = Math.round((completedCount / totalContents) * 100);
        localStorage.setItem(`courseProgress_${resolvedParams.id}`, JSON.stringify({
          completedIds,
          completedCount,
          totalContents,
          progressPct,
        }));
      } catch {}
      return updated;
    });
    markLearningActivity();
  }, [resolvedParams.id, isLoggedIn]);

  const goNextContent = () => {
    markComplete(currentIdx);
    const nextIdx = currentIdx + 1;
    if (nextIdx < contents.length) {
      openContent(nextIdx);
    }
  };

  const handleAddReview = (rating: number, comment: string) => {
    setReviews((prev) => [{
      id: String(prev.length + 1), userName: 'Student User', rating, comment, date: new Date().toISOString(),
    }, ...prev]);
  };

  const handleQuizProceed = () => {
    const isLast = quizQuestionIdx === quizQuestions.length - 1;
    if (isLast) {
      setQuizCompleted(true);
      markComplete(currentIdx);
      setShowRewardModal(true);
    } else {
      setQuizQuestionIdx((prev) => prev + 1);
      setQuizSelected(null);
    }
  };

  const handleCompleteCourse = () => {
    if (!isLoggedIn) return; // Guests cannot complete courses
    setCourseCompleted(true);
    setIsPlayerOpen(false);
    markLearningActivity();
    // Save course completion to localStorage
    try {
      const completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
      if (!completedCourses.includes(resolvedParams.id)) {
        completedCourses.push(resolvedParams.id);
        localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
      }
    } catch {}
    // Stay on course dashboard — show completion banner
  };

  /* ======================================================================
     FULL-SCREEN PLAYER
     ====================================================================== */
  if (isPlayerOpen) {
    const isQuiz = currentContent.type === 'quiz';
    const isLastQuestion = quizQuestionIdx === quizQuestions.length - 1;

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
                <h2 className="text-lg font-bold text-white">{courseInfo.title}</h2>
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
                      {content.attachments.length > 0 && (
                        <div className="space-y-0.5 px-4 pb-2 pl-8">
                          {content.attachments.map((att, ai) => {
                            const AttIcon = attachIcons[att.type] || FileText;
                            return (
                              <div key={ai} className="flex items-center gap-2 text-xs text-gray-500">
                                <AttIcon className="h-3 w-3 text-red-400" />
                                <span className="text-gray-500">[Additional attachment]</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ---- Main area ---- */}
        <div className="flex flex-1 flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-6 py-3">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white">
                  <Menu className="h-5 w-5" />
                </button>
              )}
              {isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {currentContent.allowDownload && (
              <button className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
                <Download className="h-4 w-4" /> Download
              </button>
            )}
          </div>

          {/* Description bar */}
          <div className="border-b border-gray-700 bg-gray-800/50 px-6 py-3">
            <p className="text-sm text-gray-400">{currentContent.description}</p>
          </div>

          {/* Content area */}
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            {!isQuiz && (
              <>
                <h2 className="mb-6 text-2xl font-bold text-white">{currentContent.title}</h2>
                <div className="flex h-full w-full max-w-4xl items-center justify-center rounded-xl border border-gray-700 bg-gray-800">
                  {currentContent.type === 'video' && (
                    <div className="text-center text-white">
                      <Video className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                      <p className="text-lg font-medium">Video Player</p>
                      <p className="text-sm text-gray-400">{currentContent.title}</p>
                    </div>
                  )}
                  {currentContent.type === 'document' && (
                    <div className="text-center">
                      <FileText className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                      <p className="text-lg font-medium text-white">Document Viewer</p>
                      <p className="text-sm text-gray-400">{currentContent.title}</p>
                    </div>
                  )}
                  {currentContent.type === 'image' && (
                    <div className="text-center">
                      <Image className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                      <p className="text-lg font-medium text-white">Image Viewer</p>
                      <p className="text-sm text-gray-400">{currentContent.title}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {isQuiz && !quizStarted && !quizCompleted && (
              <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-8 text-center">
                <HelpCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h2 className="mb-2 text-2xl font-bold text-white">Quiz</h2>
                <p className="mb-2 text-gray-400">{quizQuestions.length} Questions</p>
                <p className="mb-6 text-sm text-gray-500">Multiple attempts are allowed</p>
                {isLoggedIn ? (
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

            {isQuiz && quizStarted && !quizCompleted && (
              <div className="w-full max-w-2xl">
                <p className="mb-4 text-sm font-medium text-gray-400">
                  Question {quizQuestionIdx + 1} of {quizQuestions.length}
                </p>
                <h3 className="mb-8 text-xl font-bold text-white">
                  {quizQuestions[quizQuestionIdx].text}
                </h3>
                <div className="space-y-3">
                  {quizQuestions[quizQuestionIdx].options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setQuizSelected(oi)}
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
            {allCompleted && isLoggedIn ? (
              <button
                onClick={handleCompleteCourse}
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

                  <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                    <span>5 Points</span>
                    <span>100 Points</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
                      style={{ width: '25%' }} />
                  </div>
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

  /* ======================================================================
     OVERVIEW PAGE (Course Overview + Ratings tabs)
     ====================================================================== */
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
            <Badge variant="secondary" className="mb-1">{courseInfo.tag}</Badge>
            <h1 className="text-2xl font-bold text-foreground">{courseInfo.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{courseInfo.description}</p>
          </div>
        </div>

        {/* Guest Banner */}
        {!isLoggedIn && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
              <User className="h-5 w-5 text-yellow-500" />
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

            <div className="rounded-xl border border-border bg-card shadow-sm">
              {filteredContents.map((content, idx) => {
                const realIdx = contents.indexOf(content);
                const Icon = typeIcons[content.type];
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
                          <Icon className="h-3 w-3" /> {content.type} - {content.duration} min
                        </p>
                        {content.attachments.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {content.attachments.map((att, ai) => {
                              const AttIcon = attachIcons[att.type] || FileText;
                              return (
                                <div key={ai} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <AttIcon className="h-3 w-3 text-red-400" />
                                  <span>[Additional attachment]</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
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
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="pb-8">
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold text-foreground">{avgRating}</span>
                <div>
                  <Stars rating={Math.round(avgRating)} size={20} />
                  <p className="mt-1 text-sm text-muted-foreground">{reviews.length} reviews</p>
                </div>
              </div>
              <Button variant="odoo" onClick={() => setShowReviewDialog(true)}>
                <Star className="mr-2 h-4 w-4" /> Add Review
              </Button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={() => setFilterStar(null)}
                className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filterStar === null ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-muted')}>
                All
              </button>
              {[5, 4, 3, 2, 1].map((s) => (
                <button key={s} onClick={() => setFilterStar(filterStar === s ? null : s)}
                  className={cn('flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    filterStar === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-muted')}>
                  {s} <Star className="h-3 w-3 fill-current" />
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <Stars rating={review.rating} size={14} />
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </motion.div>
              ))}
              {filteredReviews.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  No reviews for this rating.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showReviewDialog && (
          <AddReviewDialog onClose={() => setShowReviewDialog(false)} onSubmit={handleAddReview} />
        )}
      </AnimatePresence>
    </div>
  );
}
