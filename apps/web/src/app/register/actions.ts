'use server';

import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3003';

export async function registerAction(formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required' };
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    return { error: 'Name must be at least 2 characters' };
  }

  if (typeof password !== 'string' || password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: String(email).trim().toLowerCase(),
        password: String(password),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { error: data.message || 'Registration failed. Email might already exist.' };
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
      redirectTo: '/portal/dashboard',
    };
  } catch (error) {
    console.error('Registration action error:', error);
    return { error: 'Network error or backend unavailable' };
  }
}
