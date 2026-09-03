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
    try {
      localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('auth_token', token);
    } catch (e) {
      console.warn('Unable to persist auth state to localStorage', e);
    }
  };

  const clearSession = () => {
    setInMemoryAccessToken(null);
    setAccessToken(null);
    setUser(null);
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    } catch (e) {
      console.warn('Unable to clear auth state from localStorage', e);
    }
  };

  useEffect(() => {
    let cancelled = false;

    // 1. Immediate optimistic hydration from localStorage if available
    try {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      if (storedUser) {
        const parsed = JSON.parse(storedUser) as AuthUser;
        if (parsed?.id && parsed?.role) {
          setUser(parsed);
          if (storedToken) {
            setAccessToken(storedToken);
            setInMemoryAccessToken(storedToken);
          }
        }
      }
    } catch (e) {
      console.warn('Unable to read auth state from localStorage', e);
    }

    // 2. Verify active session with /api/v1/auth/me first (without rotating refresh token)
    async function verifySession() {
      try {
        const meRes = await fetch('/api/v1/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (meRes.ok) {
          const data = (await meRes.json()) as { user?: AuthUser };
          if (!cancelled && data.user) {
            setSession(getInMemoryAccessToken() || '', data.user);
            return;
          }
        }

        // 3. If /me failed, fall back to /api/v1/auth/refresh
        const refreshRes = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const session = (await refreshRes.json()) as { accessToken?: string; user?: AuthUser };
          if (!cancelled && session.accessToken && session.user) {
            setSession(session.accessToken, session.user);
            return;
          }
        }

        // 4. If unauthenticated, clear session
        if (!cancelled) {
          clearSession();
        }
      } catch {
        // Keep cached state on temporary network blips
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  return <AuthContext.Provider value={{ accessToken, user, ready, setSession, clearSession }}>{children}</AuthContext.Provider>;
}

const fallbackAuthContextValue: AuthContextValue = {
  accessToken: null,
  user: null,
  ready: false,
  setSession: () => {},
  clearSession: () => {},
};

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    return fallbackAuthContextValue;
  }
  return value;
}
