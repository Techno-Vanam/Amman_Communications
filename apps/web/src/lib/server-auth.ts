import { cookies } from 'next/headers';

type UserRole = 'CUSTOMER' | 'ADMIN';

export interface ServerAuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isProfileCompleted?: boolean;
}

const PRIMARY_API_BASE = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://127.0.0.1:3003'
)
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

export async function getAuthenticatedSession(): Promise<{
  accessToken: string;
  user: ServerAuthUser;
} | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;
  if (!refreshToken) return null;

  const targetUrl = `${PRIMARY_API_BASE}/api/v1/auth/verify-session`;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refreshToken}` },
      cache: 'no-store',
    });
  } catch {
    const fallbackUrl = targetUrl.includes('localhost')
      ? targetUrl.replace('localhost', '127.0.0.1')
      : targetUrl.replace('127.0.0.1', 'localhost');
    try {
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { Cookie: `refresh_token=${refreshToken}` },
        cache: 'no-store',
      });
    } catch {
      return null;
    }
  }

  if (!response.ok) return null;

  const data = (await response.json()) as {
    accessToken?: string;
    user?: ServerAuthUser;
  };

  if (!data.accessToken || !data.user || !data.user.role) {
    return null;
  }

  const rotatedRefreshToken = response.headers.get('set-cookie')?.match(/refresh_token=([^;]+)/)?.[1];
  if (rotatedRefreshToken) {
    try {
      cookieStore.set('refresh_token', rotatedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    } catch {
      // In read-only server components, ignore cookie setting error
    }
  }

  return {
    accessToken: data.accessToken,
    user: data.user,
  };
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getAuthenticatedSession();
  return session?.accessToken ?? null;
}

export async function getAuthenticatedRole(): Promise<UserRole | null> {
  const session = await getAuthenticatedSession();
  return session?.user?.role ?? null;
}

export async function getAuthenticatedUser(): Promise<ServerAuthUser | null> {
  const session = await getAuthenticatedSession();
  return session?.user ?? null;
}
