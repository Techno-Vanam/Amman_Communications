'use server';

import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export async function fetchAdminApplications(search: string, status: string, page: number, limit: number) {
  try {
    const headers = await getAuthHeader();
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) query.append('search', search);
    if (status && status !== 'ALL') query.append('status', status);

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/applications?${query.toString()}`, {
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
    return { error: 'Backend service unavailable. Please retry.' };
  }
}

export async function updateAdminApplicationStatus(applicationId: string, status: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/applications/${applicationId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { error: json.message || 'Failed to update application status' };
    }

    return { success: true };
  } catch (err) {
    console.error('updateAdminApplicationStatus error:', err);
    return { error: 'Backend service unavailable.' };
  }
}
