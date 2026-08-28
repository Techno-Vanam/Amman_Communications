import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum AdminDocumentStatusInput {
  UPLOADED = 'UPLOADED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
}

export class UpdateDocumentStatusDto {
  @ApiProperty({ enum: AdminDocumentStatusInput })
  @IsEnum(AdminDocumentStatusInput)
  @IsNotEmpty()
  status!: AdminDocumentStatusInput;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
