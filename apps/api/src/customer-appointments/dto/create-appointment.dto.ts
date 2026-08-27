import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

export enum AppointmentType {
  OFFICE_VISIT = 'OFFICE_VISIT',
  ONLINE_CONSULTATION = 'ONLINE_CONSULTATION',
}

export enum ConsultationMode {
  PHONE = 'PHONE',
  VIDEO = 'VIDEO',
  WHATSAPP = 'WHATSAPP',
}

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID of the service being requested' })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @ApiProperty({ enum: AppointmentType, description: 'Type of appointment: OFFICE_VISIT or ONLINE_CONSULTATION' })
  @IsEnum(AppointmentType)
  appointmentType!: AppointmentType;

  @ApiPropertyOptional({ description: 'Office location ID (Required for OFFICE_VISIT)' })
  @ValidateIf((o) => o.appointmentType === AppointmentType.OFFICE_VISIT)
  @IsString()
  @IsNotEmpty()
  officeId?: string;

  @ApiPropertyOptional({ enum: ConsultationMode, description: 'Consultation channel (Required for ONLINE_CONSULTATION)' })
  @ValidateIf((o) => o.appointmentType === AppointmentType.ONLINE_CONSULTATION)
  @IsEnum(ConsultationMode)
  consultationMode?: ConsultationMode;

  @ApiProperty({ example: '2026-09-01', description: 'ISO date string for preferred appointment date' })
  @IsDateString()
  preferredDate!: string;

  @ApiProperty({ example: '10:30', description: 'Preferred time slot in HH:mm format' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'preferredTime must be formatted as HH:mm' })
  preferredTime!: string;

  @ApiProperty({ example: '+962791234567', description: 'Primary contact phone number' })
  @IsString()
  @IsNotEmpty()
  contactNumber!: string;

  @ApiPropertyOptional({ example: 'Building 45, King Hussein St, Amman', description: 'Customer address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Additional instructions or notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
