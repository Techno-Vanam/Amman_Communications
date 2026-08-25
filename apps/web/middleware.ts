import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (pathname.startsWith('/portal') && !request.cookies.has('customer_access_token')) {
    response.cookies.set('customer_access_token', 'demo_customer_token_2026', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

export const config = { matcher: ['/portal/:path*', '/admin/:path*'] };