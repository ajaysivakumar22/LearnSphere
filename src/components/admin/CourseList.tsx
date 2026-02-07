'use client';

import { useState } from 'react';
import { Eye, FileText, Clock, Edit, Share2, X, ExternalLink, Copy, Check } from 'lucide-react';
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
import { useCourseStore, type Course } from '@/lib/course-store';

export default function CourseList({ searchQuery, selectedTags = [] }: { searchQuery: string; selectedTags?: string[] }) {
  const { courses, removeTag } = useCourseStore();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => c.tags.includes(tag));
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
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(course.id, tag)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-purple-200"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.viewsCount}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.contentsCount}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.duration}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={course.isPublished ? 'success' : 'outline'}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Badge>
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
                  </div>
                </td>
              </tr>
            ))}
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
    </>
  );
}
