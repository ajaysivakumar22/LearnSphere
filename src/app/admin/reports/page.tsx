'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, ChevronRight, Users, Clock, TrendingUp, CheckCircle, BookOpen,
  ArrowUp, ArrowDown, ArrowUpDown, Loader2, PieChart as PieChartIcon, Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';

interface CourseReport {
  id: string;
  title: string;
  tags: string[];
  totalParticipants: number;
  yetToStart: number;
  inProgress: number;
  completed: number;
  contents: number;
  duration: string;
  status: 'published' | 'draft';
  revenue: number;
}

interface CourseFromAPI {
  id: string;
  title: string;
  tags: string[];
  isPublished: boolean;
  duration: string;
  contentsCount: number;
  enrollments?: {
    total: number;
    yetToStart: number;
    inProgress: number;
    completed: number;
  };
}

type SortKey = 'totalParticipants' | 'yetToStart' | 'inProgress' | 'completed' | 'revenue';
type SortDir = 'asc' | 'desc' | null;

const CHART_COLORS = {
  yetToStart: '#EF4444',
  inProgress: '#F97316',
  completed: '#22C55E',
  published: '#22C55E',
  draft: '#6B7280',
};

export default function AdminReportsPage() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [courses, setCourses] = useState<CourseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses and enrollment stats from API
  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses
        const coursesRes = await fetch('/api/courses');
        if (!coursesRes.ok) throw new Error('Failed to fetch courses');
        const json = await coursesRes.json();
        const coursesData: CourseFromAPI[] = Array.isArray(json) ? json : (json.data || []);

        // Fetch enrollment stats for each course
        const reportsRes = await fetch('/api/reports/courses');
        let enrollmentStats: Record<string, { total: number; yetToStart: number; inProgress: number; completed: number }> = {};

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          enrollmentStats = reportsData.stats || {};
        }

        // Transform to report format - ONLY WITH REAL DATA
        const reports: CourseReport[] = coursesData.map((course) => {
          const stats = enrollmentStats[course.id] || { total: 0, yetToStart: 0, inProgress: 0, completed: 0 };
          return {
            id: course.id,
            title: course.title,
            tags: course.tags || [],
            totalParticipants: stats.total,
            yetToStart: stats.yetToStart,
            inProgress: stats.inProgress,
            completed: stats.completed,
            contents: course.contentsCount || 0,
            duration: course.duration || '0:00',
            status: course.isPublished ? 'published' : 'draft',
            revenue: (stats as any).revenue || 0,
          };
        });

        setCourses(reports);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    }

    fetchReportData();
  }, []);

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
  }, [search, sortKey, sortDir, courses]);

  // Totals across all courses
  const totals = courses.reduce(
    (acc, c) => ({
      participants: acc.participants + c.totalParticipants,
      yetToStart: acc.yetToStart + c.yetToStart,
      inProgress: acc.inProgress + c.inProgress,
      completed: acc.completed + c.completed,
      revenue: acc.revenue + c.revenue,
    }),
    { participants: 0, yetToStart: 0, inProgress: 0, completed: 0, revenue: 0 }
  );

  // Count published and draft courses
  const publishedCount = courses.filter(c => c.status === 'published').length;
  const draftCount = courses.filter(c => c.status === 'draft').length;

  const overviewStats = [
    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { label: 'Total Participants', value: totals.participants, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Yet to Start', value: totals.yetToStart, icon: Clock, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
    { label: 'In Progress', value: totals.inProgress, icon: TrendingUp, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
    { label: 'Completed', value: totals.completed, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Total Revenue', value: `₹${totals.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  ];

  // Pie chart data for enrollment status
  const enrollmentPieData = [
    { name: 'Yet to Start', value: totals.yetToStart, fill: CHART_COLORS.yetToStart },
    { name: 'In Progress', value: totals.inProgress, fill: CHART_COLORS.inProgress },
    { name: 'Completed', value: totals.completed, fill: CHART_COLORS.completed },
  ];

  // Pie chart data for course status
  const coursePieData = [
    { name: 'Published', value: publishedCount, fill: CHART_COLORS.published },
    { name: 'Draft', value: draftCount, fill: CHART_COLORS.draft },
  ];

  // Download report as CSV
  const downloadCSV = () => {
    const headers = ['Course Title', 'Status', 'Participants', 'Yet to Start', 'In Progress', 'Completed', 'Duration'];
    const rows = filtered.map(c => [
      c.title,
      c.status,
      c.totalParticipants,
      c.yetToStart,
      c.inProgress,
      c.completed,
      c.duration
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `learnsphere_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Download report as PDF (simple text-based)
  const downloadPDF = async () => {
    // Create a simple HTML representation for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>LearnSphere Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #7C3AED; margin-bottom: 20px; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
          .stat { background: #f3f4f6; padding: 15px 20px; border-radius: 8px; }
          .stat-label { font-size: 12px; color: #6b7280; }
          .stat-value { font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #7C3AED; color: white; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>LearnSphere Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <div class="summary">
          <div class="stat"><div class="stat-label">Total Courses</div><div class="stat-value">${courses.length}</div></div>
          <div class="stat"><div class="stat-label">Total Participants</div><div class="stat-value">${totals.participants}</div></div>
          <div class="stat"><div class="stat-label">Yet to Start</div><div class="stat-value">${totals.yetToStart}</div></div>
          <div class="stat"><div class="stat-label">In Progress</div><div class="stat-value">${totals.inProgress}</div></div>
          <div class="stat"><div class="stat-label">Completed</div><div class="stat-value">${totals.completed}</div></div>
        </div>
        <h2>Course-wise Report</h2>
        <table>
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Status</th>
              <th>Participants</th>
              <th>Yet to Start</th>
              <th>In Progress</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(c => `
              <tr>
                <td>${c.title}</td>
                <td>${c.status}</td>
                <td>${c.totalParticipants}</td>
                <td>${c.yetToStart}</td>
                <td>${c.inProgress}</td>
                <td>${c.completed}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>© 2026 LearnSphere. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Download report as DOCX (simple HTML blob that Word can open)
  const downloadDOCX = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>LearnSphere Report</title></head>
      <body>
        <h1 style="color: #7C3AED;">LearnSphere Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <h2>Summary</h2>
        <ul>
          <li>Total Courses: ${courses.length}</li>
          <li>Total Participants: ${totals.participants}</li>
          <li>Yet to Start: ${totals.yetToStart}</li>
          <li>In Progress: ${totals.inProgress}</li>
          <li>Completed: ${totals.completed}</li>
        </ul>
        <h2>Course-wise Report</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
          <tr style="background: #7C3AED; color: white;">
            <th>Course Title</th>
            <th>Status</th>
            <th>Participants</th>
            <th>Yet to Start</th>
            <th>In Progress</th>
            <th>Completed</th>
          </tr>
          ${filtered.map(c => `
            <tr>
              <td>${c.title}</td>
              <td>${c.status}</td>
              <td>${c.totalParticipants}</td>
              <td>${c.yetToStart}</td>
              <td>${c.inProgress}</td>
              <td>${c.completed}</td>
            </tr>
          `).join('')}
        </table>
        <p style="margin-top: 30px; font-size: 10pt; color: gray;">© 2026 LearnSphere. All rights reserved.</p>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `learnsphere_report_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading report data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* ---- Overview Cards ---- */}
      <div className="mb-2">
        <span className="inline-block rounded bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          Overview
        </span>
      </div>
      <hr className="mb-6 border-red-300 dark:border-red-800" />

      <div className="mb-10 grid grid-cols-2 gap-5 md:grid-cols-5">
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
              <span className="mt-1 text-sm text-muted-foreground text-center">{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* ---- Pie Charts Section ---- */}
      <div className="mb-2">
        <span className="inline-block rounded bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          Analytics
        </span>
      </div>
      <hr className="mb-6 border-purple-300 dark:border-purple-800" />

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Enrollment Status Pie */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Learner Progress Distribution</h3>
          </div>
          {totals.participants > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enrollmentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {enrollmentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <PieChartIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No learner engagement data available yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Data will appear here once students enroll in courses.</p>
            </div>
          )}
        </div>

        {/* Course Status Pie */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Course Status Distribution</h3>
          </div>
          {courses.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coursePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {coursePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No courses available yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Course-wise Reporting ---- */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block rounded bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Course-wise Reporting
          </span>
        </div>
        {/* Download Buttons (Admin Only) */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
          <button
            onClick={downloadDOCX}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <Download className="h-3.5 w-3.5" />
            DOCX
          </button>
        </div>
      </div>
      <hr className="mb-4 border-red-300 dark:border-red-800" />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
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
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort('revenue')}
              >
                Revenue <SortIcon col="revenue" />
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
                  <span className="font-medium text-amber-600 dark:text-amber-400">₹{course.revenue.toLocaleString()}</span>
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
                  {courses.length === 0 ? 'No courses available. Create a course to see reports.' : 'No courses match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
