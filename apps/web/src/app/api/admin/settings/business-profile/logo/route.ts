import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = await getAuthHeader();
    const formData = await req.formData();

    const res = await fetch(`${API_BASE_URL}/v1/admin/settings/business-profile/logo`, {
      method: 'POST',
      headers: {
        ...authHeader,
      },
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to upload business logo' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const authHeader = await getAuthHeader();

    const res = await fetch(`${API_BASE_URL}/v1/admin/settings/business-profile/logo`, {
      method: 'DELETE',
      headers: {
        ...authHeader,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to remove business logo' }, { status: 500 });
  }
}
