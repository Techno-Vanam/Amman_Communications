import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @ApiProperty({ description: 'New appointment status', enum: AppointmentStatus, example: AppointmentStatus.CONFIRMED })
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status!: AppointmentStatus;
}
