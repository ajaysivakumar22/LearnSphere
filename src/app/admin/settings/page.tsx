'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sun, Moon, Monitor, Bell, Globe, Shield, User, Camera, HelpCircle,
  Settings, PlayCircle, Info, LogOut, ChevronRight, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

// Section definitions for navigation
const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account Settings', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'video', label: 'Video Preferences', icon: PlayCircle },
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'security', label: 'Security & Access', icon: Shield },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
  { id: 'about', label: 'About', icon: Info },
];

export default function AdminSettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { userName, userEmail, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Profile
  const [displayName, setDisplayName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [bio, setBio] = useState('Platform administrator at LearnSphere');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (userName) setDisplayName(userName);
    if (userEmail) setProfileEmail(userEmail);
  }, [userName, userEmail]);

  // General / Account
  const [platformName, setPlatformName] = useState('LearnSphere');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [defaultVisibility, setDefaultVisibility] = useState('everyone');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [enrollmentNotifications, setEnrollmentNotifications] = useState(true);
  const [completionNotifications, setCompletionNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('learnsphere-notifications');
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.email_notifications !== undefined) setEmailNotifications(prefs.email_notifications);
        if (prefs.new_enrollments !== undefined) setEnrollmentNotifications(prefs.new_enrollments);
        if (prefs.course_completions !== undefined) setCompletionNotifications(prefs.course_completions);
        if (prefs.weekly_digest !== undefined) setWeeklyDigest(prefs.weekly_digest);
      }
    } catch { }
    setNotificationsLoaded(true);
  }, []);

  useEffect(() => {
    if (!notificationsLoaded) return;
    try {
      localStorage.setItem('learnsphere-notifications', JSON.stringify({
        email_notifications: emailNotifications,
        new_enrollments: enrollmentNotifications,
        course_completions: completionNotifications,
        weekly_digest: weeklyDigest,
      }));
    } catch { }
  }, [notificationsLoaded, emailNotifications, enrollmentNotifications, completionNotifications, weeklyDigest]);

  // Video preferences
  const [autoplay, setAutoplay] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState('720p');
  const [subtitles, setSubtitles] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

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
    // Keep dropdown open - user can click again to close
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Fixed Left Sidebar Navigation */}
      <aside
        ref={dropdownRef}
        className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-card z-40 flex flex-col"
      >
        {/* Dropdown Toggle */}
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-between gap-2 border-b px-4 py-4 text-left hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Jump to:</span>
            <span className="font-semibold text-foreground">{SECTIONS.find(s => s.id === activeSection)?.label}</span>
          </div>
          {dropdownOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Navigation Items - Always visible but collapsible */}
        <nav className={cn(
          "flex-1 overflow-y-auto transition-all duration-200",
          dropdownOpen ? "opacity-100" : "opacity-0 pointer-events-none h-0"
        )}>
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent border-b border-border/50",
                  isActive && "bg-primary/10 text-primary border-l-4 border-l-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{section.label}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content - Offset by sidebar width */}
      <main className="flex-1 ml-64 p-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Settings</h1>

        <div className="max-w-4xl space-y-8">
          {/* ===== User Profile ===== */}
          <section id="profile" className="rounded-xl border bg-card p-8 scroll-mt-24 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Profile</h2>
            </div>
            <div className="flex gap-8">
              {/* Photo */}
              <div className="shrink-0">
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-4xl font-bold text-white shadow-lg">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
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
              {/* Fields */}
              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <Label className="mb-2 block text-sm font-medium">Display Name</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm font-medium">Email</Label>
                    <Input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="h-11" />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium">Bio</Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
                    placeholder="Tell a bit about yourself..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ===== Account Settings ===== */}
          <section id="account" className="rounded-xl border bg-card p-8 scroll-mt-24 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Account Settings</h2>
            </div>
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block text-sm font-medium">Platform Name</Label>
                <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label className="mb-2 block text-sm font-medium">Language</Label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
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
                  <Label className="mb-2 block text-sm font-medium">Timezone</Label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
                  >
                    <option value="UTC">UTC</option>
                    <option value="IST">IST (Asia/Kolkata)</option>
                    <option value="EST">EST (America/New_York)</option>
                    <option value="PST">PST (America/Los_Angeles)</option>
                    <option value="CET">CET (Europe/Paris)</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Default Course Visibility</Label>
                <select
                  value={defaultVisibility}
                  onChange={(e) => setDefaultVisibility(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
                >
                  <option value="everyone">Everyone</option>
                  <option value="signed_in">Signed In Users Only</option>
                </select>
              </div>
            </div>
          </section>

          {/* ===== Notifications ===== */}
          <section id="notifications" className="rounded-xl border bg-card p-8 scroll-mt-24 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Email Notifications', desc: 'Receive email notifications for platform events', state: emailNotifications, set: setEmailNotifications },
                { label: 'New Enrollments', desc: 'Get notified when someone enrolls in a course', state: enrollmentNotifications, set: setEnrollmentNotifications },
                { label: 'Course Completions', desc: 'Get notified when a learner completes a course', state: completionNotifications, set: setCompletionNotifications },
                { label: 'Weekly Digest', desc: 'Receive a weekly summary of platform activity', state: weeklyDigest, set: setWeeklyDigest },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-base font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.state} onCheckedChange={item.set} />
                </div>
              ))}
            </div>
          </section>

          {/* ===== Video Preferences ===== */}
          <section id="video" className="rounded-xl border bg-card p-8 scroll-mt-24 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <PlayCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Video Preferences</h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-base font-medium text-foreground">Autoplay</p>
                  <p className="text-sm text-muted-foreground">Automatically play the next video in a course</p>
                </div>
                <Switch checked={autoplay} onCheckedChange={setAutoplay} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-base font-medium text-foreground">Subtitles / Closed Captions</p>
                  <p className="text-sm text-muted-foreground">Show subtitles when available</p>
                </div>
                <Switch checked={subtitles} onCheckedChange={setSubtitles} />
              </div>
              <div className="grid grid-cols-2 gap-5 pt-2">
                <div>
                  <Label className="mb-2 block text-sm font-medium">Default Quality</Label>
                  <select
                    value={defaultQuality}
                    onChange={(e) => setDefaultQuality(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
                  >
                    <option value="auto">Auto</option>
                    <option value="360p">360p</option>
                    <option value="480p">480p</option>
                    <option value="720p">720p (HD)</option>
                    <option value="1080p">1080p (Full HD)</option>
                  </select>
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium">Default Playback Speed</Label>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
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
          <section id="appearance" className="rounded-xl border bg-card p-8 scroll-mt-24 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Sun className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="flex items-center gap-4">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 px-6 py-4 text-base font-medium transition-all',
                      isActive
                        ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                        : 'border-border text-muted-foreground hover:border-muted-foreground/30 hover:bg-accent'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {opt.label}
                  </button>
                );
              })}
              <span className="ml-auto text-sm text-muted-foreground">
                Active: <span className="font-medium text-foreground">{resolvedTheme}</span>
              </span>
            </div>
          </section>

          {/* ===== Security & Access ===== */}
          <section id="security" className="rounded-xl border bg-card p-8 scroll-mt-24 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Security & Access</h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-base font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-base font-medium text-foreground">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">When enabled, only admins can access the platform</p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <div className="pt-2">
                <Label className="mb-2 block text-sm font-medium">Session Timeout (minutes)</Label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="flex h-11 w-full max-w-xs rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground dark:bg-[hsl(222.2,47%,14%)] dark:border-[hsl(217.2,32.6%,30%)]"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <button className="text-base text-primary hover:underline">Change Password</button>
            </div>
          </section>

          {/* ===== Help & Support ===== */}
          <section id="help" className="rounded-xl border bg-card p-8 scroll-mt-24 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Help & Support</h2>
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
                  className="flex w-full items-center justify-between rounded-lg px-4 py-4 text-left transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="text-base font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>

          {/* ===== About ===== */}
          <section id="about" className="rounded-xl border bg-card p-8 scroll-mt-24 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">About</h2>
            </div>
            <div className="space-y-4 text-base text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">LearnSphere</span> is a modern eLearning platform
                designed to make teaching and learning seamless. Built with Next.js, React, and Tailwind CSS.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <span>Version: <span className="font-medium text-foreground">1.0.0</span></span>
                <span>Framework: <span className="font-medium text-foreground">Next.js 15</span></span>
                <span>License: <span className="font-medium text-foreground">MIT</span></span>
              </div>
              <div className="flex gap-6 pt-2">
                <button className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4" />
                  Website
                </button>
                <button className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4" />
                  GitHub
                </button>
                <button className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4" />
                  Privacy Policy
                </button>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button variant="odoo" size="lg" onClick={() => alert('Settings saved!')}>
              Save Settings
            </Button>
          </div>

          {/* Logout */}
          <div className="border-t border-border pt-6">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-base font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>

          {/* App Version */}
          <div className="pb-8 text-center">
            <p className="text-base font-semibold text-muted-foreground">LearnSphere</p>
            <p className="text-sm text-muted-foreground">Version 1.0.0 · © 2026 LearnSphere Inc.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
