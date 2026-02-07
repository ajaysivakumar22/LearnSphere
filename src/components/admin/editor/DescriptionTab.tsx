'use client';

import { useState } from 'react';

interface DescriptionTabProps {
  courseId: string;
  description?: string;
  onDescriptionChange?: (desc: string) => void;
}

export default function DescriptionTab({ courseId, description: externalDesc, onDescriptionChange }: DescriptionTabProps) {
  const [localDescription, setLocalDescription] = useState('');
  const description = externalDesc ?? localDescription;
  const setDescription = (val: string) => {
    setLocalDescription(val);
    onDescriptionChange?.(val);
  };
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="overflow-hidden rounded-b-lg border border-t-0 bg-card p-6">
      {isEditing ? (
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your course description here..."
            rows={8}
            className="w-full resize-none rounded-md border border-input bg-background px-4 py-3 text-sm leading-relaxed text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded bg-primary px-4 py-1.5 text-sm text-white hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="min-h-[200px] cursor-text rounded-md px-1 py-1 transition-colors hover:bg-muted/50"
        >
          {description ? (
            <p className="text-sm leading-relaxed text-primary">{description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Click here to add a course description...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
