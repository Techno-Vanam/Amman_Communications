'use server';

import { cookies } from 'next/headers';
import {
  DocumentItem,
  DocumentStats,
  DocumentVerificationStatus,
  PaginatedDocuments,
} from '@/lib/api/documents';

const API_BASE_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://127.0.0.1:3003';

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export async function fetchAdminDocumentStats(): Promise<{
  stats?: DocumentStats;
  error?: string;
}> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/v1/admin/documents/stats`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired or unauthorized. Please sign in as Admin.' };
      }
      return { error: 'Failed to fetch document statistics.' };
    }

    const stats: DocumentStats = await res.json();
    return { stats };
  } catch (err) {
    console.error('fetchAdminDocumentStats error:', err);
    return { error: 'Backend service unavailable. Please retry in a moment.' };
  }
}

export async function fetchAdminDocuments(
  search?: string,
  status?: string,
  page: number = 1,
  limit: number = 10,
  customerId?: string
): Promise<{ data?: PaginatedDocuments; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'ALL') params.set('status', status);
    if (customerId) params.set('customerId', customerId);
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    const url = `${API_BASE_URL}/v1/admin/documents?${params.toString()}`;
    const res = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Session expired. Please sign in again.' };
      }
      return { error: 'Failed to load documents.' };
    }

    const data: PaginatedDocuments = await res.json();
    return { data };
  } catch (err) {
    console.error('fetchAdminDocuments error:', err);
    return { error: 'Backend service unavailable. Please retry in a moment.' };
  }
}

export async function fetchAdminDocumentById(
  id: string
): Promise<{ document?: DocumentItem; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/v1/admin/documents/${id}`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return { error: 'Failed to fetch document details.' };
    }

    const document: DocumentItem = await res.json();
    return { document };
  } catch (err) {
    console.error('fetchAdminDocumentById error:', err);
    return { error: 'Backend service unavailable.' };
  }
}

export async function verifyDocumentAction(
  id: string,
  status: DocumentVerificationStatus,
  remarks?: string
): Promise<{ success: boolean; error?: string; document?: DocumentItem }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/v1/admin/documents/${id}/verify`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, remarks }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to update document status.' };
    }

    return { success: true, document: data };
  } catch (err) {
    console.error('verifyDocumentAction error:', err);
    return { success: false, error: 'Network error while updating document.' };
  }
}

export async function deleteDocumentAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/v1/admin/documents/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || 'Failed to delete document.' };
    }

    return { success: true };
  } catch (err) {
    console.error('deleteDocumentAction error:', err);
    return { success: false, error: 'Network error while deleting document.' };
  }
}
