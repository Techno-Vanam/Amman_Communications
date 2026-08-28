export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type AppointmentMode = 'OFFLINE' | 'ONLINE';
export type OnlineMeetingType = 'PHONE' | 'VIDEO' | 'MEETING';

export interface Appointment {
  id: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId?: string | null;
  appointmentDate: string; // ISO string
  durationMinutes: number;
  mode: AppointmentMode;
  onlineType?: OnlineMeetingType | null;
  meetingLink?: string | null;
  status: AppointmentStatus;
  notes?: string | null;
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
  [key: string]: any; // Catch-all for extra fields used by components
}

export interface AppointmentStats {
  today: number;
  upcoming: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface CreateAppointmentInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId?: string;
  serviceId?: string;
  appointmentDate: string;
  durationMinutes?: number;
  mode: AppointmentMode;
  onlineType?: OnlineMeetingType;
  meetingLink?: string;
  status?: AppointmentStatus;
  notes?: string;
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
export type CustomerProfile = any; export type Office = any; export type ConsultationMode = any; export type Service = any;
