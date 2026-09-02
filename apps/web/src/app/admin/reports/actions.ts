'use server';

import { fetchInvoicesAction } from '../finance/actions';
import { fetchExpensesAction } from '../expenses/actions';
import { fetchApplicationsAction } from '../applications/actions';
import { fetchAppointmentsAction } from '../appointments/actions';

export async function fetchReportsDataAction() {
  try {
    const [invRes, expRes, appRes, aptRes] = await Promise.all([
      fetchInvoicesAction(),
      fetchExpensesAction(),
      fetchApplicationsAction(),
      fetchAppointmentsAction(),
    ]);

    const invoices = invRes.success ? (invRes.data || []) : [];
    const expenses = expRes.success ? (expRes.data || []) : [];
    const applications = appRes.success ? (appRes.data || []) : [];
    const appointments = aptRes.success ? (aptRes.data || []) : [];

    // 1. Calculate Monthly Revenue & Expenses
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap: Record<string, { revenue: number; expenses: number }> = {};
    months.forEach((m) => {
      monthlyDataMap[m] = { revenue: 0, expenses: 0 };
    });

    // Populate revenue from paid invoices
    invoices.forEach((inv: any) => {
      if (inv.createdAt) {
        const date = new Date(inv.createdAt);
        const monthName = months[date.getMonth()];
        if (monthlyDataMap[monthName]) {
          monthlyDataMap[monthName].revenue += inv.paidAmount || 0;
        }
      }
    });

    // Populate expenses
    expenses.forEach((exp: any) => {
      if (exp.expenseDate) {
        const date = new Date(exp.expenseDate);
        const monthName = months[date.getMonth()];
        if (monthlyDataMap[monthName]) {
          monthlyDataMap[monthName].expenses += Number(exp.amount) || 0;
        }
      }
    });

    // We only return months that have data or default to Jan-Aug to match design
    const revenueMonthly = months.slice(0, 8).map((month) => ({
      month,
      revenue: monthlyDataMap[month].revenue,
      expenses: monthlyDataMap[month].expenses,
    }));

    // 2. Application Status Breakdown
    const appStatusCount: Record<string, number> = {};
    applications.forEach((app: any) => {
      appStatusCount[app.status] = (appStatusCount[app.status] || 0) + 1;
    });

    const colors = ['#12372A', '#3d7a60', '#f4b251', '#e56b6f', '#6c757d'];
    const applicationStatus = Object.keys(appStatusCount).map((status, index) => ({
      name: status,
      value: appStatusCount[status],
      color: colors[index % colors.length],
    }));

    // 3. Top Services
    const serviceMap: Record<string, { applications: number; revenue: number }> = {};
    // Populate from applications
    applications.forEach((app: any) => {
      const name = app.serviceType || 'Technical Onsite Survey';
      if (!serviceMap[name]) serviceMap[name] = { applications: 0, revenue: 0 };
      serviceMap[name].applications += 1;
    });
    // Populate revenue from invoices
    invoices.forEach((inv: any) => {
      const name = inv.service?.name || 'Technical Onsite Survey';
      if (!serviceMap[name]) serviceMap[name] = { applications: 0, revenue: 0 };
      serviceMap[name].revenue += inv.paidAmount || 0;
    });

    const topServices = Object.keys(serviceMap).map((name) => ({
      name,
      applications: serviceMap[name].applications,
      revenue: serviceMap[name].revenue,
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // 4. Appointments Trend
    const weekMap: Record<string, { confirmed: number; pending: number; cancelled: number }> = {
      'W1': { confirmed: 0, pending: 0, cancelled: 0 },
      'W2': { confirmed: 0, pending: 0, cancelled: 0 },
      'W3': { confirmed: 0, pending: 0, cancelled: 0 },
      'W4': { confirmed: 0, pending: 0, cancelled: 0 },
    };

    appointments.forEach((apt: any) => {
      // Group by week of the month (1-4)
      if (apt.date) {
        const day = new Date(apt.date).getDate();
        const weekKey = day <= 7 ? 'W1' : day <= 14 ? 'W2' : day <= 21 ? 'W3' : 'W4';
        const status = apt.status?.toLowerCase();
        if (status === 'confirmed') {
          weekMap[weekKey].confirmed += 1;
        } else if (status === 'pending') {
          weekMap[weekKey].pending += 1;
        } else if (status === 'cancelled') {
          weekMap[weekKey].cancelled += 1;
        }
      }
    });

    const appointmentsTrend = Object.keys(weekMap).map((week) => ({
      week,
      confirmed: weekMap[week].confirmed,
      pending: weekMap[week].pending,
      cancelled: weekMap[week].cancelled,
    }));

    // 5. Expense Breakdown
    const expBreakdownMap: Record<string, number> = {};
    expenses.forEach((exp: any) => {
      const cat = exp.category;
      expBreakdownMap[cat] = (expBreakdownMap[cat] || 0) + Number(exp.amount);
    });

    const expColors = ['#e56b6f', '#3d7a60', '#f4b251', '#355c7d', '#9b59b6'];
    const expenseBreakdown = Object.keys(expBreakdownMap).map((cat, index) => ({
      name: cat.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()),
      value: expBreakdownMap[cat],
      color: expColors[index % expColors.length],
    }));

    return {
      success: true,
      data: {
        revenueMonthly,
        applicationStatus,
        topServices,
        appointmentsTrend,
        expenseBreakdown,
      },
    };
  } catch (error: any) {
    console.error('fetchReportsDataAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
