'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: 'admin' | 'instructor' | 'learner' | null;
  userName: string | null;
  login: (role: 'admin' | 'instructor' | 'learner', name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userRole: null,
  userName: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'learner' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('learnsphere-auth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setIsLoggedIn(true);
        setUserRole(data.role);
        setUserName(data.name);
      } catch {
        // invalid data, clear it
        localStorage.removeItem('learnsphere-auth');
      }
    }
  }, []);

  const login = (role: 'admin' | 'instructor' | 'learner', name: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    localStorage.setItem('learnsphere-auth', JSON.stringify({ role, name }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    localStorage.removeItem('learnsphere-auth');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
