'use client';

import Link from 'next/link';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { CheckCircle, ShoppingCart, Play, ArrowRight } from 'lucide-react';

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
    tags?: string[];
    isPaid?: boolean;
    price?: number;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const getButtonContent = () => {
    if (course.isPaid && course.status === 'not_started') {
      return {
        label: `Buy Course  •  ₹${course.price ?? 500}`,
        icon: <ShoppingCart className="mr-2 h-4 w-4" />,
        variant: 'odoo' as const,
      };
    }
    if (course.status === 'completed') {
      return {
        label: 'Review Course',
        icon: <CheckCircle className="mr-2 h-4 w-4" />,
        variant: 'outline' as const,
      };
    }
    if (course.status === 'in_progress') {
      return {
        label: 'Continue',
        icon: <Play className="mr-2 h-4 w-4" />,
        variant: 'odoo' as const,
      };
    }
    return {
      label: 'Join Course',
      icon: <ArrowRight className="mr-2 h-4 w-4" />,
      variant: 'odoo' as const,
    };
  };

  const btn = getButtonContent();

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md dark:border-border">
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40">
        {course.imageUrl && (
          <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
        )}
        {course.isPaid && (
          <div className="absolute right-3 top-3 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            Paid
          </div>
        )}
        {course.status === 'completed' && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
            <CheckCircle className="h-4 w-4" />
            Completed
          </div>
        )}
      </div>

      <div className="p-4 pt-3">
        <h3 className="mb-1 text-lg font-semibold leading-tight text-foreground">{course.title}</h3>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{course.description}</p>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {course.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Progress bar for in-progress courses */}
        {course.status === 'in_progress' && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{course.lessonsCompleted}/{course.totalLessons} lessons</span>
              <span className="font-semibold text-primary">{course.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${course.progress}%`,
                  background: `linear-gradient(90deg, #ef4444, #f59e0b ${Math.min(course.progress, 50)}%, #22c55e)`,
                }}
              />
            </div>
          </div>
        )}

        <Link href={`/learner/courses/${course.id}/learn`}>
          <Button variant={btn.variant} className="w-full">
            {btn.icon}
            {btn.label}
          </Button>
        </Link>
      </div>
    </div>
  );
}
