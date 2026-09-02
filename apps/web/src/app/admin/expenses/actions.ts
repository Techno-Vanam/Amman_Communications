'use server';

import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3003';

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

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchExpensesAction(search?: string, category?: string) {
  try {
    const authHeader = await getAuthHeader();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') {
      params.append('category', category);
    }
    params.append('take', '100'); // limit to 100 entries

    let res = await fetch(`${API_BASE_URL}/v1/admin/expenses?${params.toString()}`, {
      headers: {
        ...authHeader,
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/expenses?${params.toString()}`, {
        headers: {
          ...authHeader,
        },
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch expenses' };
    }

    const result = await res.json();
    const mapped = (result.data || []).map((e: any) => ({
      id: e.id,
      category: e.category || 'Miscellaneous',
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
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/expenses/stats`, {
      headers: {
        ...authHeader,
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/expenses/stats`, {
        headers: {
          ...authHeader,
        },
        cache: 'no-store',
      });
    }

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
    const authHeader = await getAuthHeader();
    const payload = {
      title: formData.title || formData.description || 'Expense',
      description: formData.description,
      category: formData.category || 'Miscellaneous',
      amount: formData.amount,
      expenseDate: new Date(formData.date).toISOString(),
      paymentMethod: formData.paymentMethod || 'OTHER',
      notes: formData.notes || '',
    };

    let res = await fetch(`${API_BASE_URL}/v1/admin/expenses`, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/expenses`, {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

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
    const authHeader = await getAuthHeader();
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

    let res = await fetch(`${API_BASE_URL}/v1/admin/expenses/${id}`, {
      method: 'PATCH',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/expenses/${id}`, {
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
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        ...authHeader,
      },
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          ...authHeader,
        },
      });
    }

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
