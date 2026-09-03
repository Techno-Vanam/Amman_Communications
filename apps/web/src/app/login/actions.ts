'use server';

import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://127.0.0.1:3003';

export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        password: String(password),
      }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        return { error: data.message || 'Invalid credentials' };
      }
      return { error: data.message || 'An error occurred during login. Please try again later.' };
    }

    const payload = data.data || data;
    const { accessToken, user } = payload;

    if (!accessToken || !user || !user.role) {
      return { error: 'Invalid response from server' };
    }

    // Extract rotated refresh_token from backend set-cookie header and set HttpOnly cookie
    const setCookieHeader = res.headers.get('set-cookie');
    const refreshTokenMatch = setCookieHeader?.match(/refresh_token=([^;]+)/);
    const cookieStore = await cookies();

    if (refreshTokenMatch?.[1]) {
      cookieStore.set('refresh_token', refreshTokenMatch[1], {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    // Clean up any legacy access_token cookies
    cookieStore.delete('access_token');

    return {
      success: true,
      user,
      accessToken,
      redirectTo: user.role === 'ADMIN' ? '/admin' : '/portal/dashboard',
    };
  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'Network error or backend unavailable' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  try {
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refresh_token=${refreshToken}`,
        },
        cache: 'no-store',
      });
    }
  } catch (e) {
    console.error('Logout request error:', e);
  } finally {
    cookieStore.delete('refresh_token');
    cookieStore.delete('access_token');
  }

  return { success: true };
}
