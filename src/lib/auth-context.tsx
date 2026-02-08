'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useClerkAvailable } from '@/components/shared/clerk-provider-wrapper';

interface AuthContextType {
  /** True ONLY when Clerk confirms the user is signed in */
  isLoggedIn: boolean;
  /** True once the auth state has been resolved (Clerk loaded or fallback) */
  isLoaded: boolean;
  userRole: 'admin' | 'instructor' | 'learner' | null;
  userName: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoaded: false,
  userRole: null,
  userName: null,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Sub-component that runs ONLY inside ClerkProvider.
 * Syncs Clerk's auth state into AuthProvider via callbacks.
 * Also stores Clerk's signOut reference for our logout().
 */
function ClerkAuthSync({
  onAuthChange,
  signOutRef,
}: {
  onAuthChange: (signedIn: boolean, name: string | null) => void;
  signOutRef: React.MutableRefObject<(() => Promise<void>) | null>;
}) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Store signOut ref so AuthProvider's logout() can call it
  useEffect(() => {
    signOutRef.current = signOut;
  }, [signOut, signOutRef]);

  // Sync Clerk auth state into our context
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      const name = user.fullName || user.firstName || user.emailAddresses?.[0]?.emailAddress || 'User';
      onAuthChange(true, name);
    } else {
      onAuthChange(false, null);
    }
  }, [isLoaded, isSignedIn, user, onAuthChange]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const clerkAvailable = useClerkAvailable();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(!clerkAvailable); // If no Clerk, we're "loaded" immediately
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'learner' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Ref to Clerk's signOut — populated by ClerkAuthSync
  const signOutRef = useRef<(() => Promise<void>) | null>(null);

  // Clean up legacy localStorage keys from old auth system
  useEffect(() => {
    localStorage.removeItem('learnsphere-auth');
    localStorage.removeItem('learnsphere-guest');
  }, []);

  // Callback for ClerkAuthSync to push state changes
  const handleAuthChange = useCallback((signedIn: boolean, name: string | null) => {
    setIsLoggedIn(signedIn);
    setUserName(name);
    if (!signedIn) {
      setUserRole(null);
      setIsLoaded(true);
      return;
    }
    // Fetch actual role from DB via /api/auth/me
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch role');
        return res.json();
      })
      .then((data) => {
        const role = data.role;
        if (role === 'admin' || role === 'instructor' || role === 'learner') {
          setUserRole(role);
        } else {
          setUserRole('learner');
        }
      })
      .catch(() => {
        // Fallback to learner if DB is unreachable
        setUserRole('learner');
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  const logout = useCallback(async () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    // Sign out from Clerk
    if (signOutRef.current) {
      try {
        await signOutRef.current();
      } catch {
        // Clerk signOut may redirect — ignore errors
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoaded, userRole, userName, logout }}>
      {clerkAvailable && (
        <ClerkAuthSync onAuthChange={handleAuthChange} signOutRef={signOutRef} />
      )}
      {children}
    </AuthContext.Provider>
  );
}
