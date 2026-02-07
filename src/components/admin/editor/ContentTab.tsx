'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, GripVertical, Video, FileText, Image, HelpCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document' | 'image' | 'quiz';
  duration: number;
  orderIndex: number;
}

const typeIcons = {
  video: Video,
  document: FileText,
  image: Image,
  quiz: HelpCircle,
};

const typeColors = {
  video: 'bg-blue-100 text-blue-700',
  document: 'bg-green-100 text-green-700',
  image: 'bg-purple-100 text-purple-700',
  quiz: 'bg-orange-100 text-orange-700',
};

const sampleLessons: Lesson[] = [
  { id: '1', title: 'Introduction to CRM', type: 'video', duration: 15, orderIndex: 0 },
  { id: '2', title: 'Setting Up Your Pipeline', type: 'document', duration: 10, orderIndex: 1 },
  { id: '3', title: 'Pipeline Overview', type: 'image', duration: 5, orderIndex: 2 },
  { id: '4', title: 'Module 1 Quiz', type: 'quiz', duration: 10, orderIndex: 3 },
];

export default function ContentTab({ courseId }: { courseId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>(sampleLessons);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Lesson['type']>('video');

  const addLesson = () => {
    if (!newTitle.trim()) return;
    const newLesson: Lesson = {
      id: String(Date.now()),
      title: newTitle,
      type: newType,
      duration: 0,
      orderIndex: lessons.length,
    };
    setLessons([...lessons, newLesson]);
    setNewTitle('');
    setShowAddForm(false);
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter((l) => l.id !== id));
  };

  return (
    <div className="card-odoo p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Course Content</h2>
        <Button variant="odoo" size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 rounded-lg border border-dashed border-primary bg-primary/5 p-4"
        >
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Lesson title..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as Lesson['type'])}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="image">Image</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <Button variant="odoo" onClick={addLesson}>Add</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Lessons List */}
      <div className="space-y-2">
        {lessons.map((lesson, idx) => {
          const Icon = typeIcons[lesson.type];
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 rounded-lg border bg-white p-3 hover:shadow-sm"
            >
              <GripVertical className="h-5 w-5 cursor-grab text-gray-400" />
              <div className={cn('rounded-lg p-2', typeColors[lesson.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{lesson.title}</p>
                <p className="text-xs text-gray-500 capitalize">{lesson.type} • {lesson.duration} min</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeLesson(lesson.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </motion.div>
          );
        })}
      </div>

      {lessons.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No content yet. Click &quot;Add Content&quot; to get started.</p>
        </div>
      )}
    </div>
  );
}
