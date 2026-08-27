import { AppointmentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status!: AppointmentStatus;
}
