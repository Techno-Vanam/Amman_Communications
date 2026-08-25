import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { ServiceStatus } from '@prisma/client';
import { RequiredDocumentDto } from './create-service.dto';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  governmentFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceFee?: number;

  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredDocumentDto)
  requiredDocuments?: RequiredDocumentDto[];
}
