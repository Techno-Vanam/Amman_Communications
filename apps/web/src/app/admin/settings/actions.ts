'use server';

import { serverApiFetch } from '@/lib/server-api';

export async function fetchAdminPreferencesAction() {
  try {
    const res = await serverApiFetch('/admin/settings/preferences');

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
    const res = await serverApiFetch('/admin/settings/preferences', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

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
