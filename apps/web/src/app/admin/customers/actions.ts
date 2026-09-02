'use server';

<<<<<<< HEAD
import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3003';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
=======
import { getAccessToken } from '@/lib/server-auth';
import {
  CreateCustomerInput,
  Customer,
  CustomerStats,
  PaginatedCustomers,
  UpdateCustomerInput,
} from '@/lib/api/customers';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/api\/?$/, '');

async function getAuthHeader() {
  const token = await getAccessToken();
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
>>>>>>> origin/backend-merge
}

export async function fetchCustomersAction(search?: string, status?: string) {
  try {
    const authHeader = await getAuthHeader();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') {
      params.append('status', status.toUpperCase()); // ACTIVE, INACTIVE, etc.
    }
    params.append('limit', '100');

    let res = await fetch(`${API_BASE_URL}/v1/admin/customers?${params.toString()}`, {
      headers: {
        ...authHeader,
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/customers?${params.toString()}`, {
        headers: {
          ...authHeader,
        },
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch customers' };
    }

    const data = await res.json();
    return { success: true, data: data.items || [] };
  } catch (error: any) {
    console.error('fetchCustomersAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function createCustomerAction(formData: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  status: string;
}) {
  try {
    const authHeader = await getAuthHeader();
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password || 'password123', // default if not provided
      status: formData.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
    };

    let res = await fetch(`${API_BASE_URL}/v1/admin/customers`, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/customers`, {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to create customer' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('createCustomerAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateCustomerAction(
  id: string,
  formData: {
    name?: string;
    email?: string;
    phone?: string;
    status?: string;
  }
) {
  try {
    const authHeader = await getAuthHeader();
    const payload: any = {};
    if (formData.name) payload.name = formData.name;
    if (formData.email !== undefined) payload.email = formData.email;
    if (formData.phone !== undefined) payload.phone = formData.phone;
    if (formData.status) {
      payload.status = formData.status === 'Active' ? 'ACTIVE' : 'INACTIVE';
    }

    let res = await fetch(`${API_BASE_URL}/v1/admin/customers/${id}`, {
      method: 'PATCH',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/customers/${id}`, {
        method: 'PATCH',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update customer' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateCustomerAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/customers/${id}`, {
      method: 'DELETE',
      headers: {
        ...authHeader,
      },
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/customers/${id}`, {
        method: 'DELETE',
        headers: {
          ...authHeader,
        },
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to delete customer' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('deleteCustomerAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
