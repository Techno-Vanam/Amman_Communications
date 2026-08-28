'use server';

import { cookies } from 'next/headers';
import {
  CreateInvoiceInput,
  FinanceSummary,
  InvoiceItem,
  InvoiceQueryResult,
  InvoiceStatus,
  PaymentItem,
  PaymentQueryResult,
  RecordPaymentInput,
  UpdateInvoiceInput,
} from '@/lib/api/finance';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3003';

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchFinanceSummary(from?: string, to?: string): Promise<{ summary?: FinanceSummary; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/summary${qs}`, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return { error: 'Unauthorized access.' };
      return { error: 'Failed to fetch financial summary.' };
    }

    const summary: FinanceSummary = await res.json();
    return { summary };
  } catch (error) {
    console.error('fetchFinanceSummary error:', error);
    return { error: 'Network error or backend unavailable.' };
  }
}

export async function fetchInvoices(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  serviceId?: string;
  from?: string;
  to?: string;
}): Promise<{ data?: InvoiceQueryResult; error?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.customerId) query.set('customerId', params.customerId);
    if (params.serviceId) query.set('serviceId', params.serviceId);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/invoices${qs}`, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return { error: 'Unauthorized access.' };
      return { error: 'Failed to fetch invoices.' };
    }

    const data: InvoiceQueryResult = await res.json();
    return { data };
  } catch (error) {
    console.error('fetchInvoices error:', error);
    return { error: 'Network error or backend unavailable.' };
  }
}

export async function fetchInvoiceById(id: string): Promise<{ invoice?: InvoiceItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/invoices/${id}`, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) return { error: 'Invoice not found.' };
      return { error: 'Failed to fetch invoice details.' };
    }

    const invoice: InvoiceItem = await res.json();
    return { invoice };
  } catch (error) {
    console.error('fetchInvoiceById error:', error);
    return { error: 'Network error or backend unavailable.' };
  }
}

export async function createInvoiceAction(input: CreateInvoiceInput): Promise<{ invoice?: InvoiceItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/invoices`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message || 'Failed to create invoice.' };
    }

    const invoice: InvoiceItem = await res.json();
    return { invoice };
  } catch (error) {
    console.error('createInvoiceAction error:', error);
    return { error: 'Network error or backend unavailable.' };
  }
}

export async function updateInvoiceAction(id: string, input: UpdateInvoiceInput): Promise<{ invoice?: InvoiceItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/invoices/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message || 'Failed to update invoice.' };
    }

    const invoice: InvoiceItem = await res.json();
    return { invoice };
  } catch (error) {
    console.error('updateInvoiceAction error:', error);
    return { error: 'Network error or backend unavailable.' };
  }
}

export async function updateInvoiceStatusAction(id: string, status: InvoiceStatus): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/invoices/${id}/status`, {
      method: 'PATCH',
      headers: await getAuthHeader(),
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message || 'Failed to update invoice status.' };
    }

    return { success: true };
  } catch (error) {
    console.error('updateInvoiceStatusAction error:', error);
    return { error: 'Network error or backend unavailable.' };
  }
}

export async function recordPaymentAction(invoiceId: string, input: RecordPaymentInput): Promise<{ payment?: PaymentItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message || 'Failed to record payment.' };
    }

    const payment: PaymentItem = await res.json();
    return { payment };
  } catch (error) {
    console.error('recordPaymentAction error:', error);
    return { error: 'Network error or backend unavailable.' };
  }
}

export async function fetchPayments(params: {
  page?: number;
  limit?: number;
  search?: string;
  paymentMethod?: string;
  status?: string;
  from?: string;
  to?: string;
}): Promise<{ data?: PaymentQueryResult; error?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.paymentMethod && params.paymentMethod !== 'ALL') query.set('paymentMethod', params.paymentMethod);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/payments${qs}`, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return { error: 'Unauthorized access.' };
      return { error: 'Failed to fetch payments.' };
    }

    const data: PaymentQueryResult = await res.json();
    return { data };
  } catch (error) {
    console.error('fetchPayments error:', error);
    return { error: 'Network error or backend unavailable.' };
  }
}

export async function fetchPaymentById(id: string): Promise<{ payment?: PaymentItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/payments/${id}`, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) return { error: 'Payment record not found.' };
      return { error: 'Failed to fetch payment details.' };
    }

    const payment: PaymentItem = await res.json();
    return { payment };
  } catch (error) {
    console.error('fetchPaymentById error:', error);
    return { error: 'Network error or backend unavailable.' };
  }
}
