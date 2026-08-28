import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentMode, OnlineMeetingType } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({ description: 'New proposed date/time ISO string', example: '2026-09-05T14:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  newDate!: string;

  @ApiPropertyOptional({ description: 'Reason for rescheduling', example: 'Customer requested afternoon slot.' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Updated appointment mode', enum: AppointmentMode, example: AppointmentMode.ONLINE })
  @IsOptional()
  @IsEnum(AppointmentMode)
  mode?: AppointmentMode;

  @ApiPropertyOptional({ description: 'Online meeting channel type', enum: OnlineMeetingType, example: OnlineMeetingType.VIDEO })
  @IsOptional()
  @IsEnum(OnlineMeetingType)
  onlineType?: OnlineMeetingType;

  @ApiPropertyOptional({ description: 'Meeting link if mode is online', example: 'https://meet.google.com/xyz-uvwx-rst' })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiPropertyOptional({ description: 'Updated notes', example: 'Rescheduled per customer email.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
