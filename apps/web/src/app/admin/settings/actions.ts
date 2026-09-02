'use server';

import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAdminPreferencesAction() {
  try {
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/settings/preferences`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/settings/preferences`, {
        headers: { ...authHeader },
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch admin preferences' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('fetchAdminPreferencesAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateAdminPreferencesAction(payload: {
  emailAlerts?: boolean;
  smsAlerts?: boolean;
  whatsappAlerts?: boolean;
  weeklyDigest?: boolean;
  language?: string;
  timezone?: string;
  autoLogout?: string;
}) {
  try {
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/settings/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/settings/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update admin preferences' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateAdminPreferencesAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
