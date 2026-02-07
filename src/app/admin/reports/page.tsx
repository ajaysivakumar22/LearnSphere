'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, ChevronRight, Users, Clock, TrendingUp, CheckCircle, BookOpen,
  ArrowUp, ArrowDown, ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ----- Sample courses with reporting data ----- */
const courses = [
  {
    id: '1',
    title: 'Basics of Odoo CRM',
    tags: ['CRM', 'Sales'],
    totalParticipants: 8,
    yetToStart: 5,
    inProgress: 2,
    completed: 1,
    contents: 5,
    duration: '2h 30m',
    status: 'published' as const,
  },
  {
    id: '2',
    title: 'Introduction to Odoo AI',
    tags: ['AI', 'Automation'],
    totalParticipants: 12,
    yetToStart: 3,
    inProgress: 6,
    completed: 3,
    contents: 8,
    duration: '4h 15m',
    status: 'published' as const,
  },
  {
    id: '3',
    title: 'About Odoo Courses',
    tags: ['eLearning'],
    totalParticipants: 4,
    yetToStart: 2,
    inProgress: 1,
    completed: 1,
    contents: 3,
    duration: '1h 10m',
    status: 'draft' as const,
  },
  {
    id: '4',
    title: 'Advanced Sales & CRM Automation in Odoo',
    tags: ['CRM', 'Automation', 'Advanced'],
    totalParticipants: 6,
    yetToStart: 4,
    inProgress: 2,
    completed: 0,
    contents: 10,
    duration: '5h 45m',
    status: 'published' as const,
  },
];

type SortKey = 'totalParticipants' | 'yetToStart' | 'inProgress' | 'completed';
type SortDir = 'asc' | 'desc' | null;

export default function AdminReportsPage() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Cycle: asc -> desc -> null
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground" />;
    if (sortDir === 'asc') return <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-primary" />;
    return <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-primary" />;
  };

  const filtered = useMemo(() => {
    let list = courses.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );

    if (sortKey && sortDir) {
      list = [...list].sort((a, b) => {
        const diff = a[sortKey] - b[sortKey];
        return sortDir === 'asc' ? diff : -diff;
      });
    }

    return list;
  }, [search, sortKey, sortDir]);

  // Totals across all courses
  const totals = courses.reduce(
    (acc, c) => ({
      participants: acc.participants + c.totalParticipants,
      yetToStart: acc.yetToStart + c.yetToStart,
      inProgress: acc.inProgress + c.inProgress,
      completed: acc.completed + c.completed,
    }),
    { participants: 0, yetToStart: 0, inProgress: 0, completed: 0 }
  );

  const overviewStats = [
    { label: 'Total Participants', value: totals.participants, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Yet to Start', value: totals.yetToStart, icon: Clock, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
    { label: 'In Progress', value: totals.inProgress, icon: TrendingUp, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
    { label: 'Completed', value: totals.completed, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
  ];

  return (
    <div className="p-6">
      {/* ---- Overview Cards ---- */}
      <div className="mb-2">
        <span className="inline-block rounded bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          Overview
        </span>
      </div>
      <hr className="mb-6 border-red-300 dark:border-red-800" />

      <div className="mb-10 grid grid-cols-2 gap-5 md:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl border-2 border-border bg-card p-6 shadow-sm"
            >
              <div className={cn('mb-3 flex h-14 w-14 items-center justify-center rounded-full', stat.bg)}>
                <Icon className={cn('h-7 w-7', stat.color)} />
              </div>
              <span className={cn('text-3xl font-bold', stat.color)}>{stat.value}</span>
              <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* ---- Course-wise Reporting ---- */}
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-block rounded bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Course-wise Reporting
        </span>
      </div>
      <hr className="mb-4 border-red-300 dark:border-red-800" />

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} course{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Sortable Table */}
      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                Course
              </th>
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort('totalParticipants')}
              >
                Participants <SortIcon col="totalParticipants" />
              </th>
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort('yetToStart')}
              >
                Yet to Start <SortIcon col="yetToStart" />
              </th>
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort('inProgress')}
              >
                In Progress <SortIcon col="inProgress" />
              </th>
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort('completed')}
              >
                Completed <SortIcon col="completed" />
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((course) => (
              <tr key={course.id} className="transition-colors hover:bg-accent/50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{course.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {course.tags.map((tag) => (
                          <span key={tag} className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                    <Users className="h-3.5 w-3.5" />
                    {course.totalParticipants}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-medium text-red-500 dark:text-red-400">{course.yetToStart}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-medium text-orange-500 dark:text-orange-400">{course.inProgress}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-medium text-green-600 dark:text-green-400">{course.completed}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={cn(
                      'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                      course.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    )}
                  >
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/admin/courses/${course.id}/reports`}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    View
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No courses match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
