'use server';

import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3003';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const authHeader = await getAuthHeader();
  let res = await fetch(`${API_BASE_URL}/v1${path}`, {
    ...options,
    headers: { ...authHeader, ...(options.headers as Record<string, string> ?? {}) },
    cache: 'no-store',
  });
  if (res.status === 404) {
    res = await fetch(`${API_BASE_URL}/api/v1${path}`, {
      ...options,
      headers: { ...authHeader, ...(options.headers as Record<string, string> ?? {}) },
      cache: 'no-store',
    });
  }
  return res;
}

// ── Status maps ─────────────────────────────────────────────────
const UI_TO_DB_STATUS: Record<string, string> = {
  Paid: 'PAID',
  Partial: 'PARTIALLY_PAID',
  Pending: 'UNPAID',
  Overdue: 'OVERDUE',
  Waived: 'CANCELLED',
};

const DB_TO_UI_STATUS: Record<string, string> = {
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partial',
  UNPAID: 'Pending',
  OVERDUE: 'Overdue',
  CANCELLED: 'Waived',
};

// ── Fetch all invoices ──────────────────────────────────────────
export async function fetchInvoicesAction(search?: string, status?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') {
      params.append('status', UI_TO_DB_STATUS[status] || status.toUpperCase());
    }
    params.append('limit', '100');

    const res = await apiFetch(`/admin/finance/invoices?${params.toString()}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch invoices' };
    }

    const data = await res.json();
    const items = data.items || data.data || [];

    const mapped = items.map((inv: any) => ({
      // IDs
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || inv.id,
      appId: inv.applicationId || '—',
      // Customer
      customerId: inv.customerId,
      customer: inv.customer?.name || '—',
      email: inv.customer?.email || '—',
      phone: inv.customer?.phone || '—',
      // Service
      serviceType: inv.service?.name || '—',
      // Fees breakdown
      governmentFee: inv.governmentFee ?? 0,
      serviceFee: inv.serviceFee ?? 0,
      totalCost: inv.totalAmount ?? 0,
      // Payment tracking
      paidAmount: inv.paidAmount ?? 0,
      outstandingAmount: inv.outstandingAmount ?? (inv.totalAmount - (inv.paidAmount ?? 0)),
      paymentsCount: inv.paymentsCount ?? 0,
      // Dates
      dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
      createdAt: inv.createdAt || '',
      // Status & notes
      status: DB_TO_UI_STATUS[inv.status] || 'Pending',
      notes: inv.notes || '',
    }));

    return { success: true, data: mapped };
  } catch (error: any) {
    console.error('fetchInvoicesAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

// ── Fetch single invoice with full payment history ──────────────
export async function fetchInvoiceDetailAction(invoiceId: string) {
  try {
    const res = await apiFetch(`/admin/finance/invoices/${invoiceId}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch invoice detail' };
    }

    const inv = await res.json();
    return {
      success: true,
      data: {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        appId: inv.applicationId || '—',
        customer: inv.customer?.name || '—',
        email: inv.customer?.email || '—',
        phone: inv.customer?.phone || '—',
        serviceType: inv.service?.name || '—',
        governmentFee: inv.governmentFee ?? 0,
        serviceFee: inv.serviceFee ?? 0,
        totalCost: inv.totalAmount ?? 0,
        paidAmount: inv.paidAmount ?? 0,
        outstandingAmount: inv.outstandingAmount ?? 0,
        dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
        createdAt: inv.createdAt || '',
        status: DB_TO_UI_STATUS[inv.status] || 'Pending',
        notes: inv.notes || '',
        payments: (inv.payments || []).map((p: any) => ({
          id: p.id,
          paymentNumber: p.paymentNumber || '',
          amount: p.amount ?? 0,
          paymentMethod: p.paymentMethod || '—',
          reference: p.reference || '',
          notes: p.notes || '',
          paidAt: p.paidAt || p.createdAt || '',
          status: p.status || '',
        })),
      },
    };
  } catch (error: any) {
    console.error('fetchInvoiceDetailAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

// ── Fetch finance summary ───────────────────────────────────────
export async function fetchFinanceSummaryAction() {
  try {
    const res = await apiFetch('/admin/finance/summary');
    if (!res.ok) return { error: 'Failed to fetch summary' };
    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    return { error: error.message || 'Network error' };
  }
}

// ── Update invoice (status, notes, dueDate, fees) ──────────────
export async function updateInvoiceAction(
  id: string,
  formData: {
    status?: string;
    notes?: string;
    dueDate?: string;
    governmentFee?: number;
    serviceFee?: number;
  }
) {
  try {
    const payload: any = {};
    if (formData.status) payload.status = UI_TO_DB_STATUS[formData.status] || formData.status;
    if (formData.notes !== undefined) payload.notes = formData.notes;
    if (formData.dueDate) payload.dueDate = new Date(formData.dueDate).toISOString();
    if (formData.governmentFee !== undefined) payload.governmentFee = formData.governmentFee;
    if (formData.serviceFee !== undefined) payload.serviceFee = formData.serviceFee;

    const res = await apiFetch(`/admin/finance/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update invoice' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateInvoiceAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

// ── Record a payment against an invoice ────────────────────────
export async function recordInvoicePaymentAction(
  invoiceId: string,
  amount: number,
  paymentMethod: string = 'BANK_TRANSFER',
  reference?: string,
  notes?: string,
) {
  try {
    const payload: any = {
      amount,
      paymentMethod,
      paidAt: new Date().toISOString(),
    };
    if (reference) payload.reference = reference;
    if (notes) payload.notes = notes;

    const res = await apiFetch(`/admin/finance/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to record payment' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('recordInvoicePaymentAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
