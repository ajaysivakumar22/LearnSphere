'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sun, Moon, Monitor, Bell, Shield, User, Camera, HelpCircle,
  Settings, PlayCircle, Info, LogOut, ChevronRight, ExternalLink,
  BookOpen, Trophy, Star, CheckCircle, Save, Loader2,
} from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import { useCachedFetch } from '@/lib/use-cached-fetch';
import { cn } from '@/lib/utils';
// Section definitions for navigation
const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account Settings', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'video', label: 'Video Preferences', icon: PlayCircle },
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
  { id: 'about', label: 'About', icon: Info },
];

interface StatsEnrollment {
  id: string;
  status: string;
}

interface UserData {
  totalPoints?: number;
}

export default function ProfilePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { userName, userEmail, userRole, isLoaded, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  // Navigation State
  const [activeSection, setActiveSection] = useState('profile');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Profile - Initialize with auth context data
  const [displayName, setDisplayName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [bio, setBio] = useState('Passionate learner exploring new technologies and skills.');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Optimized: Use cached fetch for enrollments
  const { data: enrollmentsData, loading: enrollmentsLoading } = useCachedFetch<{ enrollments: StatsEnrollment[] }>(
    '/api/enrollments',
    async () => {
      const res = await fetch('/api/enrollments');
      if (!res.ok) throw new Error('Failed to fetch enrollments');
      return res.json();
    },
    { ttlMs: 30_000, enabled: isLoaded && isLoggedIn, staleWhileRevalidate: true }
  );

  // Optimized: Use cached fetch for user data  
  const { data: userData, loading: userDataLoading } = useCachedFetch<UserData>(
    '/api/auth/me',
    async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    { ttlMs: 60_000, enabled: isLoaded && isLoggedIn, staleWhileRevalidate: true }
  );

  // Calculate stats from cached data
  const stats = useMemo(() => {
    const enrollments = enrollmentsData?.enrollments || [];
    const completed = enrollments.filter((e) => e.status === 'completed').length;
    return {
      enrolled: enrollments.length,
      completed,
      points: userData?.totalPoints || 0,
      avgRating: 0,
    };
  }, [enrollmentsData, userData]);

  const statsLoading = enrollmentsLoading || userDataLoading;

  // Account
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('IST');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [completionNotifications, setCompletionNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Video preferences
  const [autoplay, setAutoplay] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState('720p');
  const [subtitles, setSubtitles] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Save
  const [saved, setSaved] = useState(false);

  // Populate profile fields from auth context
  useEffect(() => {
    if (userName) setDisplayName(userName);
    if (userEmail) setProfileEmail(userEmail);
  }, [userName, userEmail]);


  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Show loading while auth is loading
  if (!isLoaded) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Scroll to section with highlight effect
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      element.classList.add('highlight-flash');
      setTimeout(() => element.classList.remove('highlight-flash'), 1500);
      setActiveSection(sectionId);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-20 z-30 mb-8 border-b bg-card shadow-sm">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center justify-between px-4 py-4 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Jump to:</span>
            <span className="font-semibold text-foreground">{SECTIONS.find(s => s.id === activeSection)?.label}</span>
          </div>
          {dropdownOpen ? (
            <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
          )}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute left-0 right-0 mt-0 border-t bg-card shadow-lg">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    scrollToSection(section.id);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent border-b border-border/50",
                    isActive && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{section.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>

      <div className="space-y-6">
        {/* ===== Profile ===== */}
        <section id="profile" className="scroll-mt-36 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            {userRole && (
              <span className={cn(
                "ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium",
                userRole === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  userRole === 'instructor' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              )}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            )}
          </div>
          <div className="flex gap-6">
            <div className="shrink-0">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-3xl font-bold text-white">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setProfilePhoto(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block text-sm">Display Name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block text-sm">Email</Label>
                  <Input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Email is managed by your sign-in provider</p>
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-sm">Bio</Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Tell a bit about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Enrolled', value: statsLoading ? '...' : String(stats.enrolled), icon: BookOpen, color: 'text-blue-500' },
              { label: 'Completed', value: statsLoading ? '...' : String(stats.completed), icon: CheckCircle, color: 'text-green-500' },
              { label: 'Points', value: statsLoading ? '...' : String(stats.points), icon: Trophy, color: 'text-yellow-500' },
              { label: 'Avg Rating', value: '4.5', icon: Star, color: 'text-orange-500' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-lg bg-muted/50 p-3 text-center">
                  <Icon className={`mx-auto mb-1 h-5 w-5 ${stat.color}`} />
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== Account Settings ===== */}
        <section id="account" className="scroll-mt-36 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Account Settings</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm">Language</Label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Timezone</Label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="UTC">UTC</option>
                <option value="IST">IST (Asia/Kolkata)</option>
                <option value="EST">EST (America/New_York)</option>
                <option value="PST">PST (America/Los_Angeles)</option>
                <option value="CET">CET (Europe/Paris)</option>
              </select>
            </div>
          </div>
        </section>

        {/* ===== Notifications ===== */}
        <section id="notifications" className="scroll-mt-36 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', desc: 'Receive email notifications for updates', state: emailNotifications, set: setEmailNotifications },
              { label: 'Course Updates', desc: 'Get notified when course content is updated', state: courseUpdates, set: setCourseUpdates },
              { label: 'Course Completions', desc: 'Get notified when you complete a course', state: completionNotifications, set: setCompletionNotifications },
              { label: 'Weekly Digest', desc: 'Receive a weekly summary of your learning progress', state: weeklyDigest, set: setWeeklyDigest },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={item.state} onCheckedChange={item.set} />
              </div>
            ))}
          </div>
        </section>

        {/* ===== Video Preferences ===== */}
        <section id="video" className="scroll-mt-36 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Video Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Autoplay</p>
                <p className="text-xs text-muted-foreground">Automatically play the next video in a course</p>
              </div>
              <Switch checked={autoplay} onCheckedChange={setAutoplay} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Subtitles / Closed Captions</p>
                <p className="text-xs text-muted-foreground">Show subtitles when available</p>
              </div>
              <Switch checked={subtitles} onCheckedChange={setSubtitles} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm">Default Quality</Label>
                <select
                  value={defaultQuality}
                  onChange={(e) => setDefaultQuality(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="auto">Auto</option>
                  <option value="360p">360p</option>
                  <option value="480p">480p</option>
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">Default Playback Speed</Label>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="0.5x">0.5x</option>
                  <option value="0.75x">0.75x</option>
                  <option value="1x">1x (Normal)</option>
                  <option value="1.25x">1.25x</option>
                  <option value="1.5x">1.5x</option>
                  <option value="2x">2x</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Appearance ===== */}
        <section id="appearance" className="scroll-mt-36 rounded-lg border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="flex items-center gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                      : 'border-border text-muted-foreground hover:border-muted-foreground/30 hover:bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}
            <span className="ml-auto text-xs text-muted-foreground">
              Active: <span className="font-medium text-foreground">{resolvedTheme}</span>
            </span>
          </div>
        </section>

        {/* ===== Security ===== */}
        <section id="security" className="scroll-mt-36 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Session Timeout (minutes)</Label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="never">Never</option>
              </select>
            </div>
            <button className="text-sm text-primary hover:underline">Change Password</button>
          </div>
        </section>

        {/* ===== Help & Support ===== */}
        <section id="help" className="scroll-mt-36 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Help & Support</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Documentation', desc: 'Read the platform documentation' },
              { label: 'FAQs', desc: 'Frequently asked questions' },
              { label: 'Contact Support', desc: 'Get in touch with our team' },
              { label: 'Report a Bug', desc: 'Report an issue or suggest an improvement' },
            ].map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>

        {/* ===== About ===== */}
        <section id="about" className="scroll-mt-36 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">About</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">LearnSphere</span> is a modern eLearning platform
              designed to make teaching and learning seamless. Built with Next.js, React, and Tailwind CSS.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <span>Version: <span className="font-medium text-foreground">1.0.0</span></span>
              <span>Framework: <span className="font-medium text-foreground">Next.js 15</span></span>
              <span>License: <span className="font-medium text-foreground">MIT</span></span>
            </div>
            <div className="flex gap-4 pt-1">
              <button className="flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> Website
              </button>
              <button className="flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> GitHub
              </button>
              <button className="flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> Privacy Policy
              </button>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <Button variant="odoo" onClick={handleSave}>
            {saved ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </>
            )}
          </Button>
        </div>

        {/* ===== Logout ===== */}
        <div className="border-t border-border pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>

        {/* Footer */}
        <div className="pb-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground">LearnSphere</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0 &middot; &copy; 2026 LearnSphere Inc.</p>
        </div>
      </div>
    </div>
  );
}
