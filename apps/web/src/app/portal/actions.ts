'use server';

import { getAccessToken } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';

const API_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://127.0.0.1:3003'
)
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const cleanPath = endpoint.replace(/^\/?(api\/v1|v1)\/?/, '').replace(/^\/+/, '');
  const url = `${API_BASE_URL}/api/v1/${cleanPath}`;

  try {
    return await fetch(url, { ...options, headers, cache: 'no-store' });
  } catch (_e) {
    const fallbackUrl = url.includes('localhost')
      ? url.replace('localhost', '127.0.0.1')
      : url.replace('127.0.0.1', 'localhost');
    return await fetch(fallbackUrl, { ...options, headers, cache: 'no-store' });
  }
}

export async function fetchAppointmentsAction() {
  try {
    const res = await authenticatedFetch('/customer/appointments');
    if (!res.ok) {
      console.error('Failed to fetch appointments:', res.statusText);
      return [];
    }
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

export async function createAppointmentAction(dto: {
  serviceId: string;
  appointmentType: 'OFFICE_VISIT' | 'ONLINE_CONSULTATION';
  officeId?: string;
  consultationMode?: 'PHONE' | 'VIDEO' | 'WHATSAPP';
  preferredDate: string; // ISO 8601 e.g., YYYY-MM-DD
  preferredTime: string; // HH:mm
  contactNumber: string;
  address?: string;
  notes?: string;
}) {
  try {
    const res = await authenticatedFetch('/customer/appointments', {
      method: 'POST',
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to create appointment' };
    }

    revalidatePath('/portal/appointments');
    return { success: true, appointment: data.data || data };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { error: 'Network error occurred while booking appointment.' };
  }
}

export async function cancelAppointmentAction(appointmentId: string) {
  try {
    const res = await authenticatedFetch(`/customer/appointments/${appointmentId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message || 'Failed to cancel appointment' };
    }

    revalidatePath('/portal/appointments');
    return { success: true };
  } catch (error) {
    console.error('Error canceling appointment:', error);
    return { error: 'Network error occurred while canceling appointment.' };
  }
}

export async function rescheduleAppointmentAction(
  appointmentId: string,
  dto: {
    preferredDate: string;
    preferredTime?: string;
    reason?: string;
  },
) {
  try {
    const res = await authenticatedFetch(`/customer/appointments/${appointmentId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to reschedule appointment' };
    }

    revalidatePath('/portal/appointments');
    return { success: true, appointment: data.data || data };
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return { error: 'Network error occurred while rescheduling appointment.' };
  }
}

export async function fetchServicesAction() {
  try {
    const res = await authenticatedFetch('/customer/services');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function fetchOfficesAction() {
  try {
    const res = await authenticatedFetch('/customer/offices');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching offices:', error);
    return [];
  }
}

export async function fetchProfileAction() {
  try {
    const res = await authenticatedFetch('/customer/profile');
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateProfileAction(dto: {
  name?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  dob?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  occupation?: string;
  altPhone?: string;
  emergencyContact?: string;
  isProfileCompleted?: boolean;
}) {
  try {
    const res = await authenticatedFetch('/customer/profile', {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to update profile' };
    }

    return { success: true, profile: data.data || data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Network error occurred while updating profile.' };
  }
}

export async function changePasswordAction(dto: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) {
  try {
    const res = await authenticatedFetch('/customer/password', {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to change password' };
    }

    return { success: true, message: data.message || 'Password changed successfully' };
  } catch (error) {
    console.error('Error changing password:', error);
    return { error: 'Network error occurred while changing password.' };
  }
}

export async function fetchApplicationsAction() {
  try {
    const res = await authenticatedFetch('/customer/applications');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export async function createApplicationAction(dto: {
  serviceType: string;
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const res = await authenticatedFetch('/customer/applications', {
      method: 'POST',
      body: JSON.stringify(dto),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Failed to create application' };
    }

    revalidatePath('/portal/applications');
    return { success: true, application: data.data || data };
  } catch (error) {
    console.error('Error creating application:', error);
    return { error: 'Network error occurred while submitting application.' };
  }
}

export async function fetchApplicationDocumentsAction(applicationId: string) {
  try {
    const res = await authenticatedFetch(`/customer/applications/${applicationId}/documents`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching application documents:', error);
    return [];
  }
}

export async function fetchDocumentsGroupedAction() {
  try {
    const res = await authenticatedFetch('/customer/documents');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export async function uploadDocumentAction(
  applicationId: string,
  dto: {
    documentType: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    base64Data: string;
  },
) {
  try {
    const cleanBase64 = dto.base64Data.includes(',') ? dto.base64Data.split(',')[1] : dto.base64Data;
    const sanitizedDto = { ...dto, base64Data: cleanBase64 };

    const res = await authenticatedFetch(
      `/customer/applications/${applicationId}/documents/upload`,
      {
        method: 'POST',
        body: JSON.stringify(sanitizedDto),
      },
    );
    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { data = { rawText: text }; }

    console.log('[uploadDocumentAction] status:', res.status, 'body:', JSON.stringify(data).slice(0, 500));

    if (!res.ok) {
      const errMsg = data.message || data.error || text || 'Upload failed';
      console.error('[uploadDocumentAction] ERROR:', errMsg);
      return { error: Array.isArray(errMsg) ? errMsg.join(', ') : errMsg };
    }
    revalidatePath('/portal/documents');
    return { success: true, document: data.data || data };
  } catch (error) {
    console.error('[uploadDocumentAction] Exception:', error);
    return { error: 'Network error occurred while uploading document.' };
  }
}

export async function getDecryptedDocumentAction(storagePath: string) {
  try {
    const res = await authenticatedFetch(
      `/customer/documents/download-stream?path=${encodeURIComponent(storagePath)}`,
    );
    if (!res.ok) {
      return { error: 'Failed to retrieve document from secure storage.' };
    }
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = res.headers.get('content-disposition') || '';
    let fileName = 'document';
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      fileName = match[1];
    }
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return {
      success: true,
      base64,
      mimeType: contentType,
      fileName,
    };
  } catch (error) {
    console.error('Error fetching decrypted document:', error);
    return { error: 'Network error occurred while fetching document.' };
  }
}

export async function deleteDocumentAction(applicationId: string, documentId: string) {
  try {
    const res = await authenticatedFetch(
      `/customer/applications/${applicationId}/documents/${documentId}`,
      { method: 'DELETE' },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message || 'Delete failed' };
    }
    revalidatePath('/portal/documents');
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { error: 'Network error occurred while deleting document.' };
  }
}

// ========================== PAYMENTS ==========================

export async function fetchCustomerPaymentsAction() {
  try {
    const res = await authenticatedFetch('/customer/payments');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

export async function createCustomerPaymentAction(dto: {
  applicationId: string;
  amount: number;
  governmentFee?: number;
  serviceFee?: number;
  paymentMode?: string;
  reference?: string;
}) {
  try {
    const res = await authenticatedFetch('/customer/payments', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || 'Payment recording failed' };
    }
    revalidatePath('/portal/payments');
    return { success: true, ...(data.data || data) };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { error: 'Network error occurred while recording payment.' };
  }
}
