import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CustomerRescheduleAppointmentDto {
  @ApiProperty({ description: 'New preferred date (YYYY-MM-DD or ISO string)', example: '2026-09-10' })
  @IsDateString()
  @IsNotEmpty()
  preferredDate!: string;

  @ApiPropertyOptional({ description: 'New preferred time slot', example: '10:30 AM' })
  @IsOptional()
  @IsString()
  preferredTime?: string;

  @ApiPropertyOptional({ description: 'Reason for rescheduling', example: 'Schedule conflict' })
  @IsOptional()
  @IsString()
  reason?: string;
}
