'use client';

import Link from 'next/link';
import { Progress } from '@/components/shared/progress';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { BookOpen, CheckCircle } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    imageUrl: string | null;
    status: 'in_progress' | 'completed' | 'not_started';
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="card-odoo overflow-hidden">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100">
        {course.status === 'completed' && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
            <CheckCircle className="h-3 w-3" />
            Completed
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-1 text-lg font-semibold text-gray-900">{course.title}</h3>
        <p className="mb-3 text-sm text-gray-600 line-clamp-2">{course.description}</p>

        {/* Progress */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {course.lessonsCompleted}/{course.totalLessons} lessons
            </span>
            <span className="font-medium text-primary">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>

        <Link href={`/learner/courses/${course.id}/learn`}>
          <Button
            variant={course.status === 'completed' ? 'outline' : 'odoo'}
            className="w-full"
          >
            {course.status === 'completed'
              ? 'Review Course'
              : course.status === 'in_progress'
              ? 'Continue Learning'
              : 'Start Course'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
