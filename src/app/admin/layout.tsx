'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { CourseAPIProvider } from '@/lib/course-api-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shared/dialog';
import { Button } from '@/components/shared/button';

const navItems = [
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/reports', label: 'Reporting' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isLoggedIn, isLoaded, userRole } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Determine authorization status
  const isAuthorized = isLoaded && isLoggedIn && userRole === 'admin';
  const isUnauthorized = isLoaded && (!isLoggedIn || userRole !== 'admin');

  // Handle redirect in useEffect to avoid calling router during render
  useEffect(() => {
    if (isUnauthorized && !isRedirecting) {
      setIsRedirecting(true);
      router.replace('/');
    }
  }, [isUnauthorized, isRedirecting, router]);

  // Guard: show loading while auth is resolving
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Guard: show unauthorized message while redirecting
  if (isUnauthorized || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Unauthorized — redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="flex h-14 items-center px-6">
          {/* Logo — goes to admin courses (dashboard), NOT login */}
          <Link href="/admin/courses" className="mr-8 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-foreground">LearnSphere</span>
          </Link>

          {/* Nav Tabs */}
          <nav className="flex h-full items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex h-14 items-center px-4 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to sign in again to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="flex-1">
        <CourseAPIProvider>
          {children}
        </CourseAPIProvider>
      </main>
    </div>
  );
}
