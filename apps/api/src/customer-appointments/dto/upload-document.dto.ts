import { IsInt, IsNotEmpty, IsPositive, IsString, Max } from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsInt()
  @IsPositive()
  @Max(10485760, { message: 'File size must not exceed 10MB' })
  fileSize!: number;
}

export class CompleteDocumentUploadDto {
  @IsString()
  @IsNotEmpty()
  storagePath!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @IsInt()
  @IsPositive()
  fileSize!: number;
}
