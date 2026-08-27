import { IsEnum, IsOptional } from 'class-validator';

export enum AppointmentStatusFilter {
  ALL = 'ALL',
  UPCOMING = 'UPCOMING',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULED = 'RESCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class GetAppointmentsDto {
  @IsOptional()
  @IsEnum(AppointmentStatusFilter)
  status?: AppointmentStatusFilter;
}
