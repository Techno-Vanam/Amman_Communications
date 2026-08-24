import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredCookie = pathname.startsWith('/admin') ? 'admin_access_token' : 'customer_access_token';
  if (!request.cookies.has(requiredCookie) && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL(pathname.startsWith('/admin') ? '/admin/login' : '/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/portal/:path*', '/admin/:path*'] };