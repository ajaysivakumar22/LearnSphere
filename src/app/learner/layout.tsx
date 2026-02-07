'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, BookOpen, Trophy, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/learner/my-courses', label: 'My Courses', icon: BookOpen },
  { href: '/learner/explore', label: 'Explore', icon: GraduationCap },
  { href: '/learner/achievements', label: 'Achievements', icon: Trophy },
  { href: '/learner/profile', label: 'Profile', icon: User },
];

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold text-gray-900">LearnSphere</span>
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
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Exit
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
