import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Max } from 'class-validator';

export class CreateUploadUrlDto {
  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  documentType!: string;

  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  mimeType!: string;

  @ApiProperty()
  @IsInt()
  @ApiProperty()
  @IsPositive()
  @ApiProperty()
  @Max(10485760, { message: 'File size must not exceed 10MB' })
  fileSize!: number;
}

export class CompleteDocumentUploadDto {
  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  storagePath!: string;

  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  fileType!: string;

  @ApiProperty()
  @IsInt()
  @ApiProperty()
  @IsPositive()
  fileSize!: number;
}
