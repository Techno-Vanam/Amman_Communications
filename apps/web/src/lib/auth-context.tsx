'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type AuthRole = 'ADMIN' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}

interface AuthContextValue {
  accessToken: string | null;
  user: AuthUser | null;
  ready: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
let inMemoryAccessToken: string | null = null;

export function getInMemoryAccessToken() {
  return inMemoryAccessToken;
}

export function setInMemoryAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const setSession = (token: string, authenticatedUser: AuthUser) => {
    setInMemoryAccessToken(token);
    setAccessToken(token);
    setUser(authenticatedUser);
  };

  const clearSession = () => {
    setInMemoryAccessToken(null);
    setAccessToken(null);
    setUser(null);
  };

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return;
        const session = (await response.json()) as { accessToken?: string; user?: AuthUser };
        if (!cancelled && session.accessToken && session.user) setSession(session.accessToken, session.user);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <AuthContext.Provider value={{ accessToken, user, ready, setSession, clearSession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
