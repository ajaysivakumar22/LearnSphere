'use client';

import { useState } from 'react';
import { Eye, FileText, Clock, Edit, Share2, ExternalLink, Copy, Check, Trash2, Loader2 } from 'lucide-react';
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
import { useCourseAPI, type Course } from '@/lib/course-api-context';
import { useAuth } from '@/lib/auth-context';

export default function CourseList({ searchQuery, selectedTags = [] }: { searchQuery: string; selectedTags?: string[] }) {
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

  const filtered = courses.filter((c) => {
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
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((course) => (
              <tr key={course.id} className="hover:bg-accent/50">
                <td className="px-4 py-3 text-sm font-semibold text-primary">{course.title}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(course.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.viewsCount || 0}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.contentsCount || 0}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.duration || '0:00'}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleTogglePublish(course.id)}
                    disabled={publishing === course.id}
                    className="cursor-pointer"
                  >
                    <Badge variant={course.isPublished ? 'success' : 'outline'}>
                      {publishing === course.id ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : null}
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleShare(course)}>
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    {/* Delete button - Admin only */}
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(course)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No courses found. Try adjusting your search or create a new course.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
