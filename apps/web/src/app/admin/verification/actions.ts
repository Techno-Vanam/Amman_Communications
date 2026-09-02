'use server';

import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3003';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchVerificationRecordsAction() {
  try {
    const authHeader = await getAuthHeader();

    // 1. Fetch applications
    let res = await fetch(`${API_BASE_URL}/v1/admin/applications?limit=100`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/applications?limit=100`, {
        headers: { ...authHeader },
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch applications' };
    }

    const appData = await res.json();
    const apps = appData.items || [];

    // 2. Fetch documents for each application in parallel
    const allRecordsPromises = apps.map(async (app: any) => {
      try {
        let docRes = await fetch(`${API_BASE_URL}/v1/admin/applications/${app.id}/documents`, {
          headers: { ...authHeader },
          cache: 'no-store',
        });

        if (docRes.status === 404) {
          docRes = await fetch(`${API_BASE_URL}/api/v1/admin/applications/${app.id}/documents`, {
            headers: { ...authHeader },
            cache: 'no-store',
          });
        }

        if (!docRes.ok) return [];

        const docData = await docRes.json();
        const documents = docData.documents || [];

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
          // Capitalize and format nicely if fallback
          if (!DOC_TYPE_MAPPING[doc.documentType]) {
            docType = doc.documentType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
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
    const authHeader = await getAuthHeader();

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

    let res = await fetch(
      `${API_BASE_URL}/v1/admin/applications/${applicationId}/documents/${documentId}/status`,
      {
        method: 'PUT',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.status === 404) {
      res = await fetch(
        `${API_BASE_URL}/api/v1/admin/applications/${applicationId}/documents/${documentId}/status`,
        {
          method: 'PUT',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
    }

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
