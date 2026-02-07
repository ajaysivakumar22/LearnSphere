'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, User, ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsGuest } = useAuth();
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestDisplayName, setGuestDisplayName] = useState('');

  const handleGuestContinue = () => {
    const name = guestDisplayName.trim();
    if (!name) return;
    loginAsGuest(name);
    router.push('/learner/explore');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: '#0f0f0f' }}>

      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm transition-colors"
          style={{ color: '#666' }}>
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

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

        {/* Auth Card */}
        <div className="rounded-2xl border p-8 shadow-2xl"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>

          {/* Sign In Button */}
          <Link href="/sign-in">
            <button
              className="h-11 w-full cursor-pointer rounded-lg text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              <span className="flex items-center justify-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Sign In
              </span>
            </button>
          </Link>

          {/* Sign Up Button */}
          <Link href="/sign-up" className="mt-3 block">
            <button
              className="h-11 w-full cursor-pointer rounded-lg border text-sm font-medium transition-all"
              style={{ borderColor: '#333', color: '#ccc', backgroundColor: 'transparent' }}
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create Account
              </span>
            </button>
          </Link>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1" style={{ backgroundColor: '#2a2a2a' }} />
            <span className="text-xs" style={{ color: '#666' }}>OR</span>
            <div className="h-px flex-1" style={{ backgroundColor: '#2a2a2a' }} />
          </div>

          {/* Guest Access */}
          {!showGuestInput ? (
            <button
              onClick={() => setShowGuestInput(true)}
              className="h-11 w-full cursor-pointer rounded-lg border text-sm font-medium transition-all"
              style={{ borderColor: '#333', color: '#aaa', backgroundColor: 'transparent' }}
            >
              Continue as Guest
            </button>
          ) : (
            <div>
              <p className="mb-3 text-sm font-medium" style={{ color: '#ccc' }}>
                Enter your display name
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#666' }} />
                  <input
                    type="text"
                    value={guestDisplayName}
                    onChange={(e) => setGuestDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGuestContinue()}
                    placeholder="Your name"
                    autoFocus
                    className="h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition-all placeholder:text-[#555]"
                    style={{ backgroundColor: '#111', borderColor: '#333', color: '#f1f1f1' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  />
                </div>
                <button
                  onClick={handleGuestContinue}
                  disabled={!guestDisplayName.trim()}
                  className="rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                >
                  Go
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
