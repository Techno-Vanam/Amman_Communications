import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/server-auth';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/api\/?$/, '');

function copyAuthCookie(response: NextResponse, backendResponse: Response) {
  const setCookie = backendResponse.headers.get('set-cookie');
  if (setCookie) {
    const normalized = setCookie
      .replace(/Path=[^;]+/gi, 'Path=/')
      .replace(/SameSite=Strict/gi, 'SameSite=Lax');
    response.headers.set('set-cookie', normalized);
  }
}

async function resolveAuthToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader) return authHeader;

  const cookieToken = request.cookies.get('access_token')?.value;
  if (cookieToken) return `Bearer ${cookieToken}`;

  const resolved = await getAccessToken();
  if (resolved) return `Bearer ${resolved}`;

  return null;
}

async function forwardRequest(
  method: string,
  request: NextRequest,
  pathStr: string,
  body?: string | FormData
) {
  const token = await resolveAuthToken(request);
  const backendPath = pathStr.startsWith('v1/') ? pathStr : `v1/${pathStr}`;
  const targetUrl = `${API_BASE}/${backendPath}${request.nextUrl.search}`;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: token } : {}),
    ...(request.headers.get('cookie') ? { Cookie: request.headers.get('cookie')! } : {}),
  };

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = request.headers.get('content-type') || 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      method,
      cache: 'no-store',
      headers,
      ...(body ? { body } : {}),
    });
  } catch {
    const fallbackUrl = targetUrl.includes('localhost')
      ? targetUrl.replace('localhost', '127.0.0.1')
      : targetUrl.replace('127.0.0.1', 'localhost');
    res = await fetch(fallbackUrl, {
      method,
      cache: 'no-store',
      headers,
      ...(body ? { body } : {}),
    });
  }

  const data = await res.text();
  const response = new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
  copyAuthCookie(response, res);
  return response;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return forwardRequest('GET', request, resolvedParams.path.join('/'));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const body = await request.text();
  return forwardRequest('POST', request, resolvedParams.path.join('/'), body);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const body = await request.text();
  return forwardRequest('PUT', request, resolvedParams.path.join('/'), body);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const body = await request.text();
  return forwardRequest('PATCH', request, resolvedParams.path.join('/'), body);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return forwardRequest('DELETE', request, resolvedParams.path.join('/'));
}
