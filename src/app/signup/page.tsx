'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';

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

  // Simulated existing emails (in production this checks the database)
  const existingEmails = ['admin@learnsphere.com', 'instructor@learnsphere.com', 'learner@learnsphere.com'];

  const passwordErrors = validatePassword(password);
  const isPasswordValid = passwordErrors.length === 0;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isEmailDuplicate = existingEmails.includes(email.toLowerCase());

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (isEmailDuplicate) {
      setError('This email is already registered. Please use a different email or sign in.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please fix the password requirements below.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));

    // Redirect to login after successful signup
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-8">
      {/* Back to Home */}
      <Link
        href="/"
        className="fixed left-6 top-6 rounded-lg p-2 hover:bg-white/80"
        title="Back to home"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </Link>
          <h1 className="mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
            LearnSphere
          </h1>
          <p className="text-sm text-gray-500">Create your account</p>
        </div>

        {/* Sign Up Form */}
        <div className="rounded-xl border bg-white p-8 shadow-lg">
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Enter Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="Enter your full name"
                  className="pl-10"
                />
              </div>
              {touched.name && !name.trim() && (
                <p className="mt-1 text-xs text-red-500">Name is required</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Enter Email Id
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="Enter your email address"
                  className="pl-10"
                />
              </div>
              {touched.email && email && isEmailDuplicate && (
                <p className="mt-1 text-xs text-red-500">This email is already registered</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="mb-2 block">
                Enter Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="Create a password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password requirements */}
              {touched.password && password && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                        {passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                        )}
                        <span className={passed ? 'text-green-600' : 'text-gray-500'}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="mb-2 block">
                Re-Enter Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                  placeholder="Re-enter your password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.confirmPassword && confirmPassword && !doPasswordsMatch && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
              {touched.confirmPassword && doPasswordsMatch && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                </p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              variant="odoo"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'SIGN UP'}
            </Button>

            {/* Link to Login */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
