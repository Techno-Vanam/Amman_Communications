'use server';

import { cookies } from 'next/headers';

const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3003';

export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
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

    const json = await res.json();
    const payload = json.data ?? json;
    const { accessToken, user } = payload;

    if (!accessToken || !user || !user.role) {
      return { error: 'Invalid response from server' };
    }

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set('access_token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    if (user.role === 'CUSTOMER') {
      cookieStore.set('customer_access_token', accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    // Return success and where to redirect to let the client handle router.push
    return {
      success: true,
      redirectTo: user.role === 'ADMIN' ? '/admin/dashboard' : '/portal/dashboard',
      accessToken,
      user,
    };

  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'Network error or backend unavailable' };
  }
}
