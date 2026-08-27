'use server';

import { cookies } from 'next/headers';
import { DocumentItem, UploadDocumentInput } from '@/lib/api/documents';

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

export async function fetchCustomerDocuments(): Promise<{
  documents?: DocumentItem[];
  error?: string;
}> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/customer/documents`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Please log in to view your documents.' };
      }
      return { error: 'Failed to load documents.' };
    }

    const documents: DocumentItem[] = await res.json();
    return { documents };
  } catch (err) {
    console.error('fetchCustomerDocuments error:', err);
    return { error: 'Service temporarily unavailable.' };
  }
}

export async function uploadCustomerDocumentAction(
  input: UploadDocumentInput
): Promise<{ success: boolean; error?: string; document?: DocumentItem }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/customer/documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to upload document.' };
    }

    return { success: true, document: data };
  } catch (err) {
    console.error('uploadCustomerDocumentAction error:', err);
    return { success: false, error: 'Network error during upload.' };
  }
}
