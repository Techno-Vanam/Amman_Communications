'use server';

import { cookies } from 'next/headers';
import { fetchInvoicesAction } from './finance/actions';
import { fetchExpensesAction } from './expenses/actions';
import { fetchAppointmentsAction } from './appointments/actions';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3003';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAdminDashboardStatsAction() {
  try {
    const authHeader = await getAuthHeader();

    // 1. Fetch Admin Summary
    let summaryRes = await fetch(`${API_BASE_URL}/v1/admin/dashboard/summary`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (summaryRes.status === 404) {
      summaryRes = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/summary`, {
        headers: { ...authHeader },
        cache: 'no-store',
      });
    }

    const summary = summaryRes.ok ? await summaryRes.json() : { customers: 0, applications: 0, documents: 0 };

    // 2. Fetch Invoices for income
    const invRes = await fetchInvoicesAction();
    const invoices = invRes.success ? (invRes.data || []) : [];
    const totalIncome = invoices.reduce((s: number, inv: any) => s + (inv.paidAmount || 0), 0);
    const pendingPaymentCount = invoices.filter((inv: any) => inv.status === 'UNPAID').length;

    // 3. Fetch Expenses
    const expRes = await fetchExpensesAction();
    const expenses = expRes.success ? (expRes.data || []) : [];
    const totalExpense = expenses.reduce((s: number, exp: any) => s + (Number(exp.amount) || 0), 0);

    // 4. Fetch Appointments
    const aptRes = await fetchAppointmentsAction();
    const appointments = aptRes.success ? (aptRes.data || []) : [];

    // 5. Fetch Verification Queue
    let verifRes = await fetch(`${API_BASE_URL}/v1/admin/dashboard/verification-queue`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (verifRes.status === 404) {
      verifRes = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/verification-queue`, {
        headers: { ...authHeader },
        cache: 'no-store',
      });
    }

    const verificationQueue = verifRes.ok ? await verifRes.json() : [];
    const pendingVerifications = verificationQueue.filter((doc: any) => doc.status === 'UPLOADED' || doc.status === 'UNDER_REVIEW').length;

    // 6. Recent Lists (Last 5)
    // Map recent appointments
    const DB_TO_UI_STATUS: Record<string, string> = {
      CONFIRMED: 'Confirmed',
      PENDING: 'Pending',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      RESCHEDULED: 'Rescheduled',
    };
    const recentAppointments = appointments.slice(0, 5).map((apt: any) => ({
      id: apt.id,
      customer: apt.customerName,
      service: apt.service?.name || 'Technical Onsite Survey',
      date: apt.appointmentDate ? apt.appointmentDate.split('T')[0] : '',
      status: DB_TO_UI_STATUS[apt.status] || 'Confirmed',
    }));

    // Fetch applications list to map recent applications
    let appRes = await fetch(`${API_BASE_URL}/v1/admin/applications?limit=5`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });
    if (appRes.status === 404) {
      appRes = await fetch(`${API_BASE_URL}/api/v1/admin/applications?limit=5`, {
        headers: { ...authHeader },
        cache: 'no-store',
      });
    }
    const appData = appRes.ok ? await appRes.json() : { items: [] };
    const recentApplications = (appData.items || []).map((app: any) => ({
      id: app.id,
      customer: app.fullName || app.customer?.name || '—',
      service: app.serviceType || app.title || 'Support',
      date: app.createdAt ? app.createdAt.split('T')[0] : '',
      status: app.status === 'APPROVED' ? 'Completed' : app.status === 'REJECTED' ? 'Rejected' : 'Under Verification',
    }));

    // Top services pie calculation
    const serviceRevenueMap: Record<string, number> = {};
    invoices.forEach((inv: any) => {
      const name = inv.service?.name || 'Technical Onsite Survey';
      serviceRevenueMap[name] = (serviceRevenueMap[name] || 0) + (inv.paidAmount || 0);
    });
    const pieColors = ['#12372A', '#3d7a60', '#f4b251', '#e56b6f', '#6c757d'];
    const servicesPieData = Object.keys(serviceRevenueMap).map((name, idx) => ({
      name,
      value: totalIncome > 0 ? Math.round((serviceRevenueMap[name] / totalIncome) * 100) : 0,
      color: pieColors[idx % pieColors.length],
    })).filter(item => item.value > 0);

    return {
      success: true,
      data: {
        stats: {
          totalClients: summary.customers || 0,
          totalIncome,
          totalExpense,
          totalProfit: totalIncome - totalExpense,
          totalAppointments: appointments.length,
          pendingVerifications,
          totalApplications: summary.applications || 0,
          pendingPayment: pendingPaymentCount,
        },
        recentAppointments,
        recentApplications,
        servicesPieData,
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
