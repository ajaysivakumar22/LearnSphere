'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Check, Menu, X, Video, FileText, Image, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/shared/progress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document' | 'image' | 'quiz';
  duration: number;
  isCompleted: boolean;
  allowDownload: boolean;
}

const sampleLessons: Lesson[] = [
  { id: '1', title: 'Introduction to CRM', type: 'video', duration: 15, isCompleted: true, allowDownload: false },
  { id: '2', title: 'Setting Up Your Pipeline', type: 'document', duration: 10, isCompleted: true, allowDownload: true },
  { id: '3', title: 'Pipeline Overview', type: 'image', duration: 5, isCompleted: true, allowDownload: true },
  { id: '4', title: 'Module 1 Quiz', type: 'quiz', duration: 10, isCompleted: false, allowDownload: false },
  { id: '5', title: 'Lead Management', type: 'video', duration: 20, isCompleted: false, allowDownload: false },
  { id: '6', title: 'Sales Automation', type: 'document', duration: 15, isCompleted: false, allowDownload: true },
  { id: '7', title: 'Reporting & Analytics', type: 'video', duration: 25, isCompleted: false, allowDownload: false },
  { id: '8', title: 'Final Quiz', type: 'quiz', duration: 15, isCompleted: false, allowDownload: false },
];

const typeIcons = { video: Video, document: FileText, image: Image, quiz: HelpCircle };

// Simple quiz component
function QuizView() {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const question = {
    text: 'What is the primary purpose of a CRM pipeline?',
    options: [
      'To write code for websites',
      'To track and manage sales opportunities through stages',
      'To design user interfaces',
      'To manage employee schedules',
    ],
    correctAnswer: 1,
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    setIsCorrect(selected === question.correctAnswer);
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-lg bg-white p-8">
      <h3 className="mb-6 text-xl font-bold text-gray-900">{question.text}</h3>
      <div className="space-y-3">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => !submitted && setSelected(idx)}
            className={cn(
              'quiz-option w-full text-left',
              selected === idx && !submitted && 'border-primary bg-primary/5',
              submitted && idx === question.correctAnswer && 'border-green-500 bg-green-50',
              submitted && selected === idx && idx !== question.correctAnswer && 'border-red-500 bg-red-50'
            )}
          >
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium',
              selected === idx ? 'border-primary bg-primary text-white' : 'border-gray-300'
            )}>
              {String.fromCharCode(65 + idx)}
            </div>
            <span>{opt}</span>
          </button>
        ))}
      </div>

      {!submitted ? (
        <Button variant="odoo" className="mt-6 w-full" onClick={handleSubmit} disabled={selected === null}>
          Submit Answer
        </Button>
      ) : (
        <div className={cn(
          'mt-6 rounded-lg p-4 text-center font-medium',
          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        )}>
          {isCorrect ? '🎉 Correct! +10 points' : '❌ Incorrect. Try again!'}
        </div>
      )}
    </div>
  );
}

export default function LearningPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(3);
  const currentLesson = sampleLessons[currentLessonIdx];
  const completedCount = sampleLessons.filter((l) => l.isCompleted).length;
  const progressPct = Math.round((completedCount / sampleLessons.length) * 100);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col overflow-hidden border-r border-gray-700 bg-gray-800"
          >
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-bold text-white">Course Content</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                <span>{completedCount}/{sampleLessons.length} completed</span>
                <span>{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>

            <div className="flex-1 overflow-y-auto">
              {sampleLessons.map((lesson, idx) => {
                const Icon = typeIcons[lesson.type];
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLessonIdx(idx)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      idx === currentLessonIdx ? 'bg-primary/20 text-white' : 'text-gray-300 hover:bg-gray-700'
                    )}
                  >
                    {lesson.isCompleted ? (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-500">
                        <span className="text-xs">{idx + 1}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{lesson.title}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Icon className="h-3 w-3" />
                        {lesson.type} • {lesson.duration}m
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-700 p-4">
              <Link href="/learner/my-courses">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  Back to My Courses
                </Button>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-gray-800 px-6 py-4 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-1 hover:bg-white/10"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="hover:text-gray-300">
                <Menu className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold">{currentLesson.title}</h2>
          </div>
          {currentLesson.allowDownload && (
            <button className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
              <Download className="h-4 w-4" />
              Download
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center justify-center p-6">
          {currentLesson.type === 'video' && (
            <div className="flex h-full w-full max-w-4xl items-center justify-center rounded-lg bg-black">
              <div className="text-center text-white">
                <Video className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                <p className="text-lg font-medium">Video Player</p>
                <p className="text-sm text-gray-400">{currentLesson.title}</p>
                <p className="mt-2 text-xs text-gray-500">Video playback requires media content</p>
              </div>
            </div>
          )}
          {currentLesson.type === 'document' && (
            <div className="flex h-full w-full max-w-4xl items-center justify-center rounded-lg bg-white">
              <div className="text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <p className="text-lg font-medium text-gray-900">Document Viewer</p>
                <p className="text-sm text-gray-500">{currentLesson.title}</p>
              </div>
            </div>
          )}
          {currentLesson.type === 'image' && (
            <div className="flex h-full w-full max-w-4xl items-center justify-center rounded-lg bg-white">
              <div className="text-center">
                <Image className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <p className="text-lg font-medium text-gray-900">Image Viewer</p>
                <p className="text-sm text-gray-500">{currentLesson.title}</p>
              </div>
            </div>
          )}
          {currentLesson.type === 'quiz' && <QuizView />}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between bg-gray-800 px-6 py-4">
          <button
            onClick={() => setCurrentLessonIdx(Math.max(0, currentLessonIdx - 1))}
            disabled={currentLessonIdx === 0}
            className="flex items-center gap-2 text-white hover:text-gray-300 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>
          <span className="text-sm text-gray-400">
            {currentLessonIdx + 1} / {sampleLessons.length}
          </span>
          <button
            onClick={() => setCurrentLessonIdx(Math.min(sampleLessons.length - 1, currentLessonIdx + 1))}
            disabled={currentLessonIdx === sampleLessons.length - 1}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            Next Content
            <ChevronRight className="ml-2 inline h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
