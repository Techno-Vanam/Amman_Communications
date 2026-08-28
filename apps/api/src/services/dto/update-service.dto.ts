import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { ServiceStatus } from '@prisma/client';
import { RequiredDocumentDto } from './create-service.dto';

export class UpdateServiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  @ApiProperty()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsNumber()
  @ApiProperty()
  @Min(0)
  governmentFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsNumber()
  @ApiProperty()
  @Min(0)
  serviceFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  estimatedTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty()
  @Type(() => RequiredDocumentDto)
  requiredDocuments?: RequiredDocumentDto[];
}
