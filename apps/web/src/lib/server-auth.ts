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
  return (await cookies()).get('access_token')?.value ?? null;
}

function decodePart(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export async function getAuthenticatedRole(): Promise<UserRole | null> {
  const token = (await cookies()).get('access_token')?.value;
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
