import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

type UserRole = 'CUSTOMER' | 'ADMIN';

type JwtPayload = {
  sub?: string;
  role?: UserRole;
  exp?: number;
  nbf?: number;
};

export async function getAccessToken() {
  const cookieStore = await cookies();
  const cachedAccessToken = cookieStore.get('access_token')?.value;

  if (cachedAccessToken) {
    try {
      const parts = cachedAccessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(decodePart(parts[1])) as JwtPayload;
        const now = Math.floor(Date.now() / 1000);
        if (typeof payload.exp === 'number' && payload.exp > now + 10) {
          return cachedAccessToken;
        }
      }
    } catch {
      // Fall through to refresh
    }
  }

  const refreshToken = cookieStore.get('refresh_token')?.value;
  if (!refreshToken) return null;

  const primaryApiBase = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/api\/?$/, '');

  let response: Response;
  try {
    response = await fetch(`${primaryApiBase}/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refreshToken}` },
      cache: 'no-store',
    });
  } catch {
    try {
      response = await fetch('http://127.0.0.1:3003/v1/auth/refresh', {
        method: 'POST',
        headers: { Cookie: `refresh_token=${refreshToken}` },
        cache: 'no-store',
      });
    } catch {
      return null;
    }
  }

  if (!response.ok) return null;
  const session = (await response.json()) as { accessToken?: string };
  const rotatedRefreshToken = response.headers.get('set-cookie')?.match(/refresh_token=([^;]+)/)?.[1];

  if (session.accessToken) {
    try {
      cookieStore.set('access_token', session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      });
    } catch {
      // Read-only server components can still use the transient access token.
    }
  }

  if (rotatedRefreshToken) {
    try {
      cookieStore.set('refresh_token', rotatedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    } catch {
      // Read-only server components can still use the transient access token.
    }
  }
  return session.accessToken ?? null;
}

function decodePart(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export async function getAuthenticatedRole(): Promise<UserRole | null> {
  const token = await getAccessToken();
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!token || !secret) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = JSON.parse(decodePart(encodedHeader)) as { alg?: string; typ?: string };
    const payload = JSON.parse(decodePart(encodedPayload)) as JwtPayload;
    const expectedSignature = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
    const receivedSignature = Buffer.from(encodedSignature, 'base64url');

    if (
      header.alg !== 'HS256' ||
      header.typ !== 'JWT' ||
      typeof payload.sub !== 'string' ||
      !payload.role ||
      !['CUSTOMER', 'ADMIN'].includes(payload.role) ||
      receivedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp <= now) return null;
    if (typeof payload.nbf === 'number' && payload.nbf > now) return null;

    return payload.role;
  } catch {
    return null;
  }
}
