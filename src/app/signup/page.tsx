'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('One special character');
  return errors;
}

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });

  const existingEmails = ['admin@learnsphere.com', 'instructor@learnsphere.com', 'learner@learnsphere.com'];
  const passwordErrors = validatePassword(password);
  const isPasswordValid = passwordErrors.length === 0;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isEmailDuplicate = existingEmails.includes(email.toLowerCase());

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (isEmailDuplicate) { setError('This email is already registered.'); return; }
    if (!isPasswordValid) { setError('Please fix the password requirements below.'); return; }
    if (!doPasswordsMatch) { setError('Passwords do not match.'); return; }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push('/login');
  };

  const inputStyle = {
    backgroundColor: '#111',
    borderColor: '#333',
    color: '#f1f1f1',
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#7c3aed';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.2)';
  };

  const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#333';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#0f0f0f' }}>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-violet-500 shadow-lg shadow-purple-500/25">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight" style={{ color: '#f1f1f1' }}>
            LearnSphere
          </h1>
          <p className="text-sm" style={{ color: '#888' }}>Create your account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8 shadow-2xl" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
                style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: '#ccc' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#666' }} />
                <input
                  type="text" value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  onBlur={(e) => { setTouched((t) => ({ ...t, name: true })); blurInput(e); }}
                  onFocus={focusInput}
                  placeholder="Enter your full name"
                  className="h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition-all placeholder:text-[#555]"
                  style={inputStyle}
                />
              </div>
              {touched.name && !name.trim() && <p className="mt-1 text-xs" style={{ color: '#f87171' }}>Name is required</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: '#ccc' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#666' }} />
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  onBlur={(e) => { setTouched((t) => ({ ...t, email: true })); blurInput(e); }}
                  onFocus={focusInput}
                  placeholder="Enter your email address"
                  className="h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition-all placeholder:text-[#555]"
                  style={inputStyle}
                />
              </div>
              {touched.email && email && isEmailDuplicate && <p className="mt-1 text-xs" style={{ color: '#f87171' }}>This email is already registered</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: '#ccc' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#666' }} />
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onBlur={(e) => { setTouched((t) => ({ ...t, password: true })); blurInput(e); }}
                  onFocus={focusInput}
                  placeholder="Create a password"
                  className="h-11 w-full rounded-lg border pl-10 pr-10 text-sm outline-none transition-all placeholder:text-[#555]"
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: '#666' }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.password && password && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                        {passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5" style={{ color: '#555' }} />
                        )}
                        <span style={{ color: passed ? '#22c55e' : '#666' }}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: '#ccc' }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#666' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  onBlur={(e) => { setTouched((t) => ({ ...t, confirmPassword: true })); blurInput(e); }}
                  onFocus={focusInput}
                  placeholder="Re-enter your password"
                  className="h-11 w-full rounded-lg border pl-10 pr-10 text-sm outline-none transition-all placeholder:text-[#555]"
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: '#666' }}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.confirmPassword && confirmPassword && !doPasswordsMatch && (
                <p className="mt-1 text-xs" style={{ color: '#f87171' }}>Passwords do not match</p>
              )}
              {touched.confirmPassword && doPasswordsMatch && (
                <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={isLoading}
              className="h-11 w-full cursor-pointer rounded-lg text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9, #9333ea)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed, #a855f7)'; }}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>

            <p className="text-center text-sm" style={{ color: '#666' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-medium transition-colors"
                style={{ color: '#a78bfa' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#a78bfa')}>
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
