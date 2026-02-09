'use client';

import { useState } from 'react';
import { Plus, Trash2, HelpCircle, Trophy, Info } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { cn } from '@/lib/utils';

import { useContentStore } from '@/lib/content-store';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

type View = 'question' | 'rewards';

export default function QuizTab({ courseId }: { courseId: string }) {
  const { getContent, setQuizQuestions } = useContentStore();
  const { quizQuestions } = getContent(courseId);

  // Map store questions to local format (if needed, or just use store format)
  // Store uses correctIndex, this component uses correctAnswer. 
  const questions: Question[] = quizQuestions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctIndex,
  }));

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('question');

  // Add question form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);

  // Rewards (Local state for now)
  const [firstTryPts, setFirstTryPts] = useState(10);
  const [secondTryPts, setSecondTryPts] = useState(7);
  const [thirdTryPts, setThirdTryPts] = useState(5);
  const [fourthTryPts, setFourthTryPts] = useState(2);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) ?? null;

  const updateStore = (updatedQuestions: Question[]) => {
    setQuizQuestions(courseId, updatedQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctIndex: q.correctAnswer,
      points: 10 // Default points
    })));
  };

  const addQuestion = () => {
    if (!newQuestion.trim() || newOptions.some((o) => !o.trim())) return;
    const q: Question = {
      id: String(Date.now()),
      question: newQuestion,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    };

    updateStore([...questions, q]);

    setSelectedQuestionId(q.id);
    setActiveView('question');
    setNewQuestion('');
    setNewOptions(['', '', '', '']);
    setNewCorrectAnswer(0);
    setShowAddForm(false);
  };

  const removeQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    updateStore(updated);
    if (selectedQuestionId === id) {
      setSelectedQuestionId(updated[0]?.id ?? null);
    }
  };

  return (
    <div className="overflow-hidden rounded-b-lg border border-t-0 bg-card">
      <div className="flex min-h-[500px]">
        {/* ===== Left Sidebar ===== */}
        <div className="w-64 shrink-0 border-r border-border p-4">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Question List</h3>

          {/* Question list items */}
          <div className="space-y-1.5">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuestionId(q.id);
                  setActiveView('question');
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                  activeView === 'question' && selectedQuestionId === q.id
                    ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <span>Question {idx + 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeQuestion(q.id);
                  }}
                  className="rounded p-0.5 opacity-0 transition-opacity hover:text-red-500"
                  style={{ opacity: undefined }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
            <button
              onClick={() => setActiveView('rewards')}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity',
                activeView === 'rewards'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 ring-2 ring-purple-400/50'
                  : 'bg-gradient-to-r from-violet-600/70 to-purple-600/70 hover:opacity-90'
              )}
            >
              <Trophy className="h-4 w-4" />
              Rewards
            </button>
          </div>
        </div>

        {/* ===== Right Content ===== */}
        <div className="flex-1 p-6">
          {/* --- Add Question Form --- */}
          {showAddForm && (
            <div className="mb-6 rounded-lg border border-dashed border-purple-500/50 bg-purple-500/5 p-5">
              <h3 className="mb-4 text-base font-semibold text-foreground">New Question</h3>
              <div className="space-y-4">
                <div>
                  <Label className="mb-1 block text-sm text-muted-foreground">Question</Label>
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter your question..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {newOptions.map((opt, idx) => (
                    <div key={idx}>
                      <Label className="mb-1 block text-xs text-muted-foreground">
                        Option {idx + 1} {idx === newCorrectAnswer && '✓ Correct'}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newOptions];
                            updated[idx] = e.target.value;
                            setNewOptions(updated);
                          }}
                          placeholder={`Option ${idx + 1}`}
                        />
                        <button
                          onClick={() => setNewCorrectAnswer(idx)}
                          className={cn(
                            'rounded-md border px-3 text-xs',
                            idx === newCorrectAnswer
                              ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'border-input text-muted-foreground hover:bg-accent'
                          )}
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addQuestion}
                    className="rounded-md bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Add Question
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="rounded-md border border-input px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- Question Detail View --- */}
          {activeView === 'question' && selectedQuestion && !showAddForm && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedQuestion.question}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedQuestion.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-lg border px-4 py-3 text-sm',
                      idx === selectedQuestion.correctAnswer
                        ? 'border-green-500/50 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'border-border bg-muted/50 text-muted-foreground'
                    )}
                  >
                    <span className="mr-2 font-medium text-muted-foreground">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Correct answer:{' '}
                <span className="font-medium text-green-600 dark:text-green-400">
                  Option {String.fromCharCode(65 + selectedQuestion.correctAnswer)}
                </span>
              </p>
            </div>
          )}

          {/* --- Empty state --- */}
          {activeView === 'question' && !selectedQuestion && !showAddForm && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <HelpCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No quiz questions yet. Click &quot;Add Question&quot; to get started.
              </p>
            </div>
          )}

          {/* --- Rewards View --- */}
          {activeView === 'rewards' && (
            <div>
              <div className="mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-foreground">Rewards</h3>
              </div>

              <div className="flex gap-8">
                {/* Rewards Inputs */}
                <div className="space-y-5">
                  {[
                    { label: 'First try:', value: firstTryPts, set: setFirstTryPts },
                    { label: 'Second try:', value: secondTryPts, set: setSecondTryPts },
                    { label: 'Third try:', value: thirdTryPts, set: setThirdTryPts },
                    { label: 'Fourth Try and more:', value: fourthTryPts, set: setFourthTryPts },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-4">
                      <span className="w-44 text-sm text-foreground">{row.label}</span>
                      <input
                        type="number"
                        min={0}
                        value={row.value}
                        onChange={(e) => row.set(Number(e.target.value))}
                        className="w-20 rounded-md border border-input bg-background px-3 py-2 text-center text-sm text-foreground outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>
                  ))}
                </div>

                {/* Info Box */}
                <div className="max-w-sm rounded-lg border border-border bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-300">How it works</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    In Rewards section you can select, in how much try the user can gain the points.
                    If the user complete the quiz of the course in &apos;first try&apos; then he will gain{' '}
                    <span className="text-purple-600 dark:text-purple-300">{firstTryPts} points</span> (You Admin can
                    customize or decide the points). Same for the other trials, you can choose the
                    points as per your choice.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
