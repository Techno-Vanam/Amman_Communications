'use server';

import { serverFetch } from '@/lib/server-api';

export async function fetchVerificationRecordsAction() {
  try {
    // 1. Fetch applications
    const res = await serverFetch<any>('/admin/applications?limit=100');

    if (!res.ok) {
      return { error: res.error || 'Failed to fetch applications' };
    }

    const appData = res.data;
    const apps = appData?.items || appData?.data?.items || [];

    // 2. Fetch documents for each application in parallel
    const allRecordsPromises = apps.map(async (app: any) => {
      try {
        const docRes = await serverFetch<any>(`/admin/applications/${app.id}/documents`);

        if (!docRes.ok) return [];

        const docData = docRes.data;
        const documents = docData?.documents || (Array.isArray(docData) ? docData : []);

        const DB_TO_UI_STATUS: Record<string, string> = {
          PENDING: 'Pending Review',
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

        return documents.map((doc: any) => {
          let docType = DOC_TYPE_MAPPING[doc.documentType] || doc.documentType;
          if (!DOC_TYPE_MAPPING[doc.documentType]) {
            docType = doc.documentType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
          }

          return {
            id: doc.id,
            appId: app.id,
            customer: app.fullName || app.customer?.name || '—',
            docType,
            uploadedDate: doc.uploadedAt ? doc.uploadedAt.split('T')[0] : '',
            status: DB_TO_UI_STATUS[doc.status] || 'Pending Review',
            remarks: doc.rejectionReason || '',
          };
        });
      } catch (e) {
        console.error(`Error fetching docs for application ${app.id}:`, e);
        return [];
      }
    });

    const flatRecords = (await Promise.all(allRecordsPromises)).flat();
    return { success: true, data: flatRecords };
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

    const res = await serverFetch<any>(
      `/admin/applications/${applicationId}/documents/${documentId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      return { error: res.error || 'Failed to update document status' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('updateVerificationStatusAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
