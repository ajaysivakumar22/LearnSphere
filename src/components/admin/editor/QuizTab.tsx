'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, GripVertical, HelpCircle } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  pointsFirstTry: number;
  pointsSecondTry: number;
  pointsThirdTry: number;
}

const sampleQuestions: Question[] = [
  {
    id: '1',
    question: 'What is the purpose of a CRM system?',
    options: ['Manage customers', 'Write code', 'Design graphics', 'Cook food'],
    correctAnswer: 0,
    pointsFirstTry: 10,
    pointsSecondTry: 5,
    pointsThirdTry: 2,
  },
];

export default function QuizTab({ courseId }: { courseId: string }) {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);

  const addQuestion = () => {
    if (!newQuestion.trim() || newOptions.some((o) => !o.trim())) return;
    const q: Question = {
      id: String(Date.now()),
      question: newQuestion,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
      pointsFirstTry: 10,
      pointsSecondTry: 5,
      pointsThirdTry: 2,
    };
    setQuestions([...questions, q]);
    setNewQuestion('');
    setNewOptions(['', '', '', '']);
    setNewCorrectAnswer(0);
    setShowAddForm(false);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="card-odoo p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quiz Questions</h2>
        <Button variant="odoo" size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 rounded-lg border border-dashed border-primary bg-primary/5 p-4"
        >
          <div className="space-y-4">
            <div>
              <Label className="mb-1 block">Question</Label>
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {newOptions.map((opt, idx) => (
                <div key={idx}>
                  <Label className="mb-1 block text-xs">
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
                      className={`rounded-md border px-3 text-xs ${
                        idx === newCorrectAnswer ? 'border-green-500 bg-green-50 text-green-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="odoo" onClick={addQuestion}>Add Question</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-lg border bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <GripVertical className="mt-1 h-5 w-5 cursor-grab text-gray-400" />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-orange-500" />
                  <p className="font-medium text-gray-900">Q{idx + 1}: {q.question}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`rounded-md border px-3 py-1.5 text-sm ${
                        optIdx === q.correctAnswer
                          ? 'border-green-300 bg-green-50 text-green-800'
                          : 'text-gray-600'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>1st try: {q.pointsFirstTry}pts</span>
                  <span>2nd try: {q.pointsSecondTry}pts</span>
                  <span>3rd try: {q.pointsThirdTry}pts</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <HelpCircle className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No quiz questions yet. Add questions to assess learners.</p>
        </div>
      )}
    </div>
  );
}
