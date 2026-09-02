import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentMode, AppointmentStatus, AppointmentType, OnlineMeetingType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Full name of the customer', example: 'Test Customer' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({ description: 'Customer email address', example: 'customer@test.com' })
  @IsString()
  @IsNotEmpty()
  customerEmail!: string;

  @ApiProperty({ description: 'Customer contact phone number', example: '+91 9876543210' })
  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @ApiPropertyOptional({ description: 'Customer ID if registered', example: 'cust-123' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Associated Service ID', example: 'serv-456' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({ description: 'ISO Date string for appointment', example: '2026-09-01T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  appointmentDate!: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @ApiProperty({ description: 'Appointment mode', enum: AppointmentMode, example: AppointmentMode.OFFLINE })
  @IsEnum(AppointmentMode)
  @IsNotEmpty()
  mode!: AppointmentMode;

  @ApiPropertyOptional({ description: 'Online meeting channel type', enum: OnlineMeetingType, example: OnlineMeetingType.PHONE })
  @IsOptional()
  @IsEnum(OnlineMeetingType)
  onlineType?: OnlineMeetingType;

  @ApiPropertyOptional({ description: 'Meeting URL for online appointments', example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiPropertyOptional({ description: 'Appointment type', enum: AppointmentType })
  @IsOptional()
  @IsEnum(AppointmentType)
  appointmentType?: AppointmentType;

  @ApiPropertyOptional({ description: 'Initial appointment status', enum: AppointmentStatus, example: AppointmentStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ description: 'Additional notes or instructions', example: 'Discuss commercial fiber deployment schedule.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
