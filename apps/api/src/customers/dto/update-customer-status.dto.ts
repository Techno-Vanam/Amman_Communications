import { IsEnum, IsNotEmpty } from 'class-validator';
import { CustomerStatus } from '@prisma/client';

export class UpdateCustomerStatusDto {
  @IsEnum(CustomerStatus)
  @IsNotEmpty()
  status!: CustomerStatus;
}
