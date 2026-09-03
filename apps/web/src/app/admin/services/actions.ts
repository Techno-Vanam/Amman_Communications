'use server';

import { serverApiFetch } from '@/lib/server-api';

export async function fetchServicesAction(search?: string, status?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') {
      params.append('status', status.toUpperCase()); // ACTIVE, INACTIVE, DRAFT
    }

    const res = await serverApiFetch(`/admin/services?${params.toString()}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to fetch services' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('fetchServicesAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function createServiceAction(formData: {
  name: string;
  category: string;
  description?: string;
  govtFee: number;
  officeCharge: number;
  estDays: number;
  status: string;
  requiredDocs: { name: string }[];
}) {
  try {
    const fullDescription = `[${formData.category}] ${formData.description || ''}`;

    const payload = {
      name: formData.name,
      description: fullDescription,
      governmentFee: formData.govtFee,
      serviceFee: formData.officeCharge,
      estimatedTime: `${formData.estDays} working days`,
      status: formData.status.toUpperCase(), // ACTIVE, INACTIVE, DRAFT
      requiredDocuments: formData.requiredDocs.map((d, index) => ({
        name: d.name,
        displayOrder: index + 1,
        isRequired: true,
      })),
    };

    const res = await serverApiFetch('/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to create service' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('createServiceAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateServiceAction(
  id: string,
  formData: {
    name?: string;
    category?: string;
    description?: string;
    govtFee?: number;
    officeCharge?: number;
    estDays?: number;
    status?: string;
    requiredDocs?: { name: string }[];
  }
) {
  try {
    const payload: any = {};

    if (formData.name !== undefined) payload.name = formData.name;
    if (formData.category !== undefined || formData.description !== undefined) {
      const cat = formData.category || 'Support';
      const desc = formData.description || '';
      payload.description = `[${cat}] ${desc}`;
    }
    if (formData.govtFee !== undefined) payload.governmentFee = formData.govtFee;
    if (formData.officeCharge !== undefined) payload.serviceFee = formData.officeCharge;
    if (formData.estDays !== undefined) payload.estimatedTime = `${formData.estDays} working days`;
    if (formData.status !== undefined) payload.status = formData.status.toUpperCase();
    if (formData.requiredDocs !== undefined) {
      payload.requiredDocuments = formData.requiredDocs.map((d, index) => ({
        name: d.name,
        displayOrder: index + 1,
        isRequired: true,
      }));
    }

    const res = await serverApiFetch(`/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update service' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateServiceAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function updateServiceStatusAction(id: string, status: string) {
  try {
    const payload = { status: status.toUpperCase() };

    const res = await serverApiFetch(`/admin/services/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to update service status' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('updateServiceStatusAction error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    const res = await serverApiFetch(`/admin/services/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || 'Failed to delete service' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('deleteServiceAction error:', error);
    return { error: error.message || 'Network error' };
  }
}
