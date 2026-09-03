'use server';

import { cookies } from 'next/headers';
import { getAccessToken } from '@/lib/server-auth';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3003';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Find a matching service ID by name
async function resolveServiceId(name: string): Promise<string | undefined> {
  try {
    const authHeader = await getAuthHeader();
    let res = await fetch(`${API_BASE_URL}/v1/admin/services`, {
      headers: {
        ...authHeader,
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/services`, {
        headers: {
          ...authHeader,
        },
        cache: 'no-store',
      });
    }

    if (res.ok) {
      const data = await res.json();
      // API wraps in { success, data } envelope
      const list = Array.isArray(data) ? data : (data.data ?? data.items ?? []);
      const match = list.find((s: any) => s.name.toLowerCase() === name.toLowerCase());
      if (match) return match.id;
    }
  } catch (e) {
    console.error('resolveServiceId error:', e);
  }
  return undefined;
}

export async function fetchAppointmentsAction(search?: string, status?: string) {
  try {
    const authHeader = await getAuthHeader();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') {
      params.append('status', status.toUpperCase()); // CONFIRMED, PENDING, COMPLETED, CANCELLED, RESCHEDULED
    }

    let res = await fetch(`${API_BASE_URL}/v1/admin/appointments?${params.toString()}`, {
      headers: {
        ...authHeader,
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments?${params.toString()}`, {
        headers: {
          ...authHeader,
        },
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch appointments' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('fetchAppointmentsAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function createAppointmentAction(formData: {
  customerId?: string;
  customer: string;
  email: string;
  phone: string;
  service: string;
  serviceId?: string;
  date: string;
  time: string;
  mode: string;
  onlineType?: string;
  notes?: string;
  status: string;
}) {
  try {
    const authHeader = await getAuthHeader();
    // Use directly provided serviceId, or resolve by name as fallback
    const resolvedServiceId = formData.serviceId || await resolveServiceId(formData.service);

    // Combine date and time to ISO Date string
    const dateTimeStr = `${formData.date}T${formData.time}:00`;
    const appointmentDate = new Date(dateTimeStr).toISOString();

    const isOnline = formData.mode.toLowerCase() === 'online';
    const payload = {
      customerId: formData.customerId || undefined,
      customerName: formData.customer,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      serviceId: resolvedServiceId || undefined,
      appointmentDate,
      mode: isOnline ? 'ONLINE' : 'OFFLINE',
      appointmentType: isOnline ? 'ONLINE_CONSULTATION' : 'OFFICE_VISIT',
      onlineType: isOnline ? formData.onlineType : undefined,
      notes: formData.notes || undefined,
      status: formData.status.toUpperCase(),
    };

    let res = await fetch(`${API_BASE_URL}/v1/admin/appointments`, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments`, {
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
      return { error: errData.message || 'Failed to create appointment' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('createAppointmentAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function fetchCustomersForSelectAction() {
  try {
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/customers?limit=200`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/customers?limit=200`, {
        headers: { ...authHeader },
        cache: 'no-store',
      });
    }

    if (!res.ok) return { error: 'Failed to fetch customers' };

    const data = await res.json();
    const arr = Array.isArray(data) ? data : data.items || [];
    return { success: true, data: arr.map((c: any) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone || '' })) };
  } catch (error: any) {
    return { error: error.message || 'Network error' };
  }
}

export async function fetchServicesForSelectAction() {
  try {
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/services`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/services`, {
        headers: { ...authHeader },
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      return { error: 'Failed to fetch services' };
    }

    const data = await res.json();
    // API wraps responses in { success, data } envelope
    const arr = Array.isArray(data) ? data : (data.data ?? data.items ?? []);
    return { success: true, data: arr.map((s: any) => ({ id: s.id, name: s.name })) };
  } catch (error: any) {
    return { error: error.message || 'Network error' };
  }
}

export async function updateAppointmentAction(
  id: string,
  formData: {
    customer?: string;
    email?: string;
    phone?: string;
    service?: string;
    serviceId?: string;
    date?: string;
    time?: string;
    mode?: string;
    onlineType?: string;
    notes?: string;
    status?: string;
  }
) {
  try {
    const authHeader = await getAuthHeader();
    const payload: any = {};

    if (formData.customer) payload.customerName = formData.customer;
    if (formData.email) payload.customerEmail = formData.email;
    if (formData.phone) payload.customerPhone = formData.phone;
    if (formData.notes !== undefined) payload.notes = formData.notes;
    if (formData.mode) {
      const isOnline = formData.mode.toLowerCase() === 'online';
      payload.mode = isOnline ? 'ONLINE' : 'OFFLINE';
      payload.appointmentType = isOnline ? 'ONLINE_CONSULTATION' : 'OFFICE_VISIT';
      payload.onlineType = isOnline && formData.onlineType ? formData.onlineType : null;
    }
    if (formData.status) payload.status = formData.status.toUpperCase();
    if (formData.service) {
      const serviceId = formData.serviceId || await resolveServiceId(formData.service);
      if (serviceId) payload.serviceId = serviceId;
    }
    if (formData.date && formData.time) {
      const dateTimeStr = `${formData.date}T${formData.time}:00`;
      payload.appointmentDate = new Date(dateTimeStr).toISOString();
    }

    let res = await fetch(`${API_BASE_URL}/v1/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments/${id}`, {
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
      return { error: errData.message || 'Failed to update appointment' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateAppointmentAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateAppointmentStatusAction(id: string, status: string) {
  try {
    const authHeader = await getAuthHeader();
    const payload = { status: status.toUpperCase() };

    let res = await fetch(`${API_BASE_URL}/v1/admin/appointments/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments/${id}/status`, {
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
      return { error: errData.message || 'Failed to update status' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateAppointmentStatusAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function deleteAppointmentAction(id: string) {
  try {
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        ...authHeader,
      },
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          ...authHeader,
        },
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to cancel appointment' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('deleteAppointmentAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function rescheduleAdminAppointmentAction(id: string, dto: { newDate: string; reason?: string }) {
  try {
    const authHeader = await getAuthHeader();
    let res = await fetch(`${API_BASE_URL}/v1/admin/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/appointments/${id}/reschedule`, {
        method: 'PATCH',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to reschedule appointment' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('rescheduleAdminAppointmentAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
