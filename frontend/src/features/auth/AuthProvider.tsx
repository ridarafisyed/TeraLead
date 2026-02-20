'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '@/lib/api';

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'teralead_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      setToken(existing);
      setAuthToken(existing);
    }
    setIsReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isReady,
      login(nextToken: string) {
        setToken(nextToken);
        setAuthToken(nextToken);
        window.localStorage.setItem(STORAGE_KEY, nextToken);
      },
      logout() {
        setToken(null);
        setAuthToken(null);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }),
    [isReady, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
