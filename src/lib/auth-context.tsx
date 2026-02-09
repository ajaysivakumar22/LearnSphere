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
  userEmail: string | null;
  userId: string | null;
  logout: () => void;
  /** Force refresh user data from backend */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoaded: false,
  userRole: null,
  userName: null,
  userEmail: null,
  userId: null,
  logout: () => { },
  refreshUser: async () => { },
});

export function useAuth() {
  return useContext(AuthContext);
}

// Session storage key for caching user data
const USER_CACHE_KEY = 'learnsphere-user-cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedUserData {
  role: string;
  name: string;
  email: string;
  id: string;
  timestamp: number;
}

function getCachedUserData(email: string): CachedUserData | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(USER_CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached) as CachedUserData;
    // Verify email matches and cache is still valid
    if (data.email === email && Date.now() - data.timestamp < CACHE_TTL_MS) {
      return data;
    }
    sessionStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedUserData(data: CachedUserData) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore cache errors
  }
}

function clearCachedUserData() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // Ignore cache errors
  }
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
  onAuthChange: (signedIn: boolean, name: string | null, email: string | null) => void;
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
      const email = user.emailAddresses?.[0]?.emailAddress || null;
      onAuthChange(true, name, email);
    } else {
      onAuthChange(false, null, null);
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Ref to Clerk's signOut — populated by ClerkAuthSync
  const signOutRef = useRef<(() => Promise<void>) | null>(null);
  const fetchInProgress = useRef(false);

  // Clean up legacy localStorage keys from old auth system
  useEffect(() => {
    localStorage.removeItem('learnsphere-auth');
    localStorage.removeItem('learnsphere-guest');
  }, []);

  // Function to fetch user data from backend with caching
  const fetchUserData = useCallback(async (email: string | null, forceRefresh: boolean = false) => {
    // Prevent duplicate requests
    if (fetchInProgress.current) return;

    // Try cache first (unless force refresh)
    if (!forceRefresh && email) {
      const cached = getCachedUserData(email);
      if (cached) {
        const role = cached.role;
        if (role === 'admin' || role === 'instructor' || role === 'learner') {
          setUserRole(role);
        } else {
          setUserRole('learner');
        }
        if (cached.name) setUserName(cached.name);
        if (cached.email) setUserEmail(cached.email);
        if (cached.id) setUserId(cached.id);
        return;
      }
    }

    fetchInProgress.current = true;

    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch role');
      const data = await res.json();

      const role = data.role;
      if (role === 'admin' || role === 'instructor' || role === 'learner') {
        setUserRole(role);
      } else {
        setUserRole('learner');
      }

      // Set additional user data from the API
      if (data.name) setUserName(data.name);
      if (data.email) setUserEmail(data.email);
      if (data.id) setUserId(data.id);

      // Cache the result
      if (data.email) {
        setCachedUserData({
          role: data.role || 'learner',
          name: data.name || '',
          email: data.email,
          id: data.id || '',
          timestamp: Date.now(),
        });
      }

    } catch {
      // Fallback to learner if DB is unreachable
      setUserRole('learner');
    } finally {
      fetchInProgress.current = false;
    }
  }, []);

  // Callback for ClerkAuthSync to push state changes
  const handleAuthChange = useCallback((signedIn: boolean, name: string | null, email: string | null) => {
    setIsLoggedIn(signedIn);
    setUserName(name);
    setUserEmail(email);

    if (!signedIn) {
      setUserRole(null);
      setUserId(null);
      setIsLoaded(true);
      clearCachedUserData();
      return;
    }

    // Fetch actual role from DB via /api/auth/me (uses cache if available)
    fetchUserData(email).finally(() => {
      setIsLoaded(true);
    });
  }, [fetchUserData]);

  const refreshUser = useCallback(async () => {
    if (isLoggedIn && userEmail) {
      await fetchUserData(userEmail, true); // Force refresh
    }
  }, [isLoggedIn, userEmail, fetchUserData]);

  const logout = useCallback(async () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    setUserEmail(null);
    setUserId(null);
    clearCachedUserData();
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
    <AuthContext.Provider value={{ isLoggedIn, isLoaded, userRole, userName, userEmail, userId, logout, refreshUser }}>
      {clerkAvailable && (
        <ClerkAuthSync onAuthChange={handleAuthChange} signOutRef={signOutRef} />
      )}
      {children}
    </AuthContext.Provider>
  );
}
