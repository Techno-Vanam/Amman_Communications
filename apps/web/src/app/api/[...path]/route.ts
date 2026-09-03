import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://127.0.0.1:3003'
)
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

function copyAuthCookie(response: NextResponse, backendResponse: Response) {
  const setCookie = backendResponse.headers.get('set-cookie');
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }
}

async function forwardRequest(
  method: string,
  request: NextRequest,
  pathSegments: string[],
  body?: string | FormData
) {
  const rawPath = pathSegments.join('/');
  const cleanPath = rawPath.replace(/^\/?api\/?/, '').replace(/^\/?v1\/?/, '');
  const targetUrl = `${API_BASE}/api/v1/${cleanPath}${request.nextUrl.search}`;

  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');

  const headers: Record<string, string> = {
    ...(authHeader ? { Authorization: authHeader } : {}),
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
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
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/json',
    },
  });
  copyAuthCookie(response, res);
  return response;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return forwardRequest('GET', request, resolvedParams.path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const body = await request.text();
  return forwardRequest('POST', request, resolvedParams.path, body);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const body = await request.text();
  return forwardRequest('PUT', request, resolvedParams.path, body);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const body = await request.text();
  return forwardRequest('PATCH', request, resolvedParams.path, body);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return forwardRequest('DELETE', request, resolvedParams.path);
}
