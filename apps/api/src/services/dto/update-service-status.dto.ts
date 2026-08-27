import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ServiceStatus } from '@prisma/client';

export class UpdateServiceStatusDto {
  @ApiProperty({ description: 'New status for the service', enum: ServiceStatus, example: ServiceStatus.ACTIVE })
  @IsEnum(ServiceStatus)
  status!: ServiceStatus;
}
