'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { fetchInvoicesAction } from './finance/actions';
import { fetchExpensesAction } from './expenses/actions';
import { fetchAppointmentsAction } from './appointments/actions';
import { getAccessToken } from '@/lib/server-auth';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://127.0.0.1:3003';

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = (await getAccessToken()) || (await cookies()).get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const headers = await getAuthHeader();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const prefix = normalizedPath.startsWith('/api') || normalizedPath.startsWith('/v1') ? '' : '/api/v1';
  return fetch(`${API_BASE_URL}${prefix}${normalizedPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });
}

export async function fetchAdminDashboardStatsAction() {
  try {
    const authHeader = await getAuthHeader();

    const statsRes = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/stats`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (statsRes.ok) {
      const data = await statsRes.json();
      return { success: true, data };
    }

    // Fallback if stats endpoint fails
    const summaryRes = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/summary`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });
    const summary = summaryRes.ok ? await summaryRes.json() : { customers: 0, applications: 0, documents: 0 };

    return {
      success: true,
      data: {
        stats: {
          totalClients: summary.customers || 0,
          totalIncome: 0,
          totalExpense: 0,
          totalProfit: 0,
          totalAppointments: 0,
          pendingVerifications: 0,
          totalApplications: summary.applications || 0,
          pendingPayment: 0,
        },
        recentAppointments: [],
        recentApplications: [],
        servicesPieData: [],
      },
    };
  } catch (error: any) {
    console.error('fetchAdminDashboardStatsAction error:', error);
    return { error: error.message || 'Network error' };
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
