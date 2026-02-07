'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  isGuest: boolean;
  userRole: 'admin' | 'instructor' | 'learner' | null;
  userName: string | null;
  guestName: string | null;
  login: (role: 'admin' | 'instructor' | 'learner', name: string) => void;
  loginAsGuest: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isGuest: false,
  userRole: null,
  userName: null,
  guestName: null,
  login: () => {},
  loginAsGuest: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'learner' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    // Check for authenticated user first
    const stored = localStorage.getItem('learnsphere-auth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setIsLoggedIn(true);
        setUserRole(data.role);
        setUserName(data.name);
        return;
      } catch {
        localStorage.removeItem('learnsphere-auth');
      }
    }
    // Check for guest session
    const guest = localStorage.getItem('learnsphere-guest');
    if (guest) {
      try {
        const data = JSON.parse(guest);
        setIsGuest(true);
        setGuestName(data.name);
      } catch {
        localStorage.removeItem('learnsphere-guest');
      }
    }
  }, []);

  const login = (role: 'admin' | 'instructor' | 'learner', name: string) => {
    // Clear guest session on real login
    setIsGuest(false);
    setGuestName(null);
    localStorage.removeItem('learnsphere-guest');

    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    localStorage.setItem('learnsphere-auth', JSON.stringify({ role, name }));
  };

  const loginAsGuest = (name: string) => {
    setIsGuest(true);
    setGuestName(name);
    localStorage.setItem('learnsphere-guest', JSON.stringify({ name }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsGuest(false);
    setUserRole(null);
    setUserName(null);
    setGuestName(null);
    localStorage.removeItem('learnsphere-auth');
    localStorage.removeItem('learnsphere-guest');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isGuest, userRole, userName, guestName, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
