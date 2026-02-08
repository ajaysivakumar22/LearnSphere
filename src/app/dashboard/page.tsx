'use client';

import { RoleRedirectPage } from '@/components/shared/role-redirect';

/**
 * /dashboard — Role-based redirect gateway
 * 
 * This page acts as a landing point after sign-in.
 * It checks the user's role and redirects them to the appropriate dashboard:
 * - admin → /admin/courses
 * - instructor → /instructor/courses  
 * - learner → /learner/my-courses
 */
export default function DashboardPage() {
    return <RoleRedirectPage />;
}
