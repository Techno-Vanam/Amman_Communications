'use server';

import { serverFetch } from '@/lib/server-api';

export async function fetchAdminPreferencesAction() {
  try {
    const res = await serverFetch<any>('/admin/settings/preferences');

    if (!res.ok) {
      return { error: res.error || 'Failed to fetch admin preferences' };
    }

    return { success: true, data: res.data };
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
    const res = await serverFetch<any>('/admin/settings/preferences', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to update admin preferences' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('updateAdminPreferencesAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
