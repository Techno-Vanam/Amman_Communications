'use server';

import { serverFetch } from '@/lib/server-api';

export async function fetchCustomersAction(search?: string, status?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') {
      params.append('status', status.toUpperCase()); // ACTIVE, INACTIVE, etc.
    }
    params.append('limit', '100');

    const res = await serverFetch<any>(`/admin/customers?${params.toString()}`);

    if (!res.ok) {
      return { error: res.error || 'Failed to fetch customers' };
    }

    return { success: true, data: res.data?.items || [] };
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
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password || 'password123',
      status: formData.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
    };

    const res = await serverFetch<any>('/admin/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to create customer' };
    }

    return { success: true, data: res.data };
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
    const payload: any = {};
    if (formData.name) payload.name = formData.name;
    if (formData.email !== undefined) payload.email = formData.email;
    if (formData.phone !== undefined) payload.phone = formData.phone;
    if (formData.status) {
      payload.status = formData.status === 'Active' ? 'ACTIVE' : 'INACTIVE';
    }

    const res = await serverFetch<any>(`/admin/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to update customer' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('updateCustomerAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    const res = await serverFetch<any>(`/admin/customers/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to delete customer' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('deleteCustomerAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
