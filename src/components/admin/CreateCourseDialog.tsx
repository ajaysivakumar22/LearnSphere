'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Loader2, Calendar, Users, X } from 'lucide-react';
import { useCourseAPI } from '@/lib/course-api-context';

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_TAGS = [
  'AI', 'Automation', 'CRM', 'Sales', 'Odoo', 'eLearning',
  'Python', 'Programming', 'Beginner', 'Advanced',
];

export default function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'description' | 'options'>('content');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [assignedInstructor, setAssignedInstructor] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createCourse } = useCourseAPI();

  // Mock instructors list (in real app, fetch from API)
  const instructors = [
    { id: '1', name: 'John Instructor' },
    { id: '2', name: 'Jane Teacher' },
    { id: '3', name: 'Bob Mentor' },
  ];

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setActiveTab('content');
      setTitle('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setScheduledDate('');
      setAssignedInstructor('');
      setError(null);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const course = await createCourse(
        title.trim(),
        description.trim(),
        tags,
        scheduledDate || undefined,
        assignedInstructor || undefined
      );
      if (course) {
        onOpenChange(false);
      } else {
        setError('Failed to create course. Please try again.');
      }
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const tabs = [
    { key: 'content' as const, label: 'Content' },
    { key: 'description' as const, label: 'Description' },
    { key: 'options' as const, label: 'Options' },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !creating && onOpenChange(v)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-normal text-gray-500">
            Create Course
          </DialogTitle>
        </DialogHeader>

        {/* Course Title */}
        <div className="mt-1">
          <input
            type="text"
            placeholder="Course title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-0 border-b border-gray-200 pb-2 text-xl font-semibold text-primary outline-none placeholder:text-gray-300 focus:border-primary dark:border-gray-700 dark:bg-transparent"
            disabled={creating}
          />
        </div>

        {/* Tabs */}
        <div className="mt-4 flex border-b dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4 min-h-[280px]">
          {/* === Content Tab === */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              {/* Tags */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Tags
                </label>
                <div className="mb-3 flex flex-wrap gap-2">
                  {DEFAULT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${tags.includes(tag)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {/* Selected tags */}
                {tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {tags.filter(t => !DEFAULT_TAGS.includes(t)).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {/* Custom tag input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    placeholder="Add custom tag..."
                    className="h-8 w-48 rounded-md border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    disabled={creating}
                  />
                  <button
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim() || creating}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* === Description Tab === */}
          {activeTab === 'description' && (
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your course description here..."
                rows={10}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                disabled={creating}
              />
            </div>
          )}

          {/* === Options Tab (Admin Only) === */}
          {activeTab === 'options' && (
            <div className="space-y-5">
              {/* Schedule Publishing */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  Schedule Publishing
                </label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Set a date and time to automatically publish this course
                </p>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  disabled={creating}
                />
                {scheduledDate && (
                  <p className="mt-2 text-xs text-green-600">
                    Course will be published on: {new Date(scheduledDate).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Assign Instructor */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Assign Course Incharge
                </label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Assign an instructor to manage this course
                </p>
                <select
                  value={assignedInstructor}
                  onChange={(e) => setAssignedInstructor(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  disabled={creating}
                >
                  <option value="">Select an instructor...</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
                {assignedInstructor && (
                  <p className="mt-2 text-xs text-blue-600">
                    Course will be assigned to:{' '}
                    {instructors.find(i => i.id === assignedInstructor)?.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-2 border-t pt-4 dark:border-gray-700">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="odoo" onClick={handleCreate} disabled={!title.trim() || creating}>
            {creating ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
