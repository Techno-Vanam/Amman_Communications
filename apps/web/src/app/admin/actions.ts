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

export async function fetchAdminDashboardSummary() {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/summary`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired or Unauthorized. Please sign in as Admin at /login.' };
      }
      return { error: 'Failed to fetch dashboard summary' };
    }

    const json = await res.json();
    return { data: json.data ?? json };
  } catch (err) {
    console.error('fetchAdminDashboardSummary error:', err);
    return { error: 'Backend service starting up or unavailable. Please retry in a moment.' };
  }
}

export async function fetchAdminVerificationQueue() {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/verification-queue`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return { error: 'Failed to fetch verification queue' };
    }

    const json = await res.json();
    return { data: json.data ?? json };
  } catch (err) {
    console.error('fetchAdminVerificationQueue error:', err);
    return { error: 'Backend service starting up or unavailable. Please retry in a moment.' };
  }
}

export async function verifyDocumentStatus(applicationId: string, documentId: string, status: string, rejectionReason?: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/applications/${applicationId}/documents/${documentId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status, rejectionReason }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.message || 'Failed to update document status' };
    }

    return { success: true };
  } catch (err) {
    console.error('verifyDocumentStatus error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}
