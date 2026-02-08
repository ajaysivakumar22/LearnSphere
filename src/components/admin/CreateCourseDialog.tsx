'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shared/dialog';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Loader2 } from 'lucide-react';
import { useCourseAPI } from '@/lib/course-api-context';

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createCourse } = useCourseAPI();

  const handleCreate = async () => {
    if (!title.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const course = await createCourse(title.trim(), description.trim());
      if (course) {
        onOpenChange(false);
        setTitle('');
        setDescription('');
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

  const handleClose = () => {
    if (!creating) {
      onOpenChange(false);
      setTitle('');
      setDescription('');
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Course Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Provide a name..(Eg: Basics of Odoo CRM)"
              className="text-sm"
              autoFocus
              disabled={creating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim() && !creating) handleCreate();
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the course..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3}
              disabled={creating}
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={creating}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
