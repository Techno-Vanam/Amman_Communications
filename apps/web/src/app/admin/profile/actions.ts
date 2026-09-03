'use server';

import { serverFetch } from '@/lib/server-api';

export async function fetchBusinessProfileAction() {
  try {
    const res = await serverFetch<any>('/admin/settings/business-profile');

    if (!res.ok) {
      return { error: res.error || 'Failed to fetch business profile' };
    }

    return { success: true, data: res.data };
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

    const res = await serverFetch<any>('/admin/settings/business-profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to update business profile' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('updateBusinessProfileAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function deleteBusinessLogoAction() {
  try {
    const res = await serverFetch<any>('/admin/settings/business-profile/logo', {
      method: 'DELETE',
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to delete business logo' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('deleteBusinessLogoAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function uploadBusinessLogoAction(formData: FormData) {
  try {
    const res = await serverFetch<any>('/admin/settings/business-profile/logo', {
      method: 'POST',
      body: formData,
      headers: {},
    });

    if (!res.ok) {
      return { error: res.error || 'Failed to upload business logo' };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('uploadBusinessLogoAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
