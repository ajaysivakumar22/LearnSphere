'use client';

import { useState } from 'react';
import { Plus, Search, LayoutGrid, List, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import CourseKanban from '@/components/admin/CourseKanban';
import CourseList from '@/components/admin/CourseList';
import CreateCourseDialog from '@/components/admin/CreateCourseDialog';

const DEFAULT_TAGS = [
  'AI', 'Automation', 'CRM', 'Sales', 'Odoo', 'eLearning',
  'Python', 'Programming', 'Courses', 'Advanced', 'Beginner',
  'Marketing', 'HR', 'Finance', 'Design',
];

export default function CoursesPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showTagPicker, setShowTagPicker] = useState(false);

  // All available tags = default + any custom ones added
  const [availableTags, setAvailableTags] = useState(DEFAULT_TAGS);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const t = customTagInput.trim();
    if (t && !availableTags.includes(t)) {
      setAvailableTags((prev) => [...prev, t]);
    }
    if (t && !selectedTags.includes(t)) {
      setSelectedTags((prev) => [...prev, t]);
    }
    setCustomTagInput('');
  };

  const handleCustomTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="p-6">
        {/* Header Bar */}
        <div className="mb-4 flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Tag picker toggle */}
          <button
            onClick={() => setShowTagPicker(!showTagPicker)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors',
              showTagPicker || selectedTags.length > 0
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input text-muted-foreground hover:bg-accent'
            )}
          >
            <Tag className="h-4 w-4" />
            Tags
            {selectedTags.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {selectedTags.length}
              </span>
            )}
          </button>

          {/* View Toggle */}
          <div className="flex gap-0.5 rounded-lg border border-input bg-card p-1">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'rounded px-2.5 py-1.5 transition-colors',
                view === 'kanban'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              )}
              title="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'rounded px-2.5 py-1.5 transition-colors',
                view === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tag Picker Panel */}
        {showTagPicker && (
          <div className="mb-4 rounded-lg border border-input bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Filter by tags</span>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    selectedTags.includes(tag)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
            {/* Add custom tag */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleCustomTagKeyDown}
                placeholder="Add a custom tag..."
                className="h-8 w-48 rounded-md border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button
                onClick={addCustomTag}
                disabled={!customTagInput.trim()}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Active tag pills */}
        {selectedTags.length > 0 && !showTagPicker && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtering by:</span>
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {tag}
                <button onClick={() => toggleTag(tag)} className="hover:text-primary/70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setSelectedTags([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}

        {/* Content */}
        {view === 'kanban' ? (
          <CourseKanban searchQuery={searchQuery} selectedTags={selectedTags} />
        ) : (
          <CourseList searchQuery={searchQuery} selectedTags={selectedTags} />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="fixed bottom-8 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:bg-primary/90 hover:shadow-xl active:scale-95"
        title="Create new course"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Create Dialog */}
      <CreateCourseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
