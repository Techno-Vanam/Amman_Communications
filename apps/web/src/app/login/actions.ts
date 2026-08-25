'use server';

import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const primaryApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003/api/v1';

  // Candidate endpoints for maximum dev server connectivity resilience
  const candidateUrls = [
    `${primaryApiBase}/auth/login`,
    'http://127.0.0.1:3003/api/v1/auth/login',
    'http://localhost:3003/api/v1/auth/login',
    'http://localhost:3003/v1/auth/login',
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
        body: JSON.stringify({ email, password }),
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
    console.error('All login fetch attempts failed. Last error:', lastError);
    return { error: 'Network error or backend unavailable. Please verify API is running on port 3003.' };
  }

  if (!res.ok) {
    if (res.status === 401) {
      return { error: 'Invalid email or password' };
    }
    const errBody = await res.json().catch(() => null);
    const serverMessage = errBody?.message
      ? Array.isArray(errBody.message)
        ? errBody.message.join(', ')
        : String(errBody.message)
      : 'An error occurred during login. Please try again later.';
    return { error: serverMessage };
  }

  const data = await res.json();
  const { accessToken, user } = data;

  if (!accessToken || !user || !user.role) {
    return { error: 'Invalid response from server' };
  }

  // Set access_token cookie
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
    redirectTo: user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/appointments',
  };
}
