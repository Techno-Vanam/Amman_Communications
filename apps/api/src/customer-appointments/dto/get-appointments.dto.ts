import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsEnum(AppointmentStatusFilter)
  status?: AppointmentStatusFilter;
}
