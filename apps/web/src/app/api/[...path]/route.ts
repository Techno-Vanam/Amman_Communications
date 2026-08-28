import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = resolvedParams.path.join('/');
  const token = request.cookies.get('access_token')?.value;

  console.log(`[API Proxy GET] Path: ${pathStr}, Token length: ${token?.length}`);

  const backendPath = pathStr.startsWith('v1/') ? pathStr : `v1/${pathStr}`;
  const res = await fetch(`${API_BASE}/${backendPath}${request.nextUrl.search}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json',
    },
  });
  
  console.log(`[API Proxy GET] Backend returned status: ${res.status}`);

  const data = await res.text();
  
  const response = new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (res.status === 401) {
    response.cookies.delete('access_token');
  }
  
  return response;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = resolvedParams.path.join('/');
  const token = request.cookies.get('access_token')?.value;
  const body = await request.text();

  const backendPath = pathStr.startsWith('v1/') ? pathStr : `v1/${pathStr}`;
  const res = await fetch(`${API_BASE}/${backendPath}${request.nextUrl.search}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': request.headers.get('content-type') || 'application/json',
    },
    body
  });

  const data = await res.text();
  
  const response = new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (res.status === 401) {
    response.cookies.delete('access_token');
  }
  
  return response;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = resolvedParams.path.join('/');
  const token = request.cookies.get('access_token')?.value;
  const body = await request.text();

  const backendPath = pathStr.startsWith('v1/') ? pathStr : `v1/${pathStr}`;
  const res = await fetch(`${API_BASE}/${backendPath}${request.nextUrl.search}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': request.headers.get('content-type') || 'application/json',
    },
    body
  });

  const data = await res.text();
  
  const response = new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (res.status === 401) {
    response.cookies.delete('access_token');
  }
  
  return response;
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = resolvedParams.path.join('/');
  const token = request.cookies.get('access_token')?.value;

  const backendPath = pathStr.startsWith('v1/') ? pathStr : `v1/${pathStr}`;
  const res = await fetch(`${API_BASE}/${backendPath}${request.nextUrl.search}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json',
    }
  });

  const data = await res.text();
  
  const response = new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (res.status === 401) {
    response.cookies.delete('access_token');
  }
  
  return response;
}
