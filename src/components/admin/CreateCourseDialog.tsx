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

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    // TODO: Create course via API
    console.log({ title });
    onOpenChange(false);
    setTitle('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Provide a name..(Eg: Basics of Odoo CRM)"
            className="text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && title.trim()) handleCreate();
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="odoo" onClick={handleCreate} disabled={!title.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
