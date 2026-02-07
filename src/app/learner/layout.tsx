'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Trophy, User, LogOut, Compass, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shared/dialog';
import { Button } from '@/components/shared/button';

const allNavItems = [
  { href: '/learner/my-courses', label: 'My Courses', icon: BookOpen, requiresAuth: true },
  { href: '/learner/explore', label: 'Explore', icon: Compass, requiresAuth: false },
  { href: '/learner/achievements', label: 'Achievements', icon: Trophy, requiresAuth: true },
  { href: '/learner/profile', label: 'Profile', icon: User, requiresAuth: true },
];

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isGuest, guestName, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Show only Explore for unauthenticated/guest users
  const navItems = isLoggedIn
    ? allNavItems
    : allNavItems.filter((item) => !item.requiresAuth);

  // Hide the nav on the full-screen player (when isPlayerOpen would take over)
  const isCoursePage = /^\/learner\/courses\//.test(pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      {!isCoursePage && (
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-lg font-bold text-foreground">LearnSphere</span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {/* Show guest name badge */}
              {isGuest && guestName && (
                <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {guestName}
                </span>
              )}

              {isLoggedIn ? (
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Exit
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Exit</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to sign in again to continue learning.
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
      <main>{children}</main>
    </div>
  );
}
