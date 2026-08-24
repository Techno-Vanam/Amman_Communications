import { NextRequest, NextResponse } from 'next/server';

function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes check
  if (pathname === '/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = decodeJwtPayload(token);
  const role = payload?.role; // 'CUSTOMER' or 'ADMIN'

  if (!role) {
    // Invalid or expired token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authorization rules
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  if (pathname.startsWith('/portal') && role !== 'CUSTOMER') {
    // Admin trying to access portal should go to admin, or login if unauthorized
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*', '/portal', '/admin'],
};