'use client';

import { useState, useMemo } from 'react';
import { useCourseStore } from '@/lib/course-store';
import { ArrowUpDown, Search, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InstructorReportsPage() {
  const { courses } = useCourseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'title' | 'views' | 'contents'>('views');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const reportData = useMemo(() => {
    let data = courses
      .filter((c) => c.isPublished)
      .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    data.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'views') cmp = a.viewsCount - b.viewsCount;
      else cmp = a.contentsCount - b.contentsCount;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [courses, searchQuery, sortField, sortDir]);

  const totalViews = reportData.reduce((s, c) => s + c.viewsCount, 0);
  const totalContents = reportData.reduce((s, c) => s + c.contentsCount, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Course Reports</h1>
        <p className="text-sm text-muted-foreground">View-only reporting for published courses.</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Published Courses</p>
          <p className="text-2xl font-bold text-foreground">{reportData.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Views</p>
          <p className="text-2xl font-bold text-foreground">{totalViews}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Content Items</p>
          <p className="text-2xl font-bold text-foreground">{totalContents}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort('title')} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Course Name <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Tags</th>
              <th className="px-4 py-3 text-center">
                <button onClick={() => toggleSort('views')} className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Views <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button onClick={() => toggleSort('contents')} className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Contents <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Duration</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((course) => (
              <tr key={course.id} className="border-t border-border transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{course.title}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {course.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-muted-foreground">{course.viewsCount}</td>
                <td className="px-4 py-3 text-center text-sm text-muted-foreground">{course.contentsCount}</td>
                <td className="px-4 py-3 text-center text-sm text-muted-foreground">{course.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportData.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <BarChart3 className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No published courses to report on.</p>
          </div>
        )}
      </div>
    </div>
  );
}
