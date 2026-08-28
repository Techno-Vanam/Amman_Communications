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

export async function fetchAdminAppointmentStats() {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments/stats`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired or Unauthorized. Please sign in as Admin at /login.' };
      }
      return { error: 'Failed to fetch appointment statistics' };
    }

    const json = await res.json();
    return { stats: json.data ?? json };
  } catch (err) {
    console.error('fetchAdminAppointmentStats error:', err);
    return { error: 'Backend service starting up or unavailable. Please retry in a moment.' };
  }
}

export async function fetchAdminAppointments(
  search?: string,
  status?: string,
  timeframe?: string
) {
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'ALL') params.set('status', status);
    if (timeframe && timeframe !== 'all') params.set('timeframe', timeframe);

    const url = `${API_BASE_URL}/api/v1/admin/appointments?${params.toString()}`;
    const res = await fetch(url, { headers, cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired or Unauthorized. Please sign in as Admin at /login.' };
      }
      return { error: 'Failed to fetch appointments list' };
    }

    const json = await res.json();
    return { data: json.data ?? json };
  } catch (err) {
    console.error('fetchAdminAppointments error:', err);
    return { error: 'Backend service starting up or unavailable. Please retry in a moment.' };
  }
}

export async function updateAdminAppointmentStatus(
  id: string,
  status: string
) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { error: json.message || 'Failed to update appointment status' };
    }

    return { appointment: json.data ?? json };
  } catch (err) {
    console.error('updateAdminAppointmentStatus error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}

export async function rescheduleAdminAppointment(
  id: string,
  preferredDate: string,
  preferredTime: string,
  notes?: string
) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ preferredDate, preferredTime, notes }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { error: json.message || 'Failed to reschedule appointment' };
    }

    return { appointment: json.data ?? json };
  } catch (err) {
    console.error('rescheduleAdminAppointment error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}

export async function deleteAdminAppointment(id: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments/${id}`, {
      method: 'DELETE',
      headers,
    });

    const json = await res.json();
    if (!res.ok) {
      return { error: json.message || 'Failed to delete appointment' };
    }

    return { success: true };
  } catch (err) {
    console.error('deleteAdminAppointment error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}
