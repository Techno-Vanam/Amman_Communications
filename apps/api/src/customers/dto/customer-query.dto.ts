import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CustomerStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CustomerQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10) || 1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10) || 10)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
