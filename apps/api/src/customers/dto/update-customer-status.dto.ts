import { IsEnum, IsNotEmpty } from 'class-validator';
import { CustomerStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerStatusDto {
  @ApiProperty({ enum: CustomerStatus })
  @IsEnum(CustomerStatus)
  @IsNotEmpty()
  status!: CustomerStatus;
}
