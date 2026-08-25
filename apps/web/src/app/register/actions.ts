'use server';

import { cookies } from 'next/headers';

export async function registerAction(formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required' };
  }

  if (typeof name !== 'string' || name.length < 2) {
    return { error: 'Name must be at least 2 characters' };
  }

  if (typeof password !== 'string' || password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  const primaryApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003/api/v1';

  const candidateUrls = [
    `${primaryApiBase}/auth/register`,
    'http://127.0.0.1:3003/api/v1/auth/register',
    'http://localhost:3003/api/v1/auth/register',
    'http://localhost:3003/v1/auth/register',
  ];

  let res: Response | null = null;
  let lastError: unknown = null;

  for (const url of candidateUrls) {
    try {
      const candidateRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        cache: 'no-store',
      });

      if (candidateRes.status !== 404) {
        res = candidateRes;
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Attempt to fetch ${url} failed:`, err);
    }
  }

  if (!res) {
    console.error('All registration fetch attempts failed. Last error:', lastError);
    return { error: 'Network error or backend unavailable. Please verify API is running on port 3003.' };
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const msg = errorData?.message
      ? Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : String(errorData.message)
      : 'Registration failed. Email might already exist.';
    return { error: msg };
  }

  const data = await res.json();
  const { accessToken, user } = data;

  if (!accessToken || !user || !user.role) {
    return { error: 'Invalid response from server' };
  }

  const cookieStore = await cookies();
  cookieStore.set('access_token', accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });

  return {
    success: true,
    accessToken,
    redirectTo: '/portal/appointments',
  };
}
