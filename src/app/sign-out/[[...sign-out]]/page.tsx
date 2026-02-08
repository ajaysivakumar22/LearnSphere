'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useClerkAvailable } from '@/components/shared/clerk-provider-wrapper';

/**
 * /sign-out page — destroys the Clerk session and redirects to /.
 *
 * This exists so that navigating to /sign-out always works
 * (no 404) and performs a clean sign-out via Clerk's signOut().
 */
export default function SignOutPage() {
  const clerkAvailable = useClerkAvailable();

  return clerkAvailable ? <ClerkSignOut /> : <FallbackSignOut />;
}

function ClerkSignOut() {
  const { signOut } = useClerk();

  useEffect(() => {
    signOut({ redirectUrl: '/' });
  }, [signOut]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Signing out…</p>
    </div>
  );
}

function FallbackSignOut() {
  useEffect(() => {
    window.location.href = '/';
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting…</p>
    </div>
  );
}
