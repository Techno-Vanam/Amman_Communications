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

export async function fetchBusinessProfileAction() {
  try {
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/settings/business-profile`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/settings/business-profile`, {
        headers: { ...authHeader },
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch business profile' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('fetchBusinessProfileAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateBusinessProfileAction(formData: {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  registrationNumber?: string;
}) {
  try {
    const authHeader = await getAuthHeader();

    // Map UI structure to backend DTO fields
    const payload = {
      businessName: formData.companyName,
      registrationNumber: formData.registrationNumber || undefined,
      officeAddress: formData.address,
      primaryPhone: formData.phone,
      supportEmail: formData.email,
    };

    let res = await fetch(`${API_BASE_URL}/v1/admin/settings/business-profile`, {
      method: 'PATCH',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/settings/business-profile`, {
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
      return { error: errData.message || 'Failed to update business profile' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateBusinessProfileAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function deleteBusinessLogoAction() {
  try {
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/settings/business-profile/logo`, {
      method: 'DELETE',
      headers: { ...authHeader },
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/settings/business-profile/logo`, {
        method: 'DELETE',
        headers: { ...authHeader },
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to delete business logo' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('deleteBusinessLogoAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function uploadBusinessLogoAction(formData: FormData) {
  try {
    const authHeader = await getAuthHeader();

    let res = await fetch(`${API_BASE_URL}/v1/admin/settings/business-profile/logo`, {
      method: 'POST',
      headers: { ...authHeader },
      body: formData,
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/admin/settings/business-profile/logo`, {
        method: 'POST',
        headers: { ...authHeader },
        body: formData,
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to upload business logo' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('uploadBusinessLogoAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
