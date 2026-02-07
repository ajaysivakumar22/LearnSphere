'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import Link from 'next/link';

const allCourses = [
  {
    id: '1',
    title: 'Basics of Odoo CRM',
    description: 'Learn the fundamentals of customer relationship management with Odoo.',
    tags: ['CRM', 'Odoo', 'Sales'],
    enrolled: 45,
    lessons: 12,
    rating: 4.5,
    isEnrolled: true,
  },
  {
    id: '2',
    title: 'Advanced Python Programming',
    description: 'Deep dive into Python with advanced concepts and real-world projects.',
    tags: ['Python', 'Programming'],
    enrolled: 120,
    lessons: 24,
    rating: 4.8,
    isEnrolled: true,
  },
  {
    id: '3',
    title: 'Web Development Masterclass',
    description: 'Complete web development course covering HTML, CSS, JavaScript, and React.',
    tags: ['Web', 'React', 'JavaScript'],
    enrolled: 89,
    lessons: 32,
    rating: 4.6,
    isEnrolled: false,
  },
  {
    id: '4',
    title: 'Data Science Essentials',
    description: 'Introduction to data science, machine learning, and analytics.',
    tags: ['Data Science', 'ML'],
    enrolled: 67,
    lessons: 16,
    rating: 4.3,
    isEnrolled: true,
  },
  {
    id: '5',
    title: 'UI/UX Design Principles',
    description: 'Master the fundamentals of user interface and user experience design.',
    tags: ['Design', 'UI/UX'],
    enrolled: 54,
    lessons: 18,
    rating: 4.7,
    isEnrolled: false,
  },
  {
    id: '6',
    title: 'DevOps Fundamentals',
    description: 'Learn CI/CD, Docker, Kubernetes, and cloud deployment strategies.',
    tags: ['DevOps', 'Cloud'],
    enrolled: 38,
    lessons: 20,
    rating: 4.4,
    isEnrolled: false,
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(allCourses.flatMap((c) => c.tags)));

  const filtered = allCourses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || c.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Explore Courses</h1>

      {/* Search & Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            !selectedTag ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedTag === tag ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="card-odoo overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100" />
              <div className="p-4">
                <h3 className="mb-1 text-lg font-semibold text-gray-900">{course.title}</h3>
                <p className="mb-3 text-sm text-gray-600 line-clamp-2">{course.description}</p>

                <div className="mb-3 flex flex-wrap gap-1">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>{course.enrolled} enrolled</span>
                  <span>{course.lessons} lessons</span>
                  <span>⭐ {course.rating}</span>
                </div>

                <Link href={`/learner/courses/${course.id}/learn`}>
                  <Button variant={course.isEnrolled ? 'odoo' : 'outline'} className="w-full">
                    {course.isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
