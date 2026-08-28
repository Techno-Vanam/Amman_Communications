import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/api\/?$/, '');

function copyAuthCookie(response: NextResponse, backendResponse: Response) {
  const setCookie = backendResponse.headers.get('set-cookie');
  if (setCookie) {
    response.headers.set('set-cookie', setCookie.replace(/Path=\/v1\/auth/gi, 'Path=/api/v1/auth'));
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = resolvedParams.path.join('/');
  const token = request.headers.get('authorization');

  console.log(`[API Proxy GET] Path: ${pathStr}, Token length: ${token?.length}`);

  const backendPath = pathStr.startsWith('v1/') ? pathStr : `v1/${pathStr}`;
  const res = await fetch(`${API_BASE}/${backendPath}${request.nextUrl.search}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      ...(token ? { Authorization: token } : {}),
      ...(request.headers.get('cookie') ? { Cookie: request.headers.get('cookie')! } : {}),
      'Content-Type': 'application/json',
    },
  });
  
  console.log(`[API Proxy GET] Backend returned status: ${res.status}`);

  const data = await res.text();
  
  const response = new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
  copyAuthCookie(response, res);
  
  return response;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = resolvedParams.path.join('/');
  const token = request.headers.get('authorization');
  const body = await request.text();

  const backendPath = pathStr.startsWith('v1/') ? pathStr : `v1/${pathStr}`;
  const res = await fetch(`${API_BASE}/${backendPath}${request.nextUrl.search}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: token } : {}),
      ...(request.headers.get('cookie') ? { Cookie: request.headers.get('cookie')! } : {}),
      'Content-Type': request.headers.get('content-type') || 'application/json',
    },
    body
  });

  const data = await res.text();
  
  const response = new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
  copyAuthCookie(response, res);
  
  return response;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = resolvedParams.path.join('/');
  const token = request.headers.get('authorization');
  const body = await request.text();

  const backendPath = pathStr.startsWith('v1/') ? pathStr : `v1/${pathStr}`;
  const res = await fetch(`${API_BASE}/${backendPath}${request.nextUrl.search}`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: token } : {}),
      ...(request.headers.get('cookie') ? { Cookie: request.headers.get('cookie')! } : {}),
      'Content-Type': request.headers.get('content-type') || 'application/json',
    },
    body
  });

  const data = await res.text();
  
  const response = new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response;
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = resolvedParams.path.join('/');
  const token = request.headers.get('authorization');

  const backendPath = pathStr.startsWith('v1/') ? pathStr : `v1/${pathStr}`;
  const res = await fetch(`${API_BASE}/${backendPath}${request.nextUrl.search}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: token } : {}),
      ...(request.headers.get('cookie') ? { Cookie: request.headers.get('cookie')! } : {}),
      'Content-Type': 'application/json',
    }
  });

  const data = await res.text();
  
  const response = new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response;
}
