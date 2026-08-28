'use server';

import { getAccessToken } from '@/lib/server-auth';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/api\/?$/, '');

async function getAuthHeader() {
  const token = await getAccessToken();
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export async function fetchAdminApplications(search?: string, status?: string) {
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'ALL') params.set('status', status);

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/applications-management?${params.toString()}`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired or Unauthorized. Please sign in as Admin at /login.' };
      }
      return { error: 'Failed to fetch applications list' };
    }

    const json = await res.json();
    return { data: json.data ?? json };
  } catch (err) {
    console.error('fetchAdminApplications error:', err);
    return { error: 'Backend service starting up or unavailable. Please retry in a moment.' };
  }
}

export async function updateAdminApplicationStatus(id: string, status: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/applications-management/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.message || 'Failed to update application status' };
    }

    const json = await res.json();
    return { data: json.data ?? json };
  } catch (err) {
    console.error('updateAdminApplicationStatus error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}
