'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Edit, ExternalLink, Copy, Check, Trash2, Loader2, Eye, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shared/button';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shared/dialog';
import { Input } from '@/components/shared/input';
import { useCourseAPI, type Course } from '@/lib/course-api-context';
import { useAuth } from '@/lib/auth-context';

export default function CourseKanban({ searchQuery, selectedTags = [] }: { searchQuery: string; selectedTags?: string[] }) {
  const { courses, loading, deleteCourse, togglePublish } = useCourseAPI();
  const { userRole } = useAuth();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';

  const safeCourses = Array.isArray(courses) ? courses : [];
  const filtered = safeCourses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => (c.tags || []).includes(tag));
    return matchesSearch && matchesTags;
  });

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

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    try {
      await deleteCourse(courseToDelete.id);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (err) {
      console.error('Error deleting course:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (courseId: string) => {
    setPublishing(courseId);
    try {
      await togglePublish(courseId);
    } finally {
      setPublishing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg dark:border-border"
          >
            {/* Card Header / Image Area */}
            <div className="relative h-36 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              {course.imageUrl ? (
                <img
                  key={course.imageUrl}
                  src={course.imageUrl}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-purple-300/50">
                  {course.title.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Ribbon Status */}
              {course.isPublished ? (
                <div className="absolute -right-8 top-4 rotate-45 bg-green-500 px-10 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  Published
                </div>
              ) : (
                <div className="absolute -right-8 top-4 rotate-45 bg-gray-400 px-10 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  Draft
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="flex flex-col p-5">
              <h3 className="mb-2 line-clamp-1 text-base font-bold text-foreground" title={course.title}>
                {course.title}
              </h3>

              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-1.5 h-6 overflow-hidden">
                {(course.tags || []).slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                    {tag}
                  </span>
                ))}
                {(course.tags || []).length > 3 && (
                  <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">+{course.tags.length - 3}</span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="mb-4 grid grid-cols-3 gap-2 border-y py-3 text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{course.viewsCount || 0}</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-x px-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{course.contentsCount || 0} lessons</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{course.duration || '0:00'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link href={`/admin/courses/${course.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                </Link>

                <Button variant="ghost" size="sm" className="h-8 w-8 px-0 text-muted-foreground hover:text-foreground" onClick={() => handleShare(course)} title="Share">
                  <Share2 className="h-3.5 w-3.5" />
                </Button>

                {/* Publish Toggle */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-2 text-xs",
                      course.isPublished ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleTogglePublish(course.id)}
                    disabled={publishing === course.id}
                    title={course.isPublished ? "Unpublish" : "Publish"}
                  >
                    {publishing === course.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : course.isPublished ? (
                      <span className="flex items-center gap-1 font-bold">PUB</span>
                    ) : (
                      <span className="flex items-center gap-1">DRAFT</span>
                    )}
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteClick(course)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
            <p className="text-lg text-muted-foreground">No courses found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or create a new course
            </p>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Share Course</DialogTitle>
            <DialogDescription>
              Copy the link below to share this course with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-4">
            <div className="relative flex-1">
              <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={shareUrl}
                readOnly
                className="pl-9 pr-4 font-mono text-sm"
              />
            </div>
            <Button
              variant="odoo"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
