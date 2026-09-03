'use server';

import { revalidatePath } from 'next/cache';
import { fetchInvoicesAction } from './finance/actions';
import { fetchExpensesAction } from './expenses/actions';
import { fetchAppointmentsAction } from './appointments/actions';
import { serverFetch } from '@/lib/server-api';

export async function fetchAdminDashboardStatsAction() {
  try {
    // 1. Fetch Admin Summary
    const summaryRes = await serverFetch<any>('/admin/dashboard/summary');
    const summary = summaryRes.ok ? summaryRes.data : { customers: 0, applications: 0, documents: 0 };

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
    const verifRes = await serverFetch<any>('/admin/dashboard/verification-queue');
    const verificationQueue = verifRes.ok ? verifRes.data : [];
    const pendingVerifications = (Array.isArray(verificationQueue) ? verificationQueue : []).filter((doc: any) => doc.status === 'UPLOADED' || doc.status === 'UNDER_REVIEW').length;

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
    const appRes = await serverFetch<any>('/admin/applications?limit=5');
    const appData = appRes.ok ? appRes.data : { items: [] };
    const recentApplications = (appData?.items || []).map((app: any) => ({
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
          totalClients: summary?.customers || 0,
          totalIncome,
          totalExpense,
          totalProfit: totalIncome - totalExpense,
          totalAppointments: appointments.length,
          pendingVerifications,
          totalApplications: summary?.applications || 0,
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
    const res = await serverFetch<any>('/admin/appointments');
    if (!res.ok) return [];
    return res.data?.data || res.data || [];
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
    const res = await serverFetch<any>(`/admin/appointments/${appointmentId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to reschedule appointment' };
    }

    revalidatePath('/admin/appointments');
    revalidatePath('/portal/appointments');
    return { success: true, appointment: res.data?.data || res.data };
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
    const res = await serverFetch<any>(`/admin/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to update appointment status' };
    }

    revalidatePath('/admin/appointments');
    revalidatePath('/portal/appointments');
    return { success: true, appointment: res.data?.data || res.data };
  } catch (error) {
    console.error('Error updating admin appointment status:', error);
    return { error: 'Network error occurred while updating appointment status.' };
  }
}
