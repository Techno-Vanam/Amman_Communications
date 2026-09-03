'use server';

import { serverApiFetch } from '@/lib/server-api';

export async function fetchCustomersAction(search?: string, status?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') {
      params.append('status', status.toUpperCase()); // ACTIVE, INACTIVE, etc.
    }
    params.append('limit', '100');

    const res = await serverApiFetch(`/admin/customers?${params.toString()}`);

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
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password || 'password123', // default if not provided
      status: formData.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
    };

    const res = await serverApiFetch('/admin/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

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
    const payload: any = {};
    if (formData.name) payload.name = formData.name;
    if (formData.email !== undefined) payload.email = formData.email;
    if (formData.phone !== undefined) payload.phone = formData.phone;
    if (formData.status) {
      payload.status = formData.status === 'Active' ? 'ACTIVE' : 'INACTIVE';
    }

    const res = await serverApiFetch(`/admin/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

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
    const res = await serverApiFetch(`/admin/customers/${id}`, {
      method: 'DELETE',
    });

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
