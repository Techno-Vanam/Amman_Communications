import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentType, ConsultationMode } from '@prisma/client';
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  serviceId!: string;

  @ApiProperty()
  @IsEnum(AppointmentType)
  appointmentType!: AppointmentType;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  officeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsEnum(ConsultationMode)
  consultationMode?: ConsultationMode;

  @ApiProperty()
  @IsISO8601()
  preferredDate!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'preferredTime must be a valid 24h format HH:mm' })
  preferredTime!: string;

  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  contactNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  notes?: string;
}
