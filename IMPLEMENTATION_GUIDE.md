# LearnSphere Implementation Guide

This guide provides step-by-step instructions for implementing each module of the LearnSphere platform.

## Module A: Admin/Instructor Backoffice

### A1. Courses Dashboard (Kanban & List Views)

#### File: `src/app/admin/courses/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/shared/button';
import CourseKanban from '@/components/admin/CourseKanban';
import CourseList from '@/components/admin/CourseList';
import CreateCourseDialog from '@/components/admin/CreateCourseDialog';

export default function CoursesPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-80 rounded-lg border border-gray-300 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 rounded-lg border border-gray-300 bg-white p-1">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'rounded px-3 py-1.5 transition-colors',
                view === 'kanban' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'rounded px-3 py-1.5 transition-colors',
                view === 'list' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Create Button */}
          <Button variant="odoo" onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === 'kanban' ? (
        <CourseKanban searchQuery={searchQuery} />
      ) : (
        <CourseList searchQuery={searchQuery} />
      )}

      {/* Create Dialog */}
      <CreateCourseDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
}
```

#### File: `src/components/admin/CourseKanban.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, FileText, Clock, Share2, Edit } from 'lucide-react';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Course {
  id: string;
  title: string;
  tags: string[];
  viewsCount: number;
  isPublished: boolean;
  // Add other fields
}

