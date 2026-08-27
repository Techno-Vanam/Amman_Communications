'use server';

import { cookies } from 'next/headers';
import {
  CreateCustomerInput,
  Customer,
  CustomerStats,
  PaginatedCustomers,
  UpdateCustomerInput,
} from '@/lib/api/customers';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3003';

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export async function fetchAdminCustomerStats(): Promise<{ stats?: CustomerStats; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/customers/stats`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired or Unauthorized. Please sign in as Admin at /login.' };
      }
      return { error: 'Failed to fetch customer statistics' };
    }

    const stats: CustomerStats = await res.json();
    return { stats };
  } catch (err) {
    console.error('fetchAdminCustomerStats error:', err);
    return { error: 'Backend service starting up or unavailable. Please retry in a moment.' };
  }
}

export async function fetchAdminCustomers(
  search?: string,
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data?: PaginatedCustomers; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'ALL') params.set('status', status);
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    const url = `${API_BASE_URL}/v1/admin/customers?${params.toString()}`;
    const res = await fetch(url, { headers, cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired or Unauthorized. Please sign in as Admin at /login.' };
      }
      return { error: 'Failed to fetch customers list' };
    }

    const data: PaginatedCustomers = await res.json();
    return { data };
  } catch (err) {
    console.error('fetchAdminCustomers error:', err);
    return { error: 'Backend service starting up or unavailable. Please retry in a moment.' };
  }
}

export async function fetchAdminCustomerById(id: string): Promise<{ customer?: Customer; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/customers/${id}`, {
      headers,
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || 'Failed to fetch customer details' };
    }

    return { customer: data };
  } catch (err) {
    console.error('fetchAdminCustomerById error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}

export async function createAdminCustomer(input: CreateCustomerInput): Promise<{ customer?: Customer; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || 'Failed to create customer' };
    }

    return { customer: data };
  } catch (err) {
    console.error('createAdminCustomer error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}

export async function updateAdminCustomer(
  id: string,
  input: UpdateCustomerInput
): Promise<{ customer?: Customer; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/customers/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || 'Failed to update customer' };
    }

    return { customer: data };
  } catch (err) {
    console.error('updateAdminCustomer error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}

export async function updateAdminCustomerStatus(
  id: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<{ customer?: Customer; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/customers/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || 'Failed to update customer status' };
    }

    return { customer: data };
  } catch (err) {
    console.error('updateAdminCustomerStatus error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}

export async function deleteAdminCustomer(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/v1/admin/customers/${id}`, {
      method: 'DELETE',
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || 'Failed to delete customer' };
    }

    return { success: true };
  } catch (err) {
    console.error('deleteAdminCustomer error:', err);
    return { error: 'Network error or backend service unavailable' };
  }
}
