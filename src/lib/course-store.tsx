'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ======================================================================
   TYPES
   ====================================================================== */
export interface Course {
  id: string;
  title: string;
  tags: string[];
  viewsCount: number;
  contentsCount: number;
  duration: string;
  isPublished: boolean;
  description?: string;
  lessons?: number;
  rating?: number;
  createdBy?: string;
  imageUrl?: string | null;
  // Optional fields that may come from backend
  scheduledPublishDate?: string | null;
  assignedInstructor?: string | null;
  price?: number;
  currency?: string;
  isPaid?: boolean;
}

interface CourseStoreContextType {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  togglePublish: (id: string) => void;
  removeTag: (courseId: string, tag: string) => void;
  refresh: () => void;
}

const STORAGE_KEY = 'learnsphere-courses';

/* ======================================================================
   DEFAULT COURSES
   ====================================================================== */
const DEFAULT_COURSES: Course[] = [
  {
    id: '1',
    title: 'Introduction to Odoo AI',
    tags: ['AI', 'Odoo', 'Automation'],
    viewsCount: 15,
    contentsCount: 6,
    duration: '25:30',
    isPublished: true,
    description: 'Explore AI capabilities within the Odoo ecosystem.',
    lessons: 6,
    rating: 4.5,
    createdBy: 'admin',
  },
  {
    id: '2',
    title: 'Basics of Odoo CRM',
    tags: ['CRM', 'Sales', 'Odoo'],
    viewsCount: 20,
    contentsCount: 8,
    duration: '20:35',
    isPublished: true,
    description: 'Learn CRM fundamentals with Odoo. Build pipelines, manage leads, and automate your sales process.',
    lessons: 12,
    rating: 4.5,
    createdBy: 'admin',
  },
  {
    id: '3',
    title: 'About Odoo Courses',
    tags: ['eLearning', 'Odoo', 'Courses'],
    viewsCount: 10,
    contentsCount: 5,
    duration: '10:20',
    isPublished: true,
    description: 'Overview of Odoo eLearning module and course management.',
    lessons: 5,
    rating: 4.2,
    createdBy: 'admin',
  },
  {
    id: '4',
    title: 'Advanced Python Programming',
    tags: ['Python', 'Programming'],
    viewsCount: 45,
    contentsCount: 12,
    duration: '45:00',
    isPublished: false,
    description: 'Deep dive into Python with advanced concepts and real-world projects.',
    lessons: 24,
    rating: 4.8,
    createdBy: 'instructor',
  },
  {
    id: '5',
    title: 'Web Development Masterclass',
    tags: ['Web', 'React', 'JavaScript'],
    viewsCount: 89,
    contentsCount: 16,
    duration: '1:20:00',
    isPublished: true,
    description: 'Complete web development course covering HTML, CSS, JavaScript, and React.',
    lessons: 32,
    rating: 4.6,
    createdBy: 'admin',
  },
  {
    id: '6',
    title: 'Data Science Essentials',
    tags: ['Data Science', 'ML'],
    viewsCount: 67,
    contentsCount: 8,
    duration: '35:00',
    isPublished: true,
    description: 'Introduction to data science, machine learning, and analytics.',
    lessons: 16,
    rating: 4.3,
    createdBy: 'instructor',
  },
];

/* ======================================================================
   HELPERS
   ====================================================================== */
function loadCourses(): Course[] {
  if (typeof window === 'undefined') return DEFAULT_COURSES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { }
  // First time — seed with defaults
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COURSES));
  return DEFAULT_COURSES;
}

function saveCourses(courses: Course[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch { }
}

/* ======================================================================
   CONTEXT
   ====================================================================== */
const CourseStoreContext = createContext<CourseStoreContextType>({
  courses: [],
  addCourse: () => { },
  updateCourse: () => { },
  deleteCourse: () => { },
  togglePublish: () => { },
  removeTag: () => { },
  refresh: () => { },
});

export function useCourseStore() {
  return useContext(CourseStoreContext);
}

export function CourseStoreProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setCourses(loadCourses());
  }, []);

  // Persist whenever courses change (skip initial empty)
  useEffect(() => {
    if (courses.length > 0) saveCourses(courses);
  }, [courses]);

  const refresh = useCallback(() => {
    setCourses(loadCourses());
  }, []);

  const addCourse = useCallback((course: Omit<Course, 'id'>) => {
    setCourses((prev) => {
      const maxId = prev.reduce((max, c) => Math.max(max, parseInt(c.id, 10) || 0), 0);
      const newCourse: Course = { ...course, id: String(maxId + 1) };
      return [...prev, newCourse];
    });
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const togglePublish = useCallback((id: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPublished: !c.isPublished } : c))
    );
  }, []);

  const removeTag = useCallback((courseId: string, tag: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, tags: c.tags.filter((t) => t !== tag) } : c
      )
    );
  }, []);

  return (
    <CourseStoreContext.Provider value={{ courses, addCourse, updateCourse, deleteCourse, togglePublish, removeTag, refresh }}>
      {children}
    </CourseStoreContext.Provider>
  );
}
