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

interface Course {
  id: string;
  title: string;
  tags: string[];
  viewsCount: number;
  contentsCount: number;
  duration: string;
  isPublished: boolean;
}

const initialCourses: Course[] = [
  { id: '1', title: 'Introduction to Odoo AI', tags: ['AI', 'Odoo', 'Automation'], viewsCount: 15, contentsCount: 6, duration: '25:30', isPublished: true },
  { id: '2', title: 'Basics of Odoo CRM', tags: ['CRM', 'Sales', 'Odoo'], viewsCount: 20, contentsCount: 8, duration: '20:35', isPublished: true },
  { id: '3', title: 'About Odoo Courses', tags: ['eLearning', 'Odoo', 'Courses'], viewsCount: 10, contentsCount: 5, duration: '10:20', isPublished: true },
  { id: '4', title: 'Advanced Python Programming', tags: ['Python', 'Programming'], viewsCount: 45, contentsCount: 12, duration: '45:00', isPublished: false },
];

export default function CourseList({ searchQuery }: { searchQuery: string }) {
  const [courses, setCourses] = useState(initialCourses);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeTag = (courseId: string, tag: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, tags: c.tags.filter((t) => t !== tag) } : c
      )
    );
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
    <>
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Course Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tags</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Views</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Contents</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Duration</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
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
                <td className="px-4 py-3 text-center text-sm text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-gray-400" />
                    {course.viewsCount}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    {course.contentsCount}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
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
