'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/tabs';
import { Switch } from '@/components/shared/switch';
import { Button } from '@/components/shared/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ContentTab from '@/components/admin/editor/ContentTab';
import DescriptionTab from '@/components/admin/editor/DescriptionTab';
import OptionsTab from '@/components/admin/editor/OptionsTab';
import QuizTab from '@/components/admin/editor/QuizTab';

export default function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [isPublished, setIsPublished] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="rounded-lg p-2 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
              <p className="text-sm text-gray-600">Course ID: {resolvedParams.id}</p>
            </div>
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
            <ContentTab courseId={resolvedParams.id} />
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
    </div>
  );
}
