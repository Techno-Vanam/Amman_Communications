import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentMode, AppointmentStatus, OnlineMeetingType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateAppointmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsDateString()
  appointmentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsInt()
  @ApiProperty()
  @Min(5)
  @ApiProperty()
  @Max(480)
  durationMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsEnum(AppointmentMode)
  mode?: AppointmentMode;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsEnum(OnlineMeetingType)
  onlineType?: OnlineMeetingType;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  meetingLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsDateString()
  rescheduledFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  rescheduleReason?: string;
}
