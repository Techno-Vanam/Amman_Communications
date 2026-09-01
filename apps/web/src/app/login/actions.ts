'use server';

import { cookies } from 'next/headers';

<<<<<<< HEAD
const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3003';
=======
function refreshTokenFromResponse(response: Response) {
  return response.headers.get('set-cookie')?.match(/refresh_token=([^;]+)/)?.[1];
}
>>>>>>> origin/backend-merge

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

    // Set HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      success: true,
      user,
      redirectTo: user.role === 'ADMIN' ? '/admin' : '/portal/dashboard',
    };
  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'Network error or backend unavailable' };
  }
}

<<<<<<< HEAD
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  return { success: true };
=======
  const data = await res.json();
  const { accessToken, user } = data;

  if (!accessToken || !user || !user.role) {
    return { error: 'Invalid response from server' };
  }

  const refreshToken = refreshTokenFromResponse(res);
  if (!refreshToken) return { error: 'Invalid response from server' };

  const cookieStore = await cookies();
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });

  return {
    success: true,
    accessToken,
    user,
    redirectTo: user.role === 'ADMIN' ? '/admin' : '/customer/appointments',
  };
>>>>>>> origin/backend-merge
}
