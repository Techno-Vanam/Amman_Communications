import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum AdminDocumentStatusInput {
  UPLOADED = 'UPLOADED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
}

export class UpdateDocumentStatusDto {
  @IsEnum(AdminDocumentStatusInput)
  @IsNotEmpty()
  status!: AdminDocumentStatusInput;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