export default function CourseKanban({ searchQuery }: { searchQuery: string }) {
  const [coursesData, setCoursesData] = useState<Course[]>([]);

  // Fetch courses from database
  useEffect(() => {
    async function fetchCourses() {
      // Implement fetch logic
    }
    fetchCourses();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {coursesData.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="kanban-card relative overflow-hidden"
        >
          {/* Status Ribbon */}
          {course.isPublished && (
            <div className="status-ribbon">Published</div>
          )}
          {!course.isPublished && (
            <div className="status-ribbon draft">Draft</div>
          )}

          {/* Course Title */}
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{course.title}</h3>

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {course.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{course.viewsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>8</span> {/* Contents count */}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>2h 30m</span> {/* Duration */}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="odoo" size="sm" className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

### A2. Course Editor (4-Tab Interface)

#### File: `src/app/admin/courses/[id]/edit/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/tabs';
import { Switch } from '@/components/shared/switch';
import { Button } from '@/components/shared/button';
import ContentTab from '@/components/admin/editor/ContentTab';
import DescriptionTab from '@/components/admin/editor/DescriptionTab';
import OptionsTab from '@/components/admin/editor/OptionsTab';
import QuizTab from '@/components/admin/editor/QuizTab';

export default function CourseEditorPage({ params }: { params: { id: string } }) {
  const [isPublished, setIsPublished] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
            <p className="text-sm text-gray-600">Basics of Odoo CRM</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Published</span>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
            <Button variant="outline">Preview</Button>
            <Button variant="odoo">Save Changes</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <ContentTab courseId={params.id} />
          </TabsContent>

          <TabsContent value="description">
            <DescriptionTab courseId={params.id} />
          </TabsContent>

          <TabsContent value="options">
            <OptionsTab courseId={params.id} />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizTab courseId={params.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

#### File: `src/components/admin/editor/OptionsTab.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Select } from '@/components/shared/select';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { RadioGroup, RadioGroupItem } from '@/components/shared/radio-group';

export default function OptionsTab({ courseId }: { courseId: string }) {
  const [visibility, setVisibility] = useState('everyone');
  const [accessRule, setAccessRule] = useState('open');
  const [price, setPrice] = useState('');

  return (
    <div className="card-odoo max-w-2xl p-6">
      <div className="space-y-6">
        {/* Visibility */}
        <div>
          <Label className="mb-2 block">Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <option value="everyone">Everyone</option>
            <option value="signed_in">Signed In Users Only</option>
          </Select>
        </div>

        {/* Access Rules */}
        <div>
          <Label className="mb-2 block">Access Rules</Label>
          <RadioGroup value={accessRule} onValueChange={setAccessRule}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="open" id="open" />
              <Label htmlFor="open">Open - Anyone can enroll</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="invitation" id="invitation" />
              <Label htmlFor="invitation">On Invitation - Manual enrollment required</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="payment" id="payment" />
              <Label htmlFor="payment">On Payment - Requires payment</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Price - Only shown if accessRule is 'payment' */}
        {accessRule === 'payment' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Label htmlFor="price" className="mb-2 block">
              Price (₹)
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in Rupees"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

### A3. Reporting Dashboard

#### File: `src/app/admin/courses/[id]/reports/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Users, Clock, TrendingUp, CheckCircle } from 'lucide-react';

const stats = [
  { label: 'Total Participants', value: 8, icon: Users, filter: 'all' },
  { label: 'Yet to Start', value: 5, icon: Clock, filter: 'not_started' },
  { label: 'In Progress', value: 2, icon: TrendingUp, filter: 'in_progress' },
  { label: 'Completed', value: 1, icon: CheckCircle, filter: 'completed' },
];

export default function ReportsPage({ params }: { params: { id: string } }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleColumns, setVisibleColumns] = useState({
    sno: true,
    courseName: true,
    participantName: true,
    enrolledDate: true,
    startDate: false,
    timeSpent: false,
    completionPct: true,
    completedDate: false,
    status: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.filter}
              onClick={() => setActiveFilter(stat.filter)}
              className={cn(
                'card-odoo cursor-pointer p-6 transition-all',
                activeFilter === stat.filter && 'ring-2 ring-primary'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className="h-10 w-10 text-primary" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Table with Customizable Columns */}
      <div className="card-odoo">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Participants</h2>
          <ColumnCustomizer 
            columns={visibleColumns} 
            onChange={setVisibleColumns} 
          />
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {visibleColumns.sno && <th className="px-4 py-3 text-left">S.No.</th>}
              {visibleColumns.courseName && <th className="px-4 py-3 text-left">Course Name</th>}
              {visibleColumns.participantName && <th className="px-4 py-3 text-left">Participant</th>}
              {visibleColumns.enrolledDate && <th className="px-4 py-3 text-left">Enrolled</th>}
              {visibleColumns.startDate && <th className="px-4 py-3 text-left">Started</th>}
              {visibleColumns.timeSpent && <th className="px-4 py-3 text-left">Time Spent</th>}
              {visibleColumns.completionPct && <th className="px-4 py-3 text-left">Progress</th>}
              {visibleColumns.completedDate && <th className="px-4 py-3 text-left">Completed</th>}
              {visibleColumns.status && <th className="px-4 py-3 text-left">Status</th>}
            </tr>
          </thead>
          <tbody>
            {/* Render filtered data */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Module B: Learner Website

### B1. My Courses & Gamification

#### File: `src/app/learner/my-courses/page.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import CourseCard from '@/components/learner/CourseCard';
import BadgeDisplay from '@/components/learner/BadgeDisplay';

export default function MyCoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <h1 className="mb-6 text-3xl font-bold">My Courses</h1>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Course cards will be mapped here */}
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="w-80 border-l bg-white p-6">
          <BadgeDisplay totalPoints={85} />
        </div>
      </div>
    </div>
  );
}
```

#### File: `src/components/learner/BadgeDisplay.tsx`

```typescript
'use client';

import { Trophy, Star } from 'lucide-react';
import { getBadgeLevel } from '@/lib/utils';
import { motion } from 'framer-motion';

const badges = [
  { name: 'Newbie', points: 20, color: 'bg-gray-500' },
  { name: 'Explorer', points: 40, color: 'bg-blue-500' },
  { name: 'Achiever', points: 60, color: 'bg-green-500' },
  { name: 'Specialist', points: 80, color: 'bg-purple-500' },
  { name: 'Expert', points: 100, color: 'bg-orange-500' },
  { name: 'Master', points: 120, color: 'bg-red-500' },
];

export default function BadgeDisplay({ totalPoints }: { totalPoints: number }) {
  const currentBadge = getBadgeLevel(totalPoints);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
              <div className="text-center">
                <Trophy className="mx-auto h-12 w-12 text-purple-600" />
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalPoints}</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
            </div>
          </motion.div>
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-900">{currentBadge}</h3>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Badges</h4>
        {badges.map((badge, index) => {
          const isUnlocked = totalPoints >= badge.points;
          return (
            <div
              key={badge.name}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    isUnlocked ? badge.color : 'bg-gray-200'
                  )}
                >
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{badge.name}</p>
                  <p className="text-xs text-gray-600">{badge.points} Points</p>
                </div>
              </div>
              {isUnlocked && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### B2. Learning Player

#### File: `src/app/learner/courses/[id]/learn/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Check } from 'lucide-react';
import LessonSidebar from '@/components/learner/LessonSidebar';
import VideoPlayer from '@/components/learner/VideoPlayer';
import QuizInterface from '@/components/learner/QuizInterface';
import DocumentViewer from '@/components/learner/DocumentViewer';

export default function LearningPlayerPage({ params }: { params: { id: string } }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <LessonSidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentLessonId={currentLesson?.id}
        onLessonSelect={setCurrentLesson}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-gray-900 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{currentLesson?.title}</h2>
          {currentLesson?.allowDownload && (
            <button className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
              <Download className="h-4 w-4" />
              Download
            </button>
          )}
        </div>

        {/* Content Renderer */}
        <div className="flex-1 flex items-center justify-center p-6">
          {currentLesson?.type === 'video' && (
            <VideoPlayer url={currentLesson.contentUrl} />
          )}
          {currentLesson?.type === 'document' && (
            <DocumentViewer url={currentLesson.contentUrl} />
          )}
          {currentLesson?.type === 'quiz' && (
            <QuizInterface quizId={currentLesson.quizId} />
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between bg-gray-900 px-6 py-4">
          <button className="flex items-center gap-2 text-white hover:text-gray-300">
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>
          <button className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90">
            Next Content
          </button>
        </div>
      </div>
    </div>
  );
}
```

This implementation guide provides the foundation. Each component should:
1. Fetch data from Supabase using Drizzle ORM
2. Handle loading and error states
3. Implement proper animations with Framer Motion
4. Follow the Odoo-inspired design system
5. Respect RLS policies for security
