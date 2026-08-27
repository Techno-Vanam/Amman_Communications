import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Matches } from 'class-validator';

export class CreateUploadUrlDto {
  @ApiProperty({ description: 'Document type code (e.g. passport_copy, trade_license)' })
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ example: 'application/pdf', description: 'MIME type of document (pdf, image/jpeg, image/png)' })
  @IsString()
  @Matches(/^(application\/pdf|image\/jpeg|image\/png|image\/jpg)$/i, {
    message: 'Allowed file types are PDF, JPG, and PNG',
  })
  mimeType!: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsInt()
  @IsPositive()
  fileSize!: number;
}

export class CompleteDocumentUploadDto {
  @ApiProperty({ description: 'Storage path where file was uploaded' })
  @IsString()
  @IsNotEmpty()
  storagePath!: string;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ description: 'File type (pdf, jpg, png)' })
  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsInt()
  @IsPositive()
  fileSize!: number;
}
