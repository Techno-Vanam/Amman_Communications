import { AppointmentMode, AppointmentStatus, OnlineMeetingType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @IsOptional()
  @IsEnum(AppointmentMode)
  mode?: AppointmentMode;

  @IsOptional()
  @IsEnum(OnlineMeetingType)
  onlineType?: OnlineMeetingType;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  rescheduledFrom?: string;

  @IsOptional()
  @IsString()
  rescheduleReason?: string;
}
