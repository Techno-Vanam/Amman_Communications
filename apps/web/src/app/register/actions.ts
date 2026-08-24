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

  try {
    const res = await fetch('http://localhost:3003/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 400) {
        const errorData = await res.json().catch(() => ({}));
        return { error: errorData.message || 'Registration failed. Email might already exist.' };
      }
      return { error: 'An error occurred during registration. Please try again later.' };
    }

    const data = await res.json();
    const { accessToken, user } = data;

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
      maxAge: 15 * 60, // 15 minutes in seconds
    });

    // Registration automatically logs in and redirects to portal
    return { success: true, redirectTo: '/portal' };

  } catch (error) {
    console.error('Registration action error:', error);
    return { error: 'Network error or backend unavailable' };
  }
}
