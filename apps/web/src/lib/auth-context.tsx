'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type AuthRole = 'ADMIN' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  isProfileCompleted?: boolean;
}

interface AuthContextValue {
  accessToken: string | null;
  user: AuthUser | null;
  ready: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
  refreshSession: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let inMemoryAccessToken: string | null = null;

export function getInMemoryAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setInMemoryAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const setSession = useCallback((token: string, authenticatedUser: AuthUser) => {
    setInMemoryAccessToken(token);
    setAccessToken(token);
    setUser(authenticatedUser);
  }, []);

  const clearSession = useCallback(() => {
    setInMemoryAccessToken(null);
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    try {
      const refreshRes = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshRes.ok) {
        clearSession();
        return null;
      }

      const session = (await refreshRes.json()) as {
        accessToken?: string;
        user?: AuthUser;
      };

      if (session.accessToken && session.user) {
        setSession(session.accessToken, session.user);
        return session.accessToken;
      }

      clearSession();
      return null;
    } catch {
      return null;
    }
  }, [setSession, clearSession]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function silentTokenRecovery() {
      try {
        const refreshRes = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const session = (await refreshRes.json()) as {
            accessToken?: string;
            user?: AuthUser;
          };

          if (!cancelled && session.accessToken && session.user) {
            setSession(session.accessToken, session.user);
            return;
          }
        }

        if (!cancelled) {
          clearSession();
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void silentTokenRecovery();

    return () => {
      cancelled = true;
    };
  }, [setSession, clearSession]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        ready,
        setSession,
        clearSession,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const fallbackAuthContextValue: AuthContextValue = {
  accessToken: null,
  user: null,
  ready: false,
  setSession: () => {},
  clearSession: () => {},
  refreshSession: async () => null,
  logout: async () => {},
};

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    return fallbackAuthContextValue;
  }
  return value;
}
