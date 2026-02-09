'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/tabs';
import { Switch } from '@/components/shared/switch';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shared/dialog';
import { ArrowLeft, Plus, ImageIcon, X, Eye, Mail, UserPlus, Copy, Check, ExternalLink, Save, Lock } from 'lucide-react';
import Link from 'next/link';
import ContentTab from '@/components/admin/editor/ContentTab';
import DescriptionTab from '@/components/admin/editor/DescriptionTab';
import QuizTab from '@/components/admin/editor/QuizTab';
import { useCourseStore } from '@/lib/course-store';
import { useContentStore } from '@/lib/content-store';

export default function InstructorCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { courses, updateCourse, togglePublish } = useCourseStore();
  const { getContent, setDescription: setStoreDescription, setOptions } = useContentStore();

  // Get description from content store
  const { description: storeDescription } = getContent(resolvedParams.id);

  const [isPublished, setIsPublished] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [courseTitle, setCourseTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const initId = React.useRef<string | null>(null);

  // Load course data from store on mount
  useEffect(() => {
    if (initId.current === resolvedParams.id) return;

    const course = courses.find((c) => c.id === resolvedParams.id);
    if (course) {
      setCourseTitle(course.title);
      setTags(course.tags);
      setIsPublished(course.isPublished);
      // Initialize content store with description if empty
      if (course.description && !storeDescription) {
        setStoreDescription(resolvedParams.id, course.description);
      }
      setOptions(resolvedParams.id, {
        scheduledPublishDate: course.scheduledPublishDate ?? undefined,
        assignedInstructor: course.assignedInstructor ?? undefined,
      });
      initId.current = resolvedParams.id;
    }
  }, [courses, resolvedParams.id, setStoreDescription, storeDescription, setOptions]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handlePublishToggle = (checked: boolean) => {
    setIsPublished(checked);
    togglePublish(resolvedParams.id);
  };

  const handleSave = async () => {
    setIsSaving(true);
    updateCourse(resolvedParams.id, {
      title: courseTitle,
      tags,
      isPublished,
      description: storeDescription,
    });
    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-14 z-40 border-b bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/instructor/courses"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="h-6 w-px bg-border" />
            <input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="border-none bg-transparent text-lg font-bold text-foreground outline-none focus:ring-0"
              placeholder="Course title..."
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Published</span>
              <Switch checked={isPublished} onCheckedChange={handlePublishToggle} />
            </div>
            <Button variant="odoo" className="gap-1.5" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : saveSuccess ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save</>}
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-2 flex items-center gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Add tag..."
            className="h-6 w-24 border-none bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Instructor restriction notice */}
      <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        <Lock className="h-4 w-4 shrink-0" />
        Instructor mode — Options tab and course deletion are restricted to Admin users.
      </div>

      {/* Main */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="options" disabled className="opacity-50">
              Options <Lock className="ml-1 h-3 w-3" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <ContentTab courseId={resolvedParams.id} />
          </TabsContent>
          <TabsContent value="description">
            <DescriptionTab courseId={resolvedParams.id} />
          </TabsContent>
          <TabsContent value="quiz">
            <QuizTab courseId={resolvedParams.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
