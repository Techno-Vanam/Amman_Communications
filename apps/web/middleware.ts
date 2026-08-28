import { NextResponse } from 'next/server';

export async function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/customer/:path*', '/portal/:path*', '/admin/:path*', '/customer', '/portal', '/admin'],
};