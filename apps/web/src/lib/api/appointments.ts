import { apiClient } from '../apiClient';

export type AppointmentType = 'OFFICE_VISIT' | 'ONLINE_CONSULTATION';
export type ConsultationMode = 'PHONE' | 'VIDEO' | 'WHATSAPP';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Service {
  id: string;
  name: string;
  description?: string;
  requiredDocuments?: string[];
  governmentFee?: number;
  officeCharge?: number;
  estimatedProcessingTime?: string;
  isActive: boolean;
}

export interface Office {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  address?: string;
  contactNumber?: string;
}

export interface AppointmentDocument {
  id: string;
  appointmentId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AppointmentStatusHistory {
  id: string;
  appointmentId: string;
  status: AppointmentStatus;
  changedBy: string;
  remarks?: string;
  changedAt: string;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  customerId: string;
  serviceId: string;
  service: Service;
  appointmentType: AppointmentType;
  officeId?: string;
  office?: Office;
  consultationMode?: ConsultationMode;
  preferredDate: string;
  preferredTime: string;
  contactNumber: string;
  name: string;
  email?: string;
  address?: string;
  notes?: string;
  status: AppointmentStatus;
  originalDate?: string;
  originalTime?: string;
  rescheduleReason?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  documents?: AppointmentDocument[];
  statusHistory?: AppointmentStatusHistory[];
}

export interface CreateAppointmentPayload {
  serviceId: string;
  appointmentType: AppointmentType;
  officeId?: string;
  consultationMode?: ConsultationMode;
  preferredDate: string;
  preferredTime: string;
  contactNumber: string;
  address?: string;
  notes?: string;
}

export async function fetchCustomerProfile(): Promise<CustomerProfile> {
  return apiClient<CustomerProfile>('/customer/me');
}

export async function fetchServices(): Promise<Service[]> {
  return apiClient<Service[]>('/customer/services');
}

export async function fetchOffices(): Promise<Office[]> {
  return apiClient<Office[]>('/customer/offices');
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  return apiClient<Appointment>('/customer/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestDocumentUploadUrl(
  appointmentId: string,
  data: { documentType: string; fileName: string; mimeType: string; fileSize: number }
): Promise<{ uploadUrl: string; storagePath: string }> {
  return apiClient<{ uploadUrl: string; storagePath: string }>(
    `/customer/appointments/${appointmentId}/documents/upload-url`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function uploadFileToSignedUrl(uploadUrl: string, file: File): Promise<void> {
  // Direct PUT to signed URL (storage bucket)
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to storage bucket (HTTP ${response.status})`);
  }
}

export async function completeDocumentUpload(
  appointmentId: string,
  data: { storagePath: string; fileName: string; fileType: string; fileSize: number }
): Promise<AppointmentDocument> {
  return apiClient<AppointmentDocument>(`/customer/appointments/${appointmentId}/documents`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAppointments(status?: string): Promise<Appointment[]> {
  const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
  return apiClient<Appointment[]>(`/customer/appointments${query}`);
}

export async function fetchAppointmentDetail(id: string): Promise<Appointment> {
  return apiClient<Appointment>(`/customer/appointments/${id}`);
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  return apiClient<Appointment>(`/customer/appointments/${id}`, {
    method: 'DELETE',
  });
}
