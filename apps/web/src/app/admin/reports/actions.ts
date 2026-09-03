'use server';

import { serverApiFetch } from '@/lib/server-api';

export interface ReportFilters {
  from?: string;
  to?: string;
  serviceId?: string;
  applicationStatus?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function buildQueryString(filters?: ReportFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  if (filters.serviceId && filters.serviceId !== 'ALL') params.append('serviceId', filters.serviceId);
  if (filters.applicationStatus && filters.applicationStatus !== 'ALL') params.append('applicationStatus', filters.applicationStatus);
  if (filters.paymentStatus && filters.paymentStatus !== 'ALL') params.append('paymentStatus', filters.paymentStatus);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  const q = params.toString();
  return q ? `?${q}` : '';
}

export async function getReportSummaryAction(filters?: ReportFilters) {
  try {
    const res = await serverApiFetch(`/admin/reports/summary${buildQueryString(filters)}`);
    if (!res.ok) return { error: 'Failed to fetch report summary' };
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}

export async function getApplicationReportAction(filters?: ReportFilters) {
  try {
    const res = await serverApiFetch(`/admin/reports/applications${buildQueryString(filters)}`);
    if (!res.ok) return { error: 'Failed to fetch application report' };
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}

export async function getServiceReportAction(filters?: ReportFilters) {
  try {
    const res = await serverApiFetch(`/admin/reports/services${buildQueryString(filters)}`);
    if (!res.ok) return { error: 'Failed to fetch service report' };
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}

export async function getCustomerReportAction(filters?: ReportFilters) {
  try {
    const res = await serverApiFetch(`/admin/reports/customers${buildQueryString(filters)}`);
    if (!res.ok) return { error: 'Failed to fetch customer report' };
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}

export async function getDocumentReportAction(filters?: ReportFilters) {
  try {
    const res = await serverApiFetch(`/admin/reports/documents${buildQueryString(filters)}`);
    if (!res.ok) return { error: 'Failed to fetch document report' };
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}

export async function getAppointmentReportAction(filters?: ReportFilters) {
  try {
    const res = await serverApiFetch(`/admin/reports/appointments${buildQueryString(filters)}`);
    if (!res.ok) return { error: 'Failed to fetch appointment report' };
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}

export async function getFinanceReportAction(filters?: ReportFilters) {
  try {
    const res = await serverApiFetch(`/admin/reports/finance${buildQueryString(filters)}`);
    if (!res.ok) return { error: 'Failed to fetch finance report' };
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}
