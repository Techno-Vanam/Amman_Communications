import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RequestUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  fileSize!: number;
}

export class UploadOrReplaceDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsOptional()
  @IsString()
  originalFileName?: string;

  @IsString()
  @IsNotEmpty()
  storagePath!: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  fileSize!: number;
}

export class DirectUploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  fileSize!: number;

  @IsString()
  @IsNotEmpty()
  base64Data!: string;
}
