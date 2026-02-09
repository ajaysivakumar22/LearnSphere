'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

/**
 * RoleRedirect — Automatically redirects users to their role-appropriate dashboard
 * 
 * This component should be placed on pages that need role-based redirection,
 * such as after sign-in or on the home page for authenticated users.
 * 
 * Redirects:
 * - admin → /admin/dashboard
 * - instructor → /instructor/dashboard
 * - learner → /learner/my-courses
 */
export function RoleRedirect() {
    const { isLoggedIn, isLoaded, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        // Only redirect once, when auth is loaded and user is logged in
        if (!isLoaded || !isLoggedIn || !userRole || hasRedirected) return;

        // Don't redirect if already on a role-appropriate page
        if (userRole === 'admin' && pathname.startsWith('/admin')) return;
        if (userRole === 'instructor' && pathname.startsWith('/instructor')) return;
        if (userRole === 'learner' && pathname.startsWith('/learner')) return;

        // Determine target based on role
        let targetPath = '/learner/my-courses'; // default
        if (userRole === 'admin') {
            targetPath = '/admin/dashboard';
        } else if (userRole === 'instructor') {
            targetPath = '/instructor/dashboard';
        }

        setHasRedirected(true);
        router.replace(targetPath);
    }, [isLoaded, isLoggedIn, userRole, router, pathname, hasRedirected]);

    return null;
}

/**
 * RoleRedirectPage — Full page component that shows loading and redirects
 * 
 * Use this as a page component when you want the entire page to be a redirect gate.
 */
export function RoleRedirectPage() {
    const { isLoggedIn, isLoaded, userRole } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState('Loading...');

    useEffect(() => {
        if (!isLoaded) {
            setMessage('Loading...');
            return;
        }

        if (!isLoggedIn) {
            setMessage('Redirecting to home...');
            router.replace('/');
            return;
        }

        if (!userRole) {
            setMessage('Fetching your profile...');
            return;
        }

        // Determine target based on role
        let targetPath = '/learner/my-courses';
        let roleLabel = 'Learner Dashboard';

        if (userRole === 'admin') {
            targetPath = '/admin/dashboard';
            roleLabel = 'Admin Dashboard';
        } else if (userRole === 'instructor') {
            targetPath = '/instructor/dashboard';
            roleLabel = 'Instructor Dashboard';
        }

        setMessage(`Redirecting to ${roleLabel}...`);
        router.replace(targetPath);
    }, [isLoaded, isLoggedIn, userRole, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}
