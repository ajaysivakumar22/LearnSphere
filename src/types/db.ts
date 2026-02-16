export type UserRole = 'admin' | 'instructor' | 'learner';
export type LessonType = 'video' | 'document' | 'image' | 'quiz';
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    password_hash?: string;
    avatar_url?: string;
    bio?: string;
    total_points: number;
    badge_level: string;
    created_at: Date;
    updated_at: Date;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    tags: string[];
    image_url?: string;
    is_published: boolean;
    views_count: number;
    duration: string;
    rating: number;
    created_by: string;
    created_at: Date;
    updated_at: Date;
}

export interface Lesson {
    id: string;
    course_id: string;
    title: string;
    type: LessonType;
    content_url?: string;
    duration: number;
    order_index: number;
    created_at: Date;
    updated_at: Date;
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    status: EnrollmentStatus;
    progress_pct: number;
    enrolled_at: Date;
    completed_at?: Date;
}

export interface QuizQuestion {
    id: string;
    lesson_id: string;
    question: string;
    options: string[];
    correct_answer: number;
    order_index: number;
    created_at: Date;
}

export interface QuizAttempt {
    id: string;
    user_id: string;
    question_id: string;
    selected_answer: number;
    is_correct: boolean;
    points_awarded: number;
    attempted_at: Date;
}
