'use client';

import { useState } from 'react';
import { Users, Clock, TrendingUp, CheckCircle, Columns, Table2 } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/shared/dropdown-menu';

/* ----- Stat card types ----- */
const stats = [
  { label: 'Total Participants', value: 8, icon: Users, filter: 'all', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Yet to Start', value: 5, icon: Clock, filter: 'not_started', color: 'text-red-500', bg: 'bg-red-50' },
  { label: 'In Progress', value: 2, icon: TrendingUp, filter: 'in_progress', color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Completed', value: 1, icon: CheckCircle, filter: 'completed', color: 'text-green-600', bg: 'bg-green-50' },
];

/* ----- Sample table data ----- */
const participants = [
  { id: 1, name: 'Salman Khan', course: 'Basics of Odoo CRM', enrolled: 'Feb 14', started: 'Feb 16', timeSpent: '2:20', completion: 30, completedDate: 'Feb 21', status: 'in_progress' },
  { id: 2, name: 'Priya Sharma', course: 'Introduction to Odoo AI', enrolled: 'Feb 10', started: 'Feb 12', timeSpent: '5:40', completion: 100, completedDate: 'Feb 18', status: 'completed' },
  { id: 3, name: 'Ahmed Ali', course: 'About Odoo Courses', enrolled: 'Feb 08', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
  { id: 4, name: 'Jessica Lee', course: 'Basics of Odoo CRM', enrolled: 'Feb 05', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
  { id: 5, name: 'Ravi Patel', course: 'Introduction to Odoo AI', enrolled: 'Feb 03', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
  { id: 6, name: 'Emily Chen', course: 'About Odoo Courses', enrolled: 'Jan 28', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
  { id: 7, name: 'David Wilson', course: 'Basics of Odoo CRM', enrolled: 'Jan 25', started: 'Jan 28', timeSpent: '1:15', completion: 55, completedDate: '-', status: 'in_progress' },
  { id: 8, name: 'Maria Garcia', course: 'Introduction to Odoo AI', enrolled: 'Jan 20', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
];

/* ----- Column definitions ----- */
type ColumnKey =
  | 'sno'
  | 'courseName'
  | 'participantName'
  | 'enrolledDate'
  | 'startDate'
  | 'timeSpent'
  | 'completionPct'
  | 'completedDate'
  | 'status';

const columns: { key: ColumnKey; label: string }[] = [
  { key: 'sno', label: 'S.No.' },
  { key: 'courseName', label: 'Course Name' },
  { key: 'participantName', label: 'Participant name' },
  { key: 'enrolledDate', label: 'Enrolled Date' },
  { key: 'startDate', label: 'Start date' },
  { key: 'timeSpent', label: 'Time spent' },
  { key: 'completionPct', label: 'Completion percentage' },
  { key: 'completedDate', label: 'Completed date' },
  { key: 'status', label: 'Status' },
];

export default function AdminReportsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    sno: true,
    courseName: true,
    participantName: true,
    enrolledDate: true,
    startDate: true,
    timeSpent: true,
    completionPct: true,
    completedDate: true,
    status: true,
  });

  const filtered = participants.filter(
    (p) => activeFilter === 'all' || p.status === activeFilter
  );

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6">
      {/* ---- Overview Section ---- */}
      <div className="mb-2">
        <span className="inline-block rounded bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
          Overview
        </span>
      </div>
      <hr className="mb-6 border-red-300" />

      {/* Stat Cards */}
      <div className="mb-10 grid grid-cols-2 gap-5 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeFilter === stat.filter;
          return (
            <button
              key={stat.filter}
              onClick={() => setActiveFilter(stat.filter)}
              className={cn(
                'group relative flex flex-col items-center rounded-xl border-2 bg-white p-6 shadow-sm transition-all hover:shadow-md',
                isActive
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className={cn('mb-3 flex h-14 w-14 items-center justify-center rounded-full', stat.bg)}>
                <Icon className={cn('h-7 w-7', stat.color)} />
              </div>
              <span className={cn('text-3xl font-bold', stat.color)}>{stat.value}</span>
              <span className="mt-1 text-sm text-gray-600">{stat.label}</span>
              {isActive && (
                <span className="absolute -bottom-px left-1/2 h-0.5 w-12 -translate-x-1/2 bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* ---- Users Section ---- */}
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-block rounded bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
          Users
        </span>
      </div>
      <hr className="mb-4 border-red-300" />

      {/* Table Controls */}
      <div className="mb-3 flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <Columns className="mr-1.5 h-3.5 w-3.5" />
              Customizable table
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <p className="px-2 py-1.5 text-xs font-semibold text-primary">
              Pick which columns to show/hide
            </p>
            {columns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.key}
                checked={visibleColumns[col.key]}
                onCheckedChange={() => toggleColumn(col.key)}
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-xs text-gray-500">
          Showing {filtered.length} of {participants.length} participants
        </span>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {visibleColumns.sno && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">S.No.</th>
              )}
              {visibleColumns.courseName && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">Course Name</th>
              )}
              {visibleColumns.participantName && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">Participant name</th>
              )}
              {visibleColumns.enrolledDate && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">Enrolled Date</th>
              )}
              {visibleColumns.startDate && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">Start date</th>
              )}
              {visibleColumns.timeSpent && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">Time spent</th>
              )}
              {visibleColumns.completionPct && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">Completion percentage</th>
              )}
              {visibleColumns.completedDate && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">Completed date</th>
              )}
              {visibleColumns.status && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">Status</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p, idx) => (
              <tr key={p.id} className="hover:bg-gray-50">
                {visibleColumns.sno && (
                  <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                )}
                {visibleColumns.courseName && (
                  <td className="px-4 py-3 font-medium text-primary">{p.course}</td>
                )}
                {visibleColumns.participantName && (
                  <td className="px-4 py-3 text-blue-600">{p.name}</td>
                )}
                {visibleColumns.enrolledDate && (
                  <td className="px-4 py-3 text-gray-600">{p.enrolled}</td>
                )}
                {visibleColumns.startDate && (
                  <td className="px-4 py-3 text-gray-600">{p.started}</td>
                )}
                {visibleColumns.timeSpent && (
                  <td className="px-4 py-3 text-gray-600">{p.timeSpent}</td>
                )}
                {visibleColumns.completionPct && (
                  <td className="px-4 py-3">
                    {p.completion > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-gray-200">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              p.completion === 100 ? 'bg-green-500' : 'bg-primary'
                            )}
                            style={{ width: `${p.completion}%` }}
                          />
                        </div>
                        <span className={cn(
                          'text-xs font-medium',
                          p.completion === 100 ? 'text-green-600' : 'text-primary'
                        )}>
                          {p.completion}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">0%</span>
                    )}
                  </td>
                )}
                {visibleColumns.completedDate && (
                  <td className="px-4 py-3 text-gray-600">{p.completedDate}</td>
                )}
                {visibleColumns.status && (
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                        p.status === 'completed' && 'bg-green-100 text-green-700',
                        p.status === 'in_progress' && 'bg-orange-100 text-orange-700',
                        p.status === 'not_started' && 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {p.status === 'completed'
                        ? 'Completed'
                        : p.status === 'in_progress'
                        ? 'In progress'
                        : 'Yet to start'}
                    </span>
                  </td>
                )}
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  No participants match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
