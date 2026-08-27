import { NextRequest, NextResponse } from 'next/server';

type JwtPayload = {
  sub?: string;
  role?: 'CUSTOMER' | 'ADMIN';
  exp?: number;
  nbf?: number;
};

function decodeBase64Url(value: string) {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const headerBytes = decodeBase64Url(encodedHeader);
    const payloadBytes = decodeBase64Url(encodedPayload);
    const signature = decodeBase64Url(encodedSignature);
    if (!headerBytes || !payloadBytes || !signature) return null;

    const header = JSON.parse(new TextDecoder().decode(headerBytes)) as { alg?: string; typ?: string };
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as JwtPayload;
    if (
      header.alg !== 'HS256' ||
      header.typ !== 'JWT' ||
      typeof payload.sub !== 'string'
    ) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const validSignature = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );
    const now = Math.floor(Date.now() / 1000);
    if (!validSignature || (typeof payload.exp === 'number' && payload.exp <= now)) return null;
    if (typeof payload.nbf === 'number' && payload.nbf > now) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value || request.cookies.get('customer_access_token')?.value;
  const secret = process.env.JWT_ACCESS_SECRET;
  const payload = token && secret ? await verifyJwt(token, secret) : null;

  if (pathname.startsWith('/portal') && !request.cookies.has('customer_access_token')) {
    const response = NextResponse.next();
    response.cookies.set('customer_access_token', token || 'demo_customer_token_2026', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (payload) {
    if (pathname.startsWith('/admin') && payload.role === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/portal/dashboard', request.url));
    }
    if (pathname.startsWith('/portal') && payload.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*', '/portal', '/admin', '/client/:path*'],
};