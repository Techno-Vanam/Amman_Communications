'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://127.0.0.1:3003';

async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  return res;
}

export async function fetchAdminServicesAction() {
  try {
    const res = await authenticatedFetch('/admin/services');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching admin services:', error);
    return [];
  }
}

export async function createAdminServiceAction(dto: {
  name: string;
  description?: string;
  governmentFee: number;
  serviceFee: number;
  estimatedTime?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  requiredDocuments?: Array<{ name: string; isRequired?: boolean; displayOrder?: number }>;
}) {
  try {
    const res = await authenticatedFetch('/admin/services', {
      method: 'POST',
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to create service' };
    }

    revalidatePath('/admin/services');
    revalidatePath('/portal/book-appointment');
    return { success: true, service: data.data || data };
  } catch (error) {
    console.error('Error creating admin service:', error);
    return { error: 'Network error occurred while creating service.' };
  }
}

export async function updateAdminServiceAction(id: string, dto: {
  name?: string;
  description?: string;
  governmentFee?: number;
  serviceFee?: number;
  estimatedTime?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  requiredDocuments?: Array<{ id?: string; name: string; isRequired?: boolean; displayOrder?: number }>;
}) {
  try {
    const res = await authenticatedFetch(`/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to update service' };
    }

    revalidatePath('/admin/services');
    revalidatePath('/portal/book-appointment');
    return { success: true, service: data.data || data };
  } catch (error) {
    console.error('Error updating admin service:', error);
    return { error: 'Network error occurred while updating service.' };
  }
}

export async function updateAdminServiceStatusAction(id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE') {
  try {
    const res = await authenticatedFetch(`/admin/services/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to update service status' };
    }

    revalidatePath('/admin/services');
    revalidatePath('/portal/book-appointment');
    return { success: true, service: data.data || data };
  } catch (error) {
    console.error('Error updating status:', error);
    return { error: 'Network error occurred while updating status.' };
  }
}

export async function deleteAdminServiceAction(id: string) {
  try {
    const res = await authenticatedFetch(`/admin/services/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to delete service' };
    }

    revalidatePath('/admin/services');
    revalidatePath('/portal/book-appointment');
    return { success: true };
  } catch (error) {
    console.error('Error deleting admin service:', error);
    return { error: 'Network error occurred while deleting service.' };
  }
}

// ========================== APPOINTMENTS ==========================

export async function fetchAdminAppointmentsAction() {
  try {
    const res = await authenticatedFetch('/admin/appointments');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    return [];
  }
}

export async function rescheduleAdminAppointmentAction(
  appointmentId: string,
  dto: {
    newDate: string;
    reason?: string;
    mode?: 'ONLINE' | 'OFFLINE';
    notes?: string;
  },
) {
  try {
    const res = await authenticatedFetch(`/admin/appointments/${appointmentId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to reschedule appointment' };
    }

    revalidatePath('/admin/appointments');
    revalidatePath('/portal/appointments');
    return { success: true, appointment: data.data || data };
  } catch (error) {
    console.error('Error rescheduling admin appointment:', error);
    return { error: 'Network error occurred while rescheduling appointment.' };
  }
}

export async function updateAdminAppointmentStatusAction(
  appointmentId: string,
  status: 'CONFIRMED' | 'PENDING' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED',
) {
  try {
    const res = await authenticatedFetch(`/admin/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to update appointment status' };
    }

    revalidatePath('/admin/appointments');
    revalidatePath('/portal/appointments');
    return { success: true, appointment: data.data || data };
  } catch (error) {
    console.error('Error updating admin appointment status:', error);
    return { error: 'Network error occurred while updating appointment status.' };
  }
}
