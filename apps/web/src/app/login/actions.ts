'use server';

import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const res = await fetch('http://localhost:3003/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { error: 'Invalid credentials' };
      }
      return { error: 'An error occurred during login. Please try again later.' };
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

    // Return success and where to redirect to let the client handle router.push
    return { success: true, redirectTo: user.role === 'ADMIN' ? '/admin' : '/portal' };

  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'Network error or backend unavailable' };
  }
}
