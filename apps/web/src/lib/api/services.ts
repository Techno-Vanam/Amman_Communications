export type ServiceStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export interface RequiredDocument {
  id?: string;
  serviceId?: string;
  name: string;
  displayOrder: number;
  isRequired: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  governmentFee: number;
  serviceFee: number;
  totalFee: number;
  estimatedTime?: string | null;
  status: ServiceStatus;
  requiredDocuments: RequiredDocument[];
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  governmentFee: number;
  serviceFee: number;
  estimatedTime?: string;
  status?: ServiceStatus;
  requiredDocuments?: {
    name: string;
    displayOrder?: number;
    isRequired?: boolean;
  }[];
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  governmentFee?: number;
  serviceFee?: number;
  estimatedTime?: string;
  status?: ServiceStatus;
  requiredDocuments?: {
    id?: string;
    name: string;
    displayOrder?: number;
    isRequired?: boolean;
  }[];
}

export async function fetchPublicServices(): Promise<Service[] | null> {
  try {
    const baseUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3003';
    const res = await fetch(`${baseUrl}/v1/admin/services?status=ACTIVE`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const fetchServices = fetchPublicServices;
