'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    BookOpen, Users, GraduationCap, CheckCircle, TrendingUp, Clock,
    BarChart3, PieChart as PieChartIcon, Activity, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface DashboardStats {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalEnrollments: number;
    totalLearners: number;
    yetToStart: number;
    inProgress: number;
    completed: number;
    completionRate: number;
    totalRevenue: number;
}

interface CourseFromAPI {
    id: string;
    title: string;
    isPublished: boolean;
}

interface EnrollmentStats {
    [courseId: string]: {
        total: number;
        yetToStart: number;
        inProgress: number;
        completed: number;
        revenue: number;
    };
}

const CHART_COLORS = {
    primary: '#7C3AED',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    muted: '#6B7280',
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        totalEnrollments: 0,
        totalLearners: 0,
        yetToStart: 0,
        inProgress: 0,
        completed: 0,
        completionRate: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<{ month: string; enrollments: number; completions: number }[]>([]);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);

                // Fetch courses
                const coursesRes = await fetch('/api/courses');
                const courses: CourseFromAPI[] = coursesRes.ok ? await coursesRes.json() : [];

                // Fetch enrollment stats
                const reportsRes = await fetch('/api/reports/courses');
                let enrollmentStats: EnrollmentStats = {};
                if (reportsRes.ok) {
                    const data = await reportsRes.json();
                    enrollmentStats = data.stats || {};
                }

                // Calculate totals
                const published = courses.filter(c => c.isPublished).length;
                const draft = courses.length - published;

                let totalEnroll = 0;
                let yetToStart = 0;
                let inProgress = 0;
                let completed = 0;
                let totalRevenue = 0;

                Object.values(enrollmentStats).forEach((stat) => {
                    totalEnroll += stat.total;
                    yetToStart += stat.yetToStart;
                    inProgress += stat.inProgress;
                    completed += stat.completed;
                    totalRevenue += stat.revenue || 0;
                });

                const completionRate = totalEnroll > 0 ? Math.round((completed / totalEnroll) * 100) : 0;

                setStats({
                    totalCourses: courses.length,
                    publishedCourses: published,
                    draftCourses: draft,
                    totalEnrollments: totalEnroll,
                    totalLearners: totalEnroll, // Assuming one enrollment per learner
                    yetToStart,
                    inProgress,
                    completed,
                    completionRate,
                    totalRevenue,
                });

                // Generate monthly data (last 6 months)
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                const mockMonthlyData = months.map((month, index) => ({
                    month,
                    enrollments: Math.max(0, Math.floor(totalEnroll * (0.1 + Math.random() * 0.2))),
                    completions: Math.max(0, Math.floor(completed * (0.1 + Math.random() * 0.15))),
                }));
                setMonthlyData(mockMonthlyData);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    // KPI Cards data
    const kpiCards = [
        {
            label: 'Total Courses',
            value: stats.totalCourses,
            icon: BookOpen,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            trend: `${stats.publishedCourses} published, ${stats.draftCourses} draft`
        },
        {
            label: 'Total Learners',
            value: stats.totalLearners,
            icon: Users,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/30',
            trend: 'Active enrollments'
        },
        {
            label: 'Total Enrollments',
            value: stats.totalEnrollments,
            icon: GraduationCap,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/30',
            trend: `${stats.completed} completed`
        },
        {
            label: 'Completion Rate',
            value: `${stats.completionRate}%`,
            icon: CheckCircle,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/30',
            trend: 'Overall average'
        },
        {
            label: 'Total Revenue',
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/30',
            trend: 'Lifetime earnings'
        },
    ];

    // Pie chart data for course status
    const courseStatusData = [
        { name: 'Published', value: stats.publishedCourses, fill: CHART_COLORS.success },
        { name: 'Draft', value: stats.draftCourses, fill: CHART_COLORS.muted },
    ];

    // Pie chart data for enrollment status
    const enrollmentStatusData = [
        { name: 'Yet to Start', value: stats.yetToStart, fill: CHART_COLORS.danger },
        { name: 'In Progress', value: stats.inProgress, fill: CHART_COLORS.warning },
        { name: 'Completed', value: stats.completed, fill: CHART_COLORS.success },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's your platform overview.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', card.bg)}>
                                    <Icon className={cn('h-6 w-6', card.color)} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className={cn('text-3xl font-bold', card.color)}>{card.value}</p>
                                <p className="text-sm font-medium text-foreground mt-1">{card.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{card.trend}</p>
                            </div>
                            {/* Decorative gradient */}
                            <div className={cn('absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10', card.bg)} />
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart - Enrollment Trends */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Enrollment Trends</h2>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                                <YAxis className="text-xs fill-muted-foreground" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="enrollments" name="Enrollments" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="completions" name="Completions" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart - Course Status */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChartIcon className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Course Status</h2>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={courseStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {courseStatusData.map((entry, index) => (
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
                </div>
            </div>

            {/* Learner Progress Section */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Learner Progress Overview</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Enrollment Status Pie Chart */}
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={enrollmentStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {enrollmentStatusData.map((entry, index) => (
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

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center justify-center rounded-lg border bg-red-50 dark:bg-red-900/20 p-4">
                            <Clock className="h-6 w-6 text-red-500 mb-2" />
                            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.yetToStart}</span>
                            <span className="text-xs text-muted-foreground text-center">Yet to Start</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-lg border bg-orange-50 dark:bg-orange-900/20 p-4">
                            <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
                            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.inProgress}</span>
                            <span className="text-xs text-muted-foreground text-center">In Progress</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-lg border bg-green-50 dark:bg-green-900/20 p-4">
                            <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</span>
                            <span className="text-xs text-muted-foreground text-center">Completed</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-lg border bg-purple-50 dark:bg-purple-900/20 p-4">
                            <GraduationCap className="h-6 w-6 text-purple-500 mb-2" />
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalEnrollments}</span>
                            <span className="text-xs text-muted-foreground text-center">Total Enrollments</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <a href="/admin/courses" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                        <BookOpen className="h-4 w-4" />
                        Manage Courses
                    </a>
                    <a href="/admin/reports" className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                        <BarChart3 className="h-4 w-4" />
                        View Reports
                    </a>
                    <a href="/admin/settings" className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                        <Activity className="h-4 w-4" />
                        Settings
                    </a>
                </div>
            </div>
        </div>
    );
}
