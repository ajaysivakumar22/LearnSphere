'use client';

import { useState } from 'react';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import CourseKanban from '@/components/admin/CourseKanban';
import CourseList from '@/components/admin/CourseList';
import CreateCourseDialog from '@/components/admin/CreateCourseDialog';

export default function CoursesPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="p-6">
        {/* Header Bar */}
        <div className="mb-6 flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-0.5 rounded-lg border border-gray-300 bg-white p-1">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'rounded px-2.5 py-1.5 transition-colors',
                view === 'kanban'
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:bg-gray-100'
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
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {view === 'kanban' ? (
          <CourseKanban searchQuery={searchQuery} />
        ) : (
          <CourseList searchQuery={searchQuery} />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="fixed bottom-8 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:scale-110 hover:bg-primary/90 hover:shadow-xl active:scale-95"
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
