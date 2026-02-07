'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shared/dialog';

// Demo credentials
const DEMO_USERS = [
  { email: 'admin@learnsphere.com', password: 'Admin@123', role: 'admin' },
  { email: 'instructor@learnsphere.com', password: 'Instructor@123', role: 'instructor' },
  { email: 'learner@learnsphere.com', password: 'Learner@123', role: 'learner' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

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

    // Simulate authentication delay
    await new Promise((r) => setTimeout(r, 800));

    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      setError('Invalid Email or Password');
      setIsLoading(false);
      return;
    }

    // Redirect based on role
    if (user.role === 'admin' || user.role === 'instructor') {
      router.push('/admin/courses');
    } else {
      router.push('/learner/my-courses');
    }
  };

  const handleForgotPassword = () => {
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
  };

  const closeForgotDialog = () => {
    setShowForgotDialog(false);
    setForgotEmail('');
    setForgotSent(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4">
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
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="rounded-xl border bg-white p-8 shadow-lg">
          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email
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
                  placeholder="Enter your email"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="mb-2 block">
                Password
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
                  placeholder="Enter your password"
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
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="odoo"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'SIGN IN'}
            </Button>

            {/* Links */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setShowForgotDialog(true)}
                className="text-primary hover:underline"
              >
                Forget Password?
              </button>
              <span className="text-gray-400">|</span>
              <Link href="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-center text-xs font-medium text-gray-400">DEMO CREDENTIALS</p>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between rounded bg-gray-50 px-3 py-1.5">
                <span>Admin:</span>
                <span className="font-mono">admin@learnsphere.com / Admin@123</span>
              </div>
              <div className="flex justify-between rounded bg-gray-50 px-3 py-1.5">
                <span>Instructor:</span>
                <span className="font-mono">instructor@learnsphere.com / Instructor@123</span>
              </div>
              <div className="flex justify-between rounded bg-gray-50 px-3 py-1.5">
                <span>Learner:</span>
                <span className="font-mono">learner@learnsphere.com / Learner@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={closeForgotDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>

          {!forgotSent ? (
            <>
              <div className="py-4">
                <Label htmlFor="forgotEmail" className="mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeForgotDialog}>
                  Cancel
                </Button>
                <Button
                  variant="odoo"
                  onClick={handleForgotPassword}
                  disabled={!forgotEmail.trim()}
                >
                  Send Reset Link
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <p className="mb-1 font-medium text-gray-900">Check your email</p>
              <p className="mb-4 text-sm text-gray-500">
                We&apos;ve sent a password reset link to <strong>{forgotEmail}</strong>
              </p>
              <Button variant="odoo" onClick={closeForgotDialog}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
