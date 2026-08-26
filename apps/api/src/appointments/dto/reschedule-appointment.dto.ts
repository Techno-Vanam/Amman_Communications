import { AppointmentMode, OnlineMeetingType } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsDateString()
  @IsNotEmpty()
  newDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;

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
  @IsString()
  notes?: string;
}
