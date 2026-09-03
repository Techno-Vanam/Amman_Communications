'use server';

import { serverApiFetch } from '@/lib/server-api';

const DB_TO_UI_STATUS: Record<string, string> = {
  PENDING: 'Pending Review',
  UPLOADED: 'Pending Review',
  UNDER_REVIEW: 'Pending Review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  ACTION_REQUIRED: 'Needs Correction',
};

const DOC_TYPE_MAPPING: Record<string, string> = {
  COMMERCIAL_REGISTRATION_CERTIFICATE: 'Business Registration',
  AUTHORIZED_SIGNATORY_NATIONAL_ID: 'Identity Proof',
  LEASE_AGREEMENT___PROOF_OF_ADDRESS: 'Address Proof',
  NATIONAL_IDENTIFICATION___PASSPORT: 'Identity Proof',
  UTILITY_BILL__ELECTRICITY_WATER_: 'Address Proof',
  IDENTITY_PROOF: 'Identity Proof',
  DOCUMENT_COPY_FOR_VERIFICATION: 'Utility Bill',
};

export async function fetchVerificationRecordsAction() {
  try {
    const res = await serverApiFetch('/admin/dashboard/verification-queue');

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch verification queue' };
    }

    const documents = await res.json();
    const records = (documents || []).map((doc: any) => {
      let docType = DOC_TYPE_MAPPING[doc.documentType] || doc.documentType;
      if (!DOC_TYPE_MAPPING[doc.documentType]) {
        docType = (doc.documentType || '')
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
      }

      return {
        id: doc.id,
        appId: doc.applicationId,
        customer: doc.customerName || '—',
        docType,
        uploadedDate: doc.uploadedAt ? doc.uploadedAt.split('T')[0] : '',
        status: DB_TO_UI_STATUS[doc.status] || 'Pending Review',
        remarks: doc.rejectionReason || '',
      };
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error('fetchVerificationRecordsAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateVerificationStatusAction(
  applicationId: string,
  documentId: string,
  status: string,
  remarks?: string
) {
  try {
    const UI_TO_DB_STATUS: Record<string, string> = {
      'Pending Review': 'UNDER_REVIEW',
      Verified: 'VERIFIED',
      Rejected: 'REJECTED',
      'Needs Correction': 'ACTION_REQUIRED',
    };

    const payload = {
      status: UI_TO_DB_STATUS[status] || 'UNDER_REVIEW',
      rejectionReason: remarks || undefined,
    };

    const res = await serverApiFetch(
      `/admin/applications/${applicationId}/documents/${documentId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update document status' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateVerificationStatusAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
