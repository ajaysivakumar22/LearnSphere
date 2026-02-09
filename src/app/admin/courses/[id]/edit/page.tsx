'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { ArrowLeft, Plus, ImageIcon, X, Eye, Mail, UserPlus, Copy, Check, ExternalLink, Save, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ContentTab, { ContentItem } from '@/components/admin/editor/ContentTab';
import DescriptionTab from '@/components/admin/editor/DescriptionTab';
import OptionsTab from '@/components/admin/editor/OptionsTab';
import QuizTab from '@/components/admin/editor/QuizTab';
import { useCourseAPI } from '@/lib/course-api-context';
import { useContentStore } from '@/lib/content-store';
import { cn } from '@/lib/utils';

// Custom hook for tracking focused field
function useFocusedField() {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  return { focusedField, setFocusedField };
}

export default function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();

  // Use Real API Context exclusively
  const { courses, updateCourse, createCourse, togglePublish, refresh } = useCourseAPI();
  const { getContent, setContents, setQuizQuestions, setDescription: setStoreDescription, setOptions } = useContentStore();

  // Get description and content from content store
  const { description: storeDescription, contents: storeContents, quizQuestions: storeQuizQuestions, options: storeOptions } = getContent(resolvedParams.id);

  const { focusedField, setFocusedField } = useFocusedField();

  const [isPublished, setIsPublished] = useState(false);
  const [isShareEnabled, setIsShareEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [courseTitle, setCourseTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [responsible, setResponsible] = useState('');
  const [courseImage, setCourseImage] = useState<string | null>(null);

  // New Course Dialog State
  const [showNewCourseDialog, setShowNewCourseDialog] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseTags, setNewCourseTags] = useState<string[]>([]);
  const [newCourseTagInput, setNewCourseTagInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Refs for input positioning
  const titleRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const responsibleRef = useRef<HTMLDivElement>(null);

  const initId = React.useRef<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  // Load course data from API on mount
  useEffect(() => {
    const course = courses.find((c) => c.id === resolvedParams.id);

    // If course found and not initialized OR validation mismatch, sync state
    if (course) {
      if (initId.current !== resolvedParams.id) {
        setCourseTitle(course.title);
        setTags(course.tags || []);
        setIsPublished(course.isPublished);
        setCourseImage(course.imageUrl);
        setResponsible(course.assignedInstructor || '');

        if (course.description) {
          setStoreDescription(resolvedParams.id, course.description);
        }

        setOptions(resolvedParams.id, {
          scheduledPublishDate: course.scheduledPublishDate ?? undefined,
          assignedInstructor: course.assignedInstructor ?? undefined,
          price: course.price ?? 0,
          isPaid: course.isPaid ?? false,
        });

        initId.current = resolvedParams.id;
      }
    }
  }, [courses, resolvedParams.id, setStoreDescription, setOptions]);

  // Fetch Lessons (Content) from Backend
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/courses/${resolvedParams.id}/lessons`);
        if (res.ok) {
          const lessons = await res.json();
          const nonQuizLessons = lessons.filter((l: any) => l.type !== 'quiz');
          const quizLesson = lessons.find((l: any) => l.type === 'quiz');

          // Map backend lessons to ContentItem format
          const formattedContent: ContentItem[] = nonQuizLessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            category: l.type.charAt(0).toUpperCase() + l.type.slice(1), // video -> Video
            url: l.contentUrl,
            description: '', // Backend doesn't store description on lesson table yet?
          }));
          setContents(resolvedParams.id, formattedContent);

          if (quizLesson && quizLesson.contentUrl) {
            try {
              const parsedQuiz = JSON.parse(quizLesson.contentUrl);
              setQuizQuestions(resolvedParams.id, parsedQuiz);
            } catch (e) {
              console.error("Failed to parse quiz data", e);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch lessons", error);
      } finally {
        setIsLoadingContent(false);
      }
    };
    fetchContent();
  }, [resolvedParams.id, setContents, setQuizQuestions]);


  // Preview
  const [showPreview, setShowPreview] = useState(false);

  // Attendees
  const [showContactAttendeesDialog, setShowContactAttendeesDialog] = useState(false);
  const [showAddAttendeesDialog, setShowAddAttendeesDialog] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeeList, setAttendeeList] = useState<string[]>([
    'salman@example.com',
    'priya@example.com',
  ]);

  // Share link
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const shareLink = typeof window !== 'undefined'
    ? `${window.location.origin}/learner/courses/${resolvedParams.id}/learn`
    : `/learner/courses/${resolvedParams.id}/learn`;

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addAttendee = () => {
    const email = attendeeEmail.trim();
    if (email && !attendeeList.includes(email)) {
      setAttendeeList([...attendeeList, email]);
    }
    setAttendeeEmail('');
  };

  const removeAttendee = (email: string) => {
    setAttendeeList(attendeeList.filter((e) => e !== email));
  };

  const handlePublishToggle = (checked: boolean) => {
    setIsPublished(checked);
    togglePublish(resolvedParams.id); // From API
  };

  const syncContentToBackend = async () => {
    try {
      // 1. Fetch current backend state
      const res = await fetch(`/api/courses/${resolvedParams.id}/lessons`);
      if (!res.ok) throw new Error('Failed to fetch existing lessons');
      const existingLessons: any[] = await res.json();

      // Combine storeContents and quizQuestions into a single list for sync
      let allItemsToSync = [...storeContents];
      if (storeQuizQuestions && storeQuizQuestions.length > 0) {
        // Check if we already have a quiz lesson in backend to preserve ID
        const existingQuiz = existingLessons.find(l => l.type === 'quiz');
        allItemsToSync.push({
          id: existingQuiz ? existingQuiz.id : Date.now().toString(), // Use existing ID or temp
          title: 'Course Quiz',
          category: 'Quiz',
          url: JSON.stringify(storeQuizQuestions),
          description: ''
        });
      }

      // 2. Identify Deleted items (In Backend but NOT in New List)
      // Note: If quiz is cleared in store, it won't be in allItemsToSync, thus deleted from backend. Correct.
      const syncIds = new Set(allItemsToSync.map(c => c.id));
      const toDelete = existingLessons.filter(l => !syncIds.has(l.id));

      await Promise.all(toDelete.map(lesson =>
        fetch(`/api/lessons/${lesson.id}`, { method: 'DELETE' })
      ));

      // 3. Identify New and Updated items
      const upsertPromises = allItemsToSync.map(async (item, index) => {
        const isNew = !isNaN(Number(item.id)); // Simple check for temp numeric IDs

        const payload = {
          title: item.title,
          type: item.category.toLowerCase(),
          contentUrl: item.url,
          orderIndex: index
        };

        if (isNew) {
          // Create
          await fetch(`/api/courses/${resolvedParams.id}/lessons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          // Update
          await fetch(`/api/lessons/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      });

      await Promise.all(upsertPromises);

      // 4. Refresh local store from backend to get real IDs for new items
      // We re-fetch to ensure we have the correct IDs
      const refreshRes = await fetch(`/api/courses/${resolvedParams.id}/lessons`);
      if (refreshRes.ok) {
        const lessons = await refreshRes.json();
        const nonQuizLessons = lessons.filter((l: any) => l.type !== 'quiz');
        // We only update "Contents" here, QuizQuestions is already in store
        const formattedContent: ContentItem[] = nonQuizLessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          category: l.type.charAt(0).toUpperCase() + l.type.slice(1),
          url: l.contentUrl,
          description: '',
        }));
        setContents(resolvedParams.id, formattedContent);
      }
    } catch (error) {
      console.error('Error syncing content:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // 1. Update Course Metadata
    await updateCourse(resolvedParams.id, {
      title: courseTitle,
      tags,
      isPublished,
      description: storeDescription,
      imageUrl: courseImage,
      assignedInstructor: responsible,
      price: storeOptions?.price,
      isPaid: storeOptions?.isPaid,
    });

    // 2. Sync Content
    await syncContentToBackend();

    // 3. Refresh Context
    await refresh();

    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // New Course Dialog Functions
  const addNewCourseTag = () => {
    const t = newCourseTagInput.trim();
    if (t && !newCourseTags.includes(t)) {
      setNewCourseTags([...newCourseTags, t]);
    }
    setNewCourseTagInput('');
  };

  const removeNewCourseTag = (tag: string) => {
    setNewCourseTags(newCourseTags.filter((t) => t !== tag));
  };

  const handleNewCourseTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addNewCourseTag();
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) return;

    setIsCreating(true);
    try {
      const course = await createCourse(newCourseTitle.trim(), newCourseDescription.trim() || undefined, newCourseTags);
      if (course) {
        setShowNewCourseDialog(false);
        setNewCourseTitle('');
        setNewCourseDescription('');
        setNewCourseTags([]);
        router.push(`/admin/courses/${course.id}/edit`);
      }
    } catch (err) {
      console.error('Failed to create course:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Input indicator component
  const InputIndicator = ({ fieldId }: { fieldId: string }) => (
    <div className={cn(
      "absolute -left-6 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-primary transition-opacity duration-200",
      focusedField === fieldId ? "opacity-100" : "opacity-0"
    )} />
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Action Bar */}
      <div className="border-b bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/courses" className="rounded-lg p-2 hover:bg-accent">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {/* New Button - Opens Dialog Now */}
            <Button variant="outline" size="sm" onClick={() => setShowNewCourseDialog(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Publish on website */}
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <span className="text-sm text-muted-foreground">Publish on website</span>
              <Switch checked={isPublished} onCheckedChange={handlePublishToggle} />
            </div>

            {/* Share on web */}
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <span className="text-sm text-muted-foreground">Share on web</span>
              <Switch checked={isShareEnabled} onCheckedChange={setIsShareEnabled} />
            </div>

            {/* Preview */}
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Preview
            </Button>

            {/* Save */}
            <Button
              variant="odoo"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[90px]"
            >
              {isSaving ? (
                'Saving...'
              ) : saveSuccess ? (
                <><Check className="mr-1.5 h-3.5 w-3.5" /> Saved!</>
              ) : (
                <><Save className="mr-1.5 h-3.5 w-3.5" /> Save</>
              )}
            </Button>
          </div>
        </div>

        {/* Share link bar (shown when "Share on web" is enabled) */}
        {isShareEnabled && (
          <div className="mt-3 flex items-center gap-3 rounded-md border bg-muted/50 px-4 py-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 truncate text-sm text-primary">{shareLink}</span>
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        )}

        {/* Published status banner */}
        {isPublished && (
          <div className="mt-2 rounded-md bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            This course is published and visible on the website.
          </div>
        )}
      </div>

      {/* Form Area */}
      <div className="mx-auto max-w-5xl p-6">
        {/* Contact / Add Attendees */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="odoo" size="sm" onClick={() => setShowContactAttendeesDialog(true)}>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Contact Attendees
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAddAttendeesDialog(true)}>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Add Attendees
          </Button>
        </div>

        {/* Course Title, Tags, Responsible + Image */}
        <div className="mb-6 flex gap-6">
          <div className="flex-1 space-y-4 pl-8">
            {/* Course Title with Indicator */}
            <div ref={titleRef} className="relative">
              <InputIndicator fieldId="title" />
              <Label className="mb-1 block text-sm text-muted-foreground">
                Course Title: <span className="text-red-500">*</span>
              </Label>
              <Input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g: Basics of Odoo CRM"
                className={cn(
                  "text-lg font-medium text-primary transition-all",
                  focusedField === 'title' && "ring-2 ring-primary/30"
                )}
              />
            </div>

            {/* Tags with Indicator */}
            <div ref={tagsRef} className="relative">
              <InputIndicator fieldId="tags" />
              <Label className="mb-1 block text-sm text-muted-foreground">Tags:</Label>
              <div
                className={cn(
                  "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 transition-all",
                  focusedField === 'tags' && "border-primary ring-2 ring-primary/30"
                )}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-purple-900 dark:hover:text-purple-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => { addTag(); setFocusedField(null); }}
                  onFocus={() => setFocusedField('tags')}
                  placeholder={tags.length === 0 ? 'Add tags...' : ''}
                  className="min-w-[80px] flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Responsible with Indicator */}
            <div ref={responsibleRef} className="relative">
              <InputIndicator fieldId="responsible" />
              <Label className="mb-1 block text-sm text-muted-foreground">Responsible:</Label>
              <Input
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                onFocus={() => setFocusedField('responsible')}
                onBlur={() => setFocusedField(null)}
                placeholder="Name of the responsible person"
                className={cn(
                  "transition-all",
                  focusedField === 'responsible' && "ring-2 ring-primary/30"
                )}
              />
            </div>
          </div>

          <div className="shrink-0">
            <div className="flex h-40 w-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 text-center transition-colors hover:border-primary hover:bg-primary/5">
              {courseImage ? (
                <div className="relative h-full w-full">
                  <img src={courseImage} alt="Course" className="h-full w-full rounded-lg object-cover" />
                  <button
                    onClick={() => setCourseImage(null)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Course image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Convert to Base64 for persistence
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCourseImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-0 border-b">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            {isLoadingContent ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <ContentTab courseId={resolvedParams.id} />
            )}
          </TabsContent>
          <TabsContent value="description">
            <DescriptionTab courseId={resolvedParams.id} />
          </TabsContent>
          <TabsContent value="options">
            <OptionsTab courseId={resolvedParams.id} />
          </TabsContent>
          <TabsContent value="quiz">
            <QuizTab courseId={resolvedParams.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ===== New Course Dialog ===== */}
      <Dialog open={showNewCourseDialog} onOpenChange={setShowNewCourseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm">
                Course Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="Enter course title..."
                autoFocus
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-muted-foreground">(optional)</Label>
              <Label className="mb-1.5 block text-sm">Description</Label>
              <textarea
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                rows={3}
                placeholder="Brief description of the course..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Tags</Label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]">
                {newCourseTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    {tag}
                    <button onClick={() => removeNewCourseTag(tag)} className="hover:text-purple-900 dark:hover:text-purple-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={newCourseTagInput}
                  onChange={(e) => setNewCourseTagInput(e.target.value)}
                  onKeyDown={handleNewCourseTagKeyDown}
                  onBlur={addNewCourseTag}
                  placeholder={newCourseTags.length === 0 ? 'Add tags...' : ''}
                  className="min-w-[80px] flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Suggestions: AI, Python, Web, Odoo, Design
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCourseDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="odoo"
              onClick={handleCreateCourse}
              disabled={!newCourseTitle.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create & Continue
                  <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Preview Dialog ===== */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
            <DialogDescription>This is how learners will see your course.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border p-6">
            {courseImage && (
              <img src={courseImage} alt="Course" className="mb-4 h-48 w-full rounded-lg object-cover" />
            )}
            <h2 className="text-2xl font-bold text-primary">{courseTitle || 'Untitled Course'}</h2>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {responsible && (
              <p className="mt-3 text-sm text-muted-foreground">Instructor: {responsible}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className={isPublished ? 'text-green-600' : 'text-orange-500'}>
                {isPublished ? '● Published' : '● Draft'}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Contact Attendees Dialog ===== */}
      <Dialog open={showContactAttendeesDialog} onOpenChange={setShowContactAttendeesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Attendees</DialogTitle>
            <DialogDescription>
              Send a message to all enrolled attendees ({attendeeList.length} attendees).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1 block text-sm">Subject</Label>
              <Input
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="e.g. Course update notification"
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Message</Label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={5}
                placeholder="Write your message to attendees..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Recipients</Label>
              <div className="flex flex-wrap gap-1.5">
                {attendeeList.map((email) => (
                  <span key={email} className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {email}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactAttendeesDialog(false)}>Cancel</Button>
            <Button
              variant="odoo"
              onClick={() => {
                alert(`Message sent to ${attendeeList.length} attendees!`);
                setContactSubject('');
                setContactMessage('');
                setShowContactAttendeesDialog(false);
              }}
              disabled={!contactSubject.trim() || !contactMessage.trim()}
            >
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Add Attendees Dialog ===== */}
      <Dialog open={showAddAttendeesDialog} onOpenChange={setShowAddAttendeesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Attendees</DialogTitle>
            <DialogDescription>
              Invite people to enroll in this course by adding their email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1 block text-sm">Email address</Label>
              <div className="flex gap-2">
                <Input
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  placeholder="user@example.com"
                  onKeyDown={(e) => { if (e.key === 'Enter') addAttendee(); }}
                />
                <Button variant="odoo" size="sm" onClick={addAttendee}>Add</Button>
              </div>
            </div>
            <div>
              <Label className="mb-1 block text-sm">Current Attendees ({attendeeList.length})</Label>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {attendeeList.map((email) => (
                  <div key={email} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                    <span>{email}</span>
                    <button onClick={() => removeAttendee(email)} className="text-red-500 hover:text-red-700">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAttendeesDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
