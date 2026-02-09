'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, LayoutGrid, List, X, Tag, Eye, FileText, Clock, Edit, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCourseAPI, type Course } from '@/lib/course-api-context';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { Input } from '@/components/shared/input';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shared/dialog';
import { useAuth } from '@/lib/auth-context';

const DEFAULT_TAGS = [
  'AI', 'Automation', 'CRM', 'Sales', 'Odoo', 'eLearning',
  'Python', 'Programming', 'Courses', 'Advanced', 'Beginner',
  'Marketing', 'HR', 'Finance', 'Design',
];

export default function InstructorCoursesPage() {
  const { courses, createCourse, updateCourse, togglePublish, loading } = useCourseAPI();
  const { userId, userName } = useAuth();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [availableTags, setAvailableTags] = useState(DEFAULT_TAGS);
  const [customTagInput, setCustomTagInput] = useState('');

  // Create dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Instructor can only see courses they created OR are assigned to
  const instructorCourses = courses.filter(c =>
    c.createdBy === userId || (c.assignedInstructor && c.assignedInstructor === userName)
  );

  const filtered = instructorCourses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => c.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const t = customTagInput.trim();
    if (t && !availableTags.includes(t)) setAvailableTags((prev) => [...prev, t]);
    if (t && !selectedTags.includes(t)) setSelectedTags((prev) => [...prev, t]);
    setCustomTagInput('');
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createCourse(newTitle.trim(), '', [], undefined, undefined);
    setNewTitle('');
    setShowCreateDialog(false);
  };

  const removeTag = async (courseId: string, tag: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const newTags = course.tags.filter(t => t !== tag);
      await updateCourse(courseId, { tags: newTags });
    }
  };

  const handleShare = (course: Course) => {
    setShareUrl(`${window.location.origin}/courses/${course.id}`);
    setCopied(false);
    setShareDialogOpen(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="p-6">
        {/* Info Banner */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
          <span>📋</span>
          <span>Instructor view — You can create courses and edit content. Settings and course deletion require Admin access.</span>
        </div>

        {/* Header Bar */}
        <div className="mb-4 flex items-center gap-4">
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

          <div className="flex gap-0.5 rounded-lg border border-input bg-card p-1">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'rounded px-2.5 py-1.5 transition-colors',
                view === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'rounded px-2.5 py-1.5 transition-colors',
                view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tag Picker */}
        {showTagPicker && (
          <div className="mb-4 rounded-lg border border-input bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Filter by tags</span>
              {selectedTags.length > 0 && (
                <button onClick={() => setSelectedTags([])} className="text-xs text-muted-foreground hover:text-foreground">Clear all</button>
              )}
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    selectedTags.includes(tag)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}>
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="text" value={customTagInput} onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                placeholder="Add a custom tag..."
                className="h-8 w-48 rounded-md border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              <button onClick={addCustomTag} disabled={!customTagInput.trim()}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Add</button>
            </div>
          </div>
        )}

        {/* Active tags */}
        {selectedTags.length > 0 && !showTagPicker && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtering by:</span>
            {selectedTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {tag}
                <button onClick={() => toggleTag(tag)} className="hover:text-primary/70"><X className="h-3 w-3" /></button>
              </span>
            ))}
            <button onClick={() => setSelectedTags([])} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((course) => (
              <div key={course.id} className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
                <div className="relative h-32 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                  {course.isPublished && (
                    <div className="absolute -right-8 top-4 rotate-45 bg-green-500 px-10 py-1 text-xs font-semibold text-white shadow-md">
                      Published
                    </div>
                  )}
                  {!course.isPublished && (
                    <div className="absolute -right-6 top-4 rotate-45 bg-gray-400 px-10 py-1 text-xs font-semibold text-white shadow-md">
                      Draft
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{course.title}</h3>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {course.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {tag}
                        <button onClick={() => removeTag(course.id, tag)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {course.viewsCount}</span>
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {course.contentsCount}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link href={`/instructor/courses/${course.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleShare(course)}>
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Course Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tags</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Views</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Contents</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((course) => (
                  <tr key={course.id} className="border-t border-border transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{course.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {course.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">{course.viewsCount}</td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">{course.contentsCount}</td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">{course.duration}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={course.isPublished ? 'default' : 'secondary'} className="text-xs">
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <Link href={`/instructor/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => handleShare(course)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
            <p className="text-lg text-muted-foreground">No courses found.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or create a new course.</p>
          </div>
        ) : null}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="fixed bottom-8 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:bg-primary/90 hover:shadow-xl active:scale-95"
        title="Create new course"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Provide a name.. (Eg: Basics of Odoo CRM)"
              className="text-sm" autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && newTitle.trim()) handleCreate(); }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button variant="odoo" onClick={handleCreate} disabled={!newTitle.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Share Course</DialogTitle>
            <DialogDescription>Share this course link with others.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-4">
            <Input value={shareUrl} readOnly className="flex-1 text-sm" />
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <><Check className="h-4 w-4 text-green-500" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Close</Button>
            <Button variant="odoo" onClick={() => window.open(shareUrl, '_blank')} className="gap-1.5">
              <ExternalLink className="h-4 w-4" /> Open
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
