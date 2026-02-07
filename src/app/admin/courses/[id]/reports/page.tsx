'use client';

import React, { useState, useMemo } from 'react';
import {
  Users, Clock, TrendingUp, CheckCircle, ArrowLeft, Columns,
  ArrowUp, ArrowDown, ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/shared/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/shared/dropdown-menu';

const stats = [
  { label: 'Total Participants', value: 8, icon: Users, filter: 'all', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { label: 'Yet to Start', value: 5, icon: Clock, filter: 'not_started', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
  { label: 'In Progress', value: 2, icon: TrendingUp, filter: 'in_progress', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  { label: 'Completed', value: 1, icon: CheckCircle, filter: 'completed', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
];

const sampleParticipants = [
  { id: 1, name: 'Salman Khan', enrolled: '2026-02-14', started: '2026-02-16', timeSpent: '2:20', completion: 30, completedDate: '-', status: 'in_progress' },
  { id: 2, name: 'Alice Johnson', enrolled: '2026-02-10', started: '2026-02-12', timeSpent: '5:40', completion: 100, completedDate: '2026-02-18', status: 'completed' },
  { id: 3, name: 'Charlie Brown', enrolled: '2026-02-08', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
  { id: 4, name: 'Diana Prince', enrolled: '2026-02-05', started: '2026-02-07', timeSpent: '1:45', completion: 45, completedDate: '-', status: 'in_progress' },
  { id: 5, name: 'Eve Davis', enrolled: '2026-02-03', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
  { id: 6, name: 'Frank Miller', enrolled: '2026-01-28', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
  { id: 7, name: 'Grace Lee', enrolled: '2026-01-25', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
  { id: 8, name: 'Henry Wilson', enrolled: '2026-01-20', started: '-', timeSpent: '-', completion: 0, completedDate: '-', status: 'not_started' },
];

type ColumnKey = 'sno' | 'participantName' | 'enrolledDate' | 'startDate' | 'timeSpent' | 'completionPct' | 'completedDate' | 'status';

const columnDefs: { key: ColumnKey; label: string }[] = [
  { key: 'sno', label: 'S.No.' },
  { key: 'participantName', label: 'Name' },
  { key: 'enrolledDate', label: 'Enrolled Date' },
  { key: 'startDate', label: 'Start' },
  { key: 'timeSpent', label: 'Time Spent' },
  { key: 'completionPct', label: 'Completed %' },
  { key: 'completedDate', label: 'Completed Date' },
  { key: 'status', label: 'Status' },
];

type SortKey = 'name' | 'enrolled' | 'started' | 'timeSpent' | 'completion' | 'completedDate' | 'status';
type SortDir = 'asc' | 'desc' | null;

const statusOrder: Record<string, number> = { not_started: 0, in_progress: 1, completed: 2 };

function parseTime(t: string): number {
  if (t === '-') return -1;
  const parts = t.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

export default function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    sno: true,
    participantName: true,
    enrolledDate: true,
    startDate: true,
    timeSpent: true,
    completionPct: true,
    completedDate: true,
    status: true,
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground" />;
    if (sortDir === 'asc') return <ArrowUp className="ml-1 inline h-3 w-3 text-primary" />;
    return <ArrowDown className="ml-1 inline h-3 w-3 text-primary" />;
  };

  const sortedParticipants = useMemo(() => {
    let list = sampleParticipants.filter(
      (p) => activeFilter === 'all' || p.status === activeFilter
    );

    if (sortKey && sortDir) {
      list = [...list].sort((a, b) => {
        let diff = 0;
        switch (sortKey) {
          case 'name':
            diff = a.name.localeCompare(b.name);
            break;
          case 'enrolled':
            diff = a.enrolled.localeCompare(b.enrolled);
            break;
          case 'started':
            diff = (a.started === '-' ? '9999' : a.started).localeCompare(b.started === '-' ? '9999' : b.started);
            break;
          case 'timeSpent':
            diff = parseTime(a.timeSpent) - parseTime(b.timeSpent);
            break;
          case 'completion':
            diff = a.completion - b.completion;
            break;
          case 'completedDate':
            diff = (a.completedDate === '-' ? '9999' : a.completedDate).localeCompare(b.completedDate === '-' ? '9999' : b.completedDate);
            break;
          case 'status':
            diff = statusOrder[a.status] - statusOrder[b.status];
            break;
        }
        return sortDir === 'asc' ? diff : -diff;
      });
    }

    return list;
  }, [activeFilter, sortKey, sortDir]);

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatDate = (d: string) => {
    if (d === '-') return '-';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6">
      {/* Back Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/reports" className="rounded-lg p-2 hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Course Reports</h1>
      </div>

      {/* Overview */}
      <div className="mb-2">
        <span className="inline-block rounded bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          Overview
        </span>
      </div>
      <hr className="mb-6 border-red-300 dark:border-red-800" />

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
                'group relative flex flex-col items-center rounded-xl border-2 bg-card p-6 shadow-sm transition-all hover:shadow-md',
                isActive
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div className={cn('mb-3 flex h-14 w-14 items-center justify-center rounded-full', stat.bg)}>
                <Icon className={cn('h-7 w-7', stat.color)} />
              </div>
              <span className={cn('text-3xl font-bold', stat.color)}>{stat.value}</span>
              <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Users */}
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-block rounded bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Users
        </span>
      </div>
      <hr className="mb-4 border-red-300 dark:border-red-800" />

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
            {columnDefs.map((col) => (
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
        <span className="text-xs text-muted-foreground">
          Showing {sortedParticipants.length} of {sampleParticipants.length} participants
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {visibleColumns.sno && (
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">S.No.</th>
              )}
              {visibleColumns.participantName && (
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort('name')}
                >
                  Name <SortIcon col="name" />
                </th>
              )}
              {visibleColumns.enrolledDate && (
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort('enrolled')}
                >
                  Enrolled Date <SortIcon col="enrolled" />
                </th>
              )}
              {visibleColumns.startDate && (
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort('started')}
                >
                  Start <SortIcon col="started" />
                </th>
              )}
              {visibleColumns.timeSpent && (
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort('timeSpent')}
                >
                  Time Spent <SortIcon col="timeSpent" />
                </th>
              )}
              {visibleColumns.completionPct && (
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort('completion')}
                >
                  Completed % <SortIcon col="completion" />
                </th>
              )}
              {visibleColumns.completedDate && (
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort('completedDate')}
                >
                  Completed Date <SortIcon col="completedDate" />
                </th>
              )}
              {visibleColumns.status && (
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort('status')}
                >
                  Status <SortIcon col="status" />
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedParticipants.map((p, idx) => (
              <tr key={p.id} className="transition-colors hover:bg-accent/50">
                {visibleColumns.sno && <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>}
                {visibleColumns.participantName && <td className="px-4 py-3 font-medium text-primary">{p.name}</td>}
                {visibleColumns.enrolledDate && <td className="px-4 py-3 text-foreground">{formatDate(p.enrolled)}</td>}
                {visibleColumns.startDate && <td className="px-4 py-3 text-foreground">{formatDate(p.started)}</td>}
                {visibleColumns.timeSpent && <td className="px-4 py-3 text-foreground">{p.timeSpent}</td>}
                {visibleColumns.completionPct && (
                  <td className="px-4 py-3">
                    {p.completion > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-muted">
                          <div
                            className={cn('h-full rounded-full', p.completion === 100 ? 'bg-green-500' : 'bg-primary')}
                            style={{ width: `${p.completion}%` }}
                          />
                        </div>
                        <span className={cn('text-xs font-medium', p.completion === 100 ? 'text-green-600 dark:text-green-400' : 'text-primary')}>
                          {p.completion}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">0%</span>
                    )}
                  </td>
                )}
                {visibleColumns.completedDate && <td className="px-4 py-3 text-foreground">{formatDate(p.completedDate)}</td>}
                {visibleColumns.status && (
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                        p.status === 'completed' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                        p.status === 'in_progress' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                        p.status === 'not_started' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}
                    >
                      {p.status === 'completed' ? 'Completed' : p.status === 'in_progress' ? 'In progress' : 'Yet to start'}
                    </span>
                  </td>
                )}
              </tr>
            ))}
            {sortedParticipants.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
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
