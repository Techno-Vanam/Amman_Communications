'use server';

import { serverFetch } from '@/lib/server-api';

const UI_TO_DB_CATEGORY: Record<string, string> = {
  Infrastructure: 'PROPERTY',
  Operations: 'OFFICE',
  Salaries: 'EMPLOYEE',
  Marketing: 'MARKETING',
  Utilities: 'UTILITIES',
  Equipment: 'EQUIPMENT',
  Maintenance: 'TRAVEL',
  Miscellaneous: 'OTHER',
};

const DB_TO_UI_CATEGORY: Record<string, string> = {
  PROPERTY: 'Infrastructure',
  OFFICE: 'Operations',
  EMPLOYEE: 'Salaries',
  MARKETING: 'Marketing',
  UTILITIES: 'Utilities',
  EQUIPMENT: 'Equipment',
  TRAVEL: 'Maintenance',
  OTHER: 'Miscellaneous',
};

export async function fetchExpensesAction(search?: string, category?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') {
      const dbCat = UI_TO_DB_CATEGORY[category] || category;
      params.append('category', dbCat);
    }
    params.append('take', '100');

    const res = await serverFetch<any>(`/admin/expenses?${params.toString()}`);

    if (!res.ok) {
      return { error: res.error || 'Failed to fetch expenses' };
    }

    const result = res.data;
    const mapped = (result?.data || []).map((e: any) => ({
      id: e.id,
      category: DB_TO_UI_CATEGORY[e.category] || e.category || 'Miscellaneous',
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
    const res = await serverFetch<any>('/admin/expenses/stats');

    if (!res.ok) {
      return { error: res.error || 'Failed to fetch expense stats' };
    }

    return { success: true, data: res.data };
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
    const dbCategory = (formData.category && UI_TO_DB_CATEGORY[formData.category])
      ? UI_TO_DB_CATEGORY[formData.category]
      : (formData.category || 'OTHER');

    const payload = {
      title: formData.title || formData.description || 'Expense',
      description: formData.description,
      category: dbCategory,
      amount: formData.amount,
      expenseDate: new Date(formData.date).toISOString(),
      paymentMethod: formData.paymentMethod || 'OTHER',
      notes: formData.notes || '',
    };

    const res = await serverFetch<any>('/admin/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to create expense' };
    }

    return { success: true, data: res.data };
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
      payload.category = UI_TO_DB_CATEGORY[formData.category] || formData.category;
    }
    if (formData.amount !== undefined) payload.amount = formData.amount;
    if (formData.date) payload.expenseDate = new Date(formData.date).toISOString();

    const res = await serverFetch<any>(`/admin/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to update expense' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('updateExpenseAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    const res = await serverFetch<any>(`/admin/expenses/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to delete expense' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('deleteExpenseAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
