'use server';

import { serverApiFetch } from '@/lib/server-api';

export async function fetchBusinessProfileAction() {
  try {
    const res = await serverApiFetch('/admin/settings/business-profile');

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
    const payload = {
      businessName: formData.companyName,
      registrationNumber: formData.registrationNumber || undefined,
      officeAddress: formData.address,
      primaryPhone: formData.phone,
      supportEmail: formData.email,
    };

    const res = await serverApiFetch('/admin/settings/business-profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

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
    const res = await serverApiFetch('/admin/settings/business-profile/logo', {
      method: 'DELETE',
    });

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
    const res = await serverApiFetch('/admin/settings/business-profile/logo', {
      method: 'POST',
      body: formData,
    });

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
