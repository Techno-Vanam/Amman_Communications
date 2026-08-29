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

export async function fetchInvoicesAction(search?: string, status?: string) {
  try {
    const authHeader = await getAuthHeader();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') {
      // Map UI PaymentStatus to Prisma InvoiceStatus
      const statusMap: Record<string, string> = {
        Paid: 'PAID',
        Partial: 'PARTIALLY_PAID',
        Pending: 'UNPAID',
        Overdue: 'OVERDUE',
        Waived: 'CANCELLED',
      };
      const apiStatus = statusMap[status] || status.toUpperCase();
      params.append('status', apiStatus);
    }
    params.append('limit', '100');

    let res = await fetch(`${API_BASE_URL}/v1/admin/finance/invoices?${params.toString()}`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/invoices?${params.toString()}`, {
        headers: { ...authHeader },
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch invoices' };
    }

    const data = await res.json();
    return { success: true, data: data.items || [] };
  } catch (error: any) {
    console.error('fetchInvoicesAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateInvoiceAction(
  id: string,
  formData: {
    status?: string;
    notes?: string;
    dueDate?: string;
  }
) {
  try {
    const authHeader = await getAuthHeader();

    const statusMap: Record<string, string> = {
      Paid: 'PAID',
      Partial: 'PARTIALLY_PAID',
      Pending: 'UNPAID',
      Overdue: 'OVERDUE',
      Waived: 'CANCELLED',
    };

    const payload: any = {};
    if (formData.status) payload.status = statusMap[formData.status] || formData.status;
    if (formData.notes !== undefined) payload.notes = formData.notes;
    if (formData.dueDate) {
      payload.dueDate = new Date(formData.dueDate).toISOString();
    }

    let res = await fetch(`${API_BASE_URL}/v1/admin/finance/invoices/${id}`, {
      method: 'PATCH',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/finance/invoices/${id}`, {
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
      return { error: errData.message || 'Failed to update invoice' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateInvoiceAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function recordInvoicePaymentAction(
  invoiceId: string,
  amount: number,
  notes?: string
) {
  try {
    const authHeader = await getAuthHeader();

    const payload = {
      amount,
      paymentMethod: 'BANK_TRANSFER', // default
      notes: notes || undefined,
      paidAt: new Date().toISOString(),
    };

    let res = await fetch(
      `${API_BASE_URL}/v1/admin/finance/invoices/${invoiceId}/payments`,
      {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.status === 404) {
      res = await fetch(
        `${API_BASE_URL}/api/v1/admin/finance/invoices/${invoiceId}/payments`,
        {
          method: 'POST',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
    }

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
