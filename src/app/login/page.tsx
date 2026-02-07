'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// Demo credentials — role is determined by the email, not a dropdown
const DEMO_USERS = [
  { email: 'admin@learnsphere.com', password: 'Admin@123', role: 'admin' as const, name: 'Admin User' },
  { email: 'instructor@learnsphere.com', password: 'Instructor@123', role: 'instructor' as const, name: 'Instructor User' },
  { email: 'learner@learnsphere.com', password: 'Learner@123', role: 'learner' as const, name: 'Learner User' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      setError('Invalid email or password.');
      setIsLoading(false);
      return;
    }

    // Save to auth context (persists in localStorage)
    login(user.role, user.name);

    // Role-based redirection
    if (user.role === 'admin') {
      router.push('/admin/courses');
    } else if (user.role === 'instructor') {
      router.push('/instructor/courses');
    } else {
      router.push('/learner/my-courses');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: '#0f0f0f' }}>

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-violet-500 shadow-lg shadow-purple-500/25">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight" style={{ color: '#f1f1f1' }}>
            LearnSphere
          </h1>
          <p className="text-sm" style={{ color: '#888' }}>
            Sign in to manage courses or continue learning
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border p-8 shadow-2xl"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>

          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
                style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium" style={{ color: '#ccc' }}>
                Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#666' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="Enter your email"
                  className="h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition-all placeholder:text-[#555]"
                  style={{
                    backgroundColor: '#111',
                    borderColor: '#333',
                    color: '#f1f1f1',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium" style={{ color: '#ccc' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#666' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-lg border pl-10 pr-10 text-sm outline-none transition-all placeholder:text-[#555]"
                  style={{
                    backgroundColor: '#111',
                    borderColor: '#333',
                    color: '#f1f1f1',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  style={{ color: '#666' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#aaa')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full cursor-pointer rounded-lg text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9, #9333ea)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed, #a855f7)';
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1" style={{ backgroundColor: '#2a2a2a' }} />
            <span className="text-xs" style={{ color: '#666' }}>OR</span>
            <div className="h-px flex-1" style={{ backgroundColor: '#2a2a2a' }} />
          </div>

          {/* Guest Access */}
          <button
            onClick={() => router.push('/learner/explore')}
            className="h-10 w-full cursor-pointer rounded-lg border text-sm font-medium transition-all"
            style={{ borderColor: '#333', color: '#aaa', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed';
              e.currentTarget.style.color = '#c4b5fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.color = '#aaa';
            }}
          >
            Continue as Guest
          </button>

          {/* Sign Up link */}
          <p className="mt-5 text-center text-sm" style={{ color: '#666' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium transition-colors"
              style={{ color: '#a78bfa' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a78bfa')}
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 rounded-xl border p-4" style={{ borderColor: '#222', backgroundColor: '#141414' }}>
          <p className="mb-3 text-center text-xs font-semibold tracking-wider" style={{ color: '#555' }}>
            DEMO CREDENTIALS
          </p>
          <div className="space-y-1.5">
            {[
              { label: 'Admin', email: 'admin@learnsphere.com', pass: 'Admin@123' },
              { label: 'Instructor', email: 'instructor@learnsphere.com', pass: 'Instructor@123' },
              { label: 'Learner', email: 'learner@learnsphere.com', pass: 'Learner@123' },
            ].map((cred) => (
              <button
                key={cred.label}
                type="button"
                onClick={() => { setEmail(cred.email); setPassword(cred.pass); setError(''); }}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors"
                style={{ backgroundColor: '#1a1a1a', color: '#888' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#222';
                  e.currentTarget.style.color = '#bbb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.color = '#888';
                }}
              >
                <span className="font-medium" style={{ color: '#a78bfa' }}>{cred.label}</span>
                <span className="font-mono">{cred.email} / {cred.pass}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
