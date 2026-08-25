'use server';

import { cookies } from 'next/headers';
import { CreateServiceInput, Service, ServiceStats, UpdateServiceInput } from '@/lib/api/services';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export async function fetchAdminServiceStats(): Promise<{ stats?: ServiceStats; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/services/stats`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired or Unauthorized. Please sign in as Admin at /login.' };
      }
      return { error: 'Failed to fetch service statistics' };
    }
    const stats: ServiceStats = await res.json();
    return { stats };
  } catch (err) {
    console.error('fetchAdminServiceStats error:', err);
    return { error: 'Backend service starting up or unavailable. Please retry in a moment.' };
  }
}

export async function fetchAdminServices(search?: string, status?: string): Promise<{ services?: Service[]; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'ALL') params.set('status', status);

    const url = `${API_BASE_URL}/v1/admin/services?${params.toString()}`;
    const res = await fetch(url, { headers, cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired or Unauthorized. Please sign in as Admin at /login.' };
      }
      return { error: 'Failed to fetch services list' };
    }
    const services: Service[] = await res.json();
    return { services };
  } catch (err) {
    console.error('fetchAdminServices error:', err);
    return { error: 'Backend service starting up or unavailable. Please retry in a moment.' };
  }
}

export async function createAdminService(input: CreateServiceInput): Promise<{ service?: Service; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || 'Failed to create service' };
    }
    return { service: data };
  } catch (err) {
    console.error('createAdminService error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}

export async function updateAdminService(id: string, input: UpdateServiceInput): Promise<{ service?: Service; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/services/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || 'Failed to update service' };
    }
    return { service: data };
  } catch (err) {
    console.error('updateAdminService error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}

export async function updateAdminServiceStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'): Promise<{ service?: Service; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/services/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || 'Failed to update service status' };
    }
    return { service: data };
  } catch (err) {
    console.error('updateAdminServiceStatus error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}

export async function deleteAdminService(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/services/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || 'Failed to delete service' };
    }
    return { success: true };
  } catch (err) {
    console.error('deleteAdminService error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}
