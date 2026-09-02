import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { ServiceStatus } from '@prisma/client';

export class RequiredDocumentDto {
  @ApiPropertyOptional({ description: 'Required document ID', example: 'doc-1' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Document name', example: 'Commercial License Copy' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ description: 'Display order index', example: 1 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Is this document mandatory', example: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

export class CreateServiceDto {
  @ApiProperty({ description: 'Service title', example: 'Commercial Fiber Connectivity' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ description: 'Detailed description of the service', example: 'High-speed dedicated commercial fiber connectivity.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Government processing fee', example: 250 })
  @IsNumber()
  @Min(0)
  governmentFee!: number;

  @ApiProperty({ description: 'Service provider fee', example: 750 })
  @IsNumber()
  @Min(0)
  serviceFee!: number;

  @ApiPropertyOptional({ description: 'Estimated fulfillment timeframe', example: '2-3 Working Days' })
  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @ApiPropertyOptional({ description: 'Service publishing status', enum: ServiceStatus, example: ServiceStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional({ type: [RequiredDocumentDto], description: 'List of required documents' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty()
  @Type(() => RequiredDocumentDto)
  requiredDocuments?: RequiredDocumentDto[];

  @ApiPropertyOptional({ description: 'Is partial payment allowed', example: true })
  @IsOptional()
  @IsBoolean()
  isPartialPaymentAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Minimum partial payment fee', example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPartialFee?: number;
}
