import { AppointmentMode, AppointmentStatus, OnlineMeetingType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  customerEmail!: string;

  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsDateString()
  @IsNotEmpty()
  appointmentDate!: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @IsEnum(AppointmentMode)
  @IsNotEmpty()
  mode!: AppointmentMode;

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
}
