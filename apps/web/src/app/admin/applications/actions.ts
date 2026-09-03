'use server';

import { serverFetch } from '@/lib/server-api';

export async function fetchApplicationsAction(search?: string, status?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') {
      const UI_TO_DB_STATUS: Record<string, string> = {
        'Submitted': 'SUBMITTED',
        'Under Verification': 'UNDER_REVIEW',
        'Documents Received': 'DOCUMENTS_RECEIVED',
        'Approved': 'APPROVED',
        'Rejected': 'REJECTED',
        'Pending Payment': 'PENDING_PAYMENT',
        'Completed': 'COMPLETED'
      };
      const apiStatus = UI_TO_DB_STATUS[status] || 'SUBMITTED';
      params.append('status', apiStatus);
    }
    params.append('limit', '100');

    const res = await serverFetch<any>(`/admin/applications?${params.toString()}`);

    if (!res.ok) {
      return { error: res.error || 'Failed to fetch applications' };
    }

    const data = res.data?.data ?? res.data;
    return { success: true, data: data?.items || [] };
  } catch (error: any) {
    console.error('fetchApplicationsAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateApplicationStatusAction(id: string, status: string, notes?: string) {
  try {
    const UI_TO_DB_STATUS: Record<string, string> = {
      'Submitted': 'SUBMITTED',
      'Under Verification': 'UNDER_REVIEW',
      'Documents Received': 'DOCUMENTS_RECEIVED',
      'Approved': 'APPROVED',
      'Rejected': 'REJECTED',
      'Pending Payment': 'PENDING_PAYMENT',
      'Completed': 'COMPLETED'
    };
    const apiStatus = UI_TO_DB_STATUS[status] || status || 'SUBMITTED';

    const res = await serverFetch<any>(`/admin/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: apiStatus, notes }),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to update status' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('updateApplicationStatusAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function createApplicationAction(formData: {
  customerId: string;
  serviceType: string;
  fullName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}) {
  try {
    const res = await serverFetch<any>('/admin/applications', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to create application' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('createApplicationAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function fetchCustomersForSelectAction() {
  try {
    const res = await serverFetch<any>('/admin/customers?limit=200');

    if (!res.ok) return { error: 'Failed to fetch customers' };

    const data = res.data;
    const arr = Array.isArray(data) ? data : data?.items || [];
    return { success: true, data: arr.map((c: any) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone || '' })) };
  } catch (error: any) {
    return { error: error.message || 'Network error' };
  }
}

export async function adminUploadDocumentAction(
  applicationId: string,
  formData: {
    documentType: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    base64Data: string;
  }
) {
  try {
    const res = await serverFetch<any>(`/admin/applications/${applicationId}/documents/upload`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to upload document' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('adminUploadDocumentAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function fetchApplicationDocumentsAction(applicationId: string) {
  try {
    const res = await serverFetch<any>(`/admin/applications/${applicationId}/documents`);

    if (!res.ok) return { error: 'Failed to fetch documents' };

    const data = res.data;
    const docs = Array.isArray(data) ? data : data?.documents || [];
    return { success: true, data: docs };
  } catch (error: any) {
    return { error: error.message || 'Network error' };
  }
}

export async function updateApplicationAction(id: string, data: Partial<any>) {
  try {
    const payload = { ...data };
    if (payload.status) {
      const UI_TO_DB_STATUS: Record<string, string> = {
        'Submitted': 'SUBMITTED',
        'Under Verification': 'UNDER_REVIEW',
        'Documents Received': 'DOCUMENTS_RECEIVED',
        'Approved': 'APPROVED',
        'Rejected': 'REJECTED',
        'Pending Payment': 'PENDING_PAYMENT',
        'Completed': 'COMPLETED'
      };
      payload.status = UI_TO_DB_STATUS[payload.status] || payload.status || 'SUBMITTED';
    }
    if (payload.customer) {
      payload.fullName = payload.customer;
      delete payload.customer;
    }

    const res = await serverFetch<any>(`/admin/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to update application' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('updateApplicationAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateDocumentStatusAction(
  applicationId: string,
  documentId: string,
  status: 'VERIFIED' | 'REJECTED' | 'ACTION_REQUIRED',
  rejectionReason?: string
) {
  try {
    const res = await serverFetch<any>(`/admin/applications/${applicationId}/documents/${documentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason }),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to update document status' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('updateDocumentStatusAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function fetchAdminApplications(search?: string, status?: string) {
  return fetchApplicationsAction(search, status);
}

export async function updateAdminApplicationStatus(id: string, status: string) {
  return updateApplicationStatusAction(id, status);
}
