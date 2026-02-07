'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Edit, ExternalLink, Copy, Check } from 'lucide-react';
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
  {
    id: '1',
    title: 'Introduction to Odoo AI',
    tags: ['AI', 'Odoo', 'Automation'],
    viewsCount: 15,
    contentsCount: 6,
    duration: '25:30',
    isPublished: true,
  },
  {
    id: '2',
    title: 'Basics of Odoo CRM',
    tags: ['CRM', 'Sales', 'Odoo'],
    viewsCount: 20,
    contentsCount: 8,
    duration: '20:35',
    isPublished: true,
  },
  {
    id: '3',
    title: 'About Odoo Courses',
    tags: ['eLearning', 'Odoo', 'Courses'],
    viewsCount: 10,
    contentsCount: 5,
    duration: '10:20',
    isPublished: true,
  },
  {
    id: '4',
    title: 'Advanced Python Programming',
    tags: ['Python', 'Programming'],
    viewsCount: 45,
    contentsCount: 12,
    duration: '45:00',
    isPublished: false,
  },
];

export default function CourseKanban({ searchQuery }: { searchQuery: string }) {
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
      <div className="space-y-4">
        {filtered.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-6 p-5">
              {/* Left: Name + Tags */}
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-primary">
                  {course.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(course.id, tag)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-purple-200"
                        title={`Remove ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Middle: Stats */}
              <div className="hidden shrink-0 sm:block">
                <table className="text-sm">
                  <tbody>
                    <tr>
                      <td className="pr-4 text-gray-500">Views</td>
                      <td className="font-medium text-gray-900">{course.viewsCount}</td>
                    </tr>
                    <tr>
                      <td className="pr-4 text-gray-500">Contents</td>
                      <td className="font-medium text-gray-900">{course.contentsCount}</td>
                    </tr>
                    <tr>
                      <td className="pr-4 text-gray-500">Duration</td>
                      <td className="font-medium text-gray-900">{course.duration}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[80px]"
                  onClick={() => handleShare(course)}
                >
                  <Share2 className="mr-1.5 h-3.5 w-3.5" />
                  Share
                </Button>
                <Link href={`/admin/courses/${course.id}/edit`}>
                  <Button variant="outline" size="sm" className="min-w-[80px] w-full">
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
              </div>

              {/* Published Ribbon */}
              {course.isPublished ? (
                <div className="absolute -right-10 top-5 rotate-45 bg-green-500 px-12 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  Published
                </div>
              ) : (
                <div className="absolute -right-10 top-5 rotate-45 bg-gray-400 px-12 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  Draft
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-lg text-gray-500">No courses found</p>
            <p className="text-sm text-gray-400">
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
    </>
  );
}
