import { apiClient } from '../apiClient';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type AppointmentMode = 'OFFLINE' | 'ONLINE';
export type AppointmentType = 'OFFICE_VISIT' | 'ONLINE_CONSULTATION';
export type ConsultationMode = 'PHONE' | 'VIDEO' | 'WHATSAPP';
export type OnlineMeetingType = 'PHONE' | 'VIDEO' | 'MEETING';

export interface Office {
  id: string;
  name: string;
  address: string;
  isActive?: boolean;
}

export interface CustomerProfile {
  id?: string;
  name?: string;
  email?: string;
  contactNumber?: string;
  phone?: string;
  address?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  governmentFee?: number | string;
  serviceFee?: number | string;
  totalFee?: number | string;
  estimatedTime?: string | null;
  estimatedProcessingTime?: string | null;
  status?: string;
  requiredDocuments?: Array<{
    id?: string;
    name: string;
    isRequired?: boolean;
    displayOrder?: number;
  }>;
}

export interface AppointmentDocument {
  id: string;
  appointmentId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface AppointmentStatusHistory {
  id?: string;
  status: string;
  changedAt: string;
  remarks?: string | null;
  changedBy?: string | null;
}

export interface Appointment {
  id: string;
  appointmentNumber?: string | null;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId?: string | null;
  appointmentDate: string; // ISO string
  preferredDate?: string | null;
  preferredTime?: string | null;
  durationMinutes: number;
  mode: AppointmentMode;
  appointmentType?: AppointmentType;
  consultationMode?: ConsultationMode | null;
  onlineType?: OnlineMeetingType | null;
  meetingLink?: string | null;
  status: AppointmentStatus;
  notes?: string | null;
  adminNote?: string | null;
  originalDate?: string | null;
  originalTime?: string | null;
  rescheduledFrom?: string | null;
  rescheduleReason?: string | null;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    name: string;
    totalFee: number | string;
    estimatedTime?: string | null;
  } | null;
  customer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  office?: Office | null;
  documents?: AppointmentDocument[];
  statusHistory?: AppointmentStatusHistory[];
}

export interface AppointmentStats {
  today: number;
  upcoming: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  pending?: number;
  total: number;
}

export interface CreateAppointmentInput {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: string;
  serviceId?: string;
  appointmentDate?: string;
  preferredDate?: string;
  preferredTime?: string;
  durationMinutes?: number;
  mode?: AppointmentMode;
  appointmentType?: AppointmentType;
  consultationMode?: ConsultationMode;
  onlineType?: OnlineMeetingType;
  meetingLink?: string;
  status?: AppointmentStatus;
  notes?: string;
  contactNumber?: string;
  officeId?: string;
  address?: string;
}

export interface UpdateAppointmentInput {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: string;
  serviceId?: string;
  appointmentDate?: string;
  durationMinutes?: number;
  mode?: AppointmentMode;
  onlineType?: OnlineMeetingType;
  meetingLink?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface RescheduleAppointmentInput {
  newDate: string;
  reason?: string;
  mode?: AppointmentMode;
  onlineType?: OnlineMeetingType;
  meetingLink?: string;
  notes?: string;
}

export async function fetchServices(): Promise<Service[]> {
  try {
    const data = await apiClient<Service[]>('/api/v1/customer/services');
    return data || [];
  } catch {
    return [];
  }
}

export async function fetchOffices(): Promise<Office[]> {
  try {
    const data = await apiClient<Office[]>('/api/v1/customer/offices');
    return data || [];
  } catch {
    return [];
  }
}

export async function fetchCustomerProfile(): Promise<CustomerProfile | null> {
  try {
    const data = await apiClient<CustomerProfile>('/api/v1/customer/profile');
    return data || null;
  } catch {
    return null;
  }
}

export async function fetchAppointments(status?: string): Promise<Appointment[]> {
  try {
    const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    const data = await apiClient<Appointment[]>(`/api/v1/customer/appointments${query}`);
    return data || [];
  } catch {
    return [];
  }
}

export async function cancelAppointment(id: string): Promise<{ success: boolean; message?: string }> {
  return apiClient<{ success: boolean; message?: string }>(`/api/v1/customer/appointments/${id}`, {
    method: 'DELETE',
  });
}

export async function createAppointment(payload: CreateAppointmentInput): Promise<Appointment> {
  return apiClient<Appointment>('/api/v1/customer/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestDocumentUploadUrl(
  appointmentId: string,
  payload: { documentType: string; fileName: string; fileSize?: number; mimeType?: string }
): Promise<{ uploadUrl: string; storagePath: string }> {
  return apiClient<{ uploadUrl: string; storagePath: string }>(
    `/api/v1/customer/appointments/${appointmentId}/documents/upload-url`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function uploadFileToSignedUrl(uploadUrl: string, file: File): Promise<void> {
  // Check if mock or standard PUT
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  }).catch(() => undefined);
}

export async function completeDocumentUpload(
  appointmentId: string,
  payload: {
    documentType?: string;
    fileName: string;
    fileUrl?: string;
    storagePath?: string;
    fileType?: string;
    fileSize?: number;
  }
): Promise<AppointmentDocument> {
  return apiClient<AppointmentDocument>(
    `/api/v1/customer/appointments/${appointmentId}/documents`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}
