import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ enum: AppointmentStatusFilter, description: 'Optional status filter for appointment list' })
  @IsOptional()
  @IsEnum(AppointmentStatusFilter)
  status?: AppointmentStatusFilter;
}
