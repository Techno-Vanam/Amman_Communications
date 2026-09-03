'use server';

import { serverApiFetch } from '@/lib/server-api';

export async function fetchExpensesAction(search?: string, category?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') {
      params.append('category', category);
    }
    params.append('take', '100'); // limit to 100 entries

    const res = await serverApiFetch(`/admin/expenses?${params.toString()}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch expenses' };
    }

    const result = await res.json();
    const mapped = (result.data || []).map((e: any) => ({
      id: e.id,
      category: e.category || 'OTHER',
      amount: Number(e.amount),
      title: e.title || '',
      description: e.description || '',
      date: e.expenseDate ? e.expenseDate.split('T')[0] : '',
      addedBy: e.createdBy?.name || 'Admin',
      paymentMethod: e.paymentMethod || 'OTHER',
      notes: e.notes || '',
    }));

    return { success: true, data: mapped };
  } catch (error: any) {
    console.error('fetchExpensesAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function fetchExpenseStatsAction() {
  try {
    const res = await serverApiFetch('/admin/expenses/stats');

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch expense stats' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('fetchExpenseStatsAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function createExpenseAction(formData: {
  title?: string;
  category?: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod?: string;
  notes?: string;
}) {
  try {
    const payload = {
      title: formData.title || formData.description || 'Expense',
      description: formData.description,
      category: formData.category || 'OTHER',
      amount: formData.amount,
      expenseDate: new Date(formData.date).toISOString(),
      paymentMethod: formData.paymentMethod || 'OTHER',
      notes: formData.notes || '',
    };

    const res = await serverApiFetch('/admin/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to create expense' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('createExpenseAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateExpenseAction(
  id: string,
  formData: {
    category?: string;
    amount?: number;
    description?: string;
    date?: string;
  }
) {
  try {
    const payload: any = {};
    if (formData.description) {
      payload.title = formData.description.slice(0, 100);
      payload.description = formData.description;
    }
    if (formData.category) {
      payload.category = formData.category;
    }
    if (formData.amount !== undefined) payload.amount = formData.amount;
    if (formData.date) payload.expenseDate = new Date(formData.date).toISOString();

    const res = await serverApiFetch(`/admin/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update expense' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateExpenseAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    const res = await serverApiFetch(`/admin/expenses/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to delete expense' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('deleteExpenseAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
