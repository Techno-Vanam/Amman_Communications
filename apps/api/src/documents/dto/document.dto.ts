import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum DocumentVerificationStatusEnum {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export class DocumentQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DocumentVerificationStatusEnum)
  status?: DocumentVerificationStatusEnum;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class VerifyDocumentDto {
  @IsEnum(DocumentVerificationStatusEnum)
  status!: DocumentVerificationStatusEnum;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UploadDocumentDto {
  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsString()
  documentType!: string;

  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;

  @IsNumber()
  fileSize!: number;

  @IsOptional()
  @IsString()
  storagePath?: string;
}
