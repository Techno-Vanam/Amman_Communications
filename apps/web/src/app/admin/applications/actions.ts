'use server';

import { serverApiFetch } from '@/lib/server-api';

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

    const res = await serverApiFetch(`/admin/applications?${params.toString()}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch applications' };
    }

    const json = await res.json();
    const data = json.data ?? json;
    return { success: true, data: data.items || [] };
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

    const res = await serverApiFetch(`/admin/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: apiStatus, notes }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update status' };
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
    const res = await serverApiFetch('/admin/applications', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to create application' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('createApplicationAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function fetchCustomersForSelectAction() {
  try {
    const res = await serverApiFetch('/admin/customers?limit=200');

    if (!res.ok) return { error: 'Failed to fetch customers' };

    const data = await res.json();
    const arr = Array.isArray(data) ? data : data.items || [];
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
    const res = await serverApiFetch(`/admin/applications/${applicationId}/documents/upload`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to upload document' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('adminUploadDocumentAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function fetchApplicationDocumentsAction(applicationId: string) {
  try {
    const res = await serverApiFetch(`/admin/applications/${applicationId}/documents`);

    if (!res.ok) return { error: 'Failed to fetch documents' };

    const data = await res.json();
    const docs = Array.isArray(data) ? data : data.documents || [];
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

    const res = await serverApiFetch(`/admin/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update application' };
    }

    const resData = await res.json();
    return { success: true, data: resData };
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
    const res = await serverApiFetch(`/admin/applications/${applicationId}/documents/${documentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update document status' };
    }

    const data = await res.json();
    return { success: true, data };
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
