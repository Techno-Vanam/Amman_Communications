import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { DocumentsService } from './documents.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class UploadUrlDto {
  @ApiProperty({ example: 'app-123' })
  @IsString()
  applicationId!: string;

  @ApiProperty({ example: 'PASSPORT' })
  @IsString()
  documentType!: string;

  @ApiProperty({ example: 'passport_scan.pdf' })
  @IsString()
  fileName!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType!: string;

  @ApiProperty({ example: 1048576 })
  @IsNumber()
  fileSize!: number;
}

export class CompleteUploadDto {
  @ApiProperty({ example: 'app-123' })
  @IsString()
  applicationId!: string;

  @ApiProperty({ example: 'PASSPORT' })
  @IsString()
  documentType!: string;

  @ApiProperty({ example: 'users/123/documents/passport_scan.pdf' })
  @IsString()
  storagePath!: string;

  @ApiProperty({ example: 'passport_scan.pdf' })
  @IsString()
  fileName!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType!: string;

  @ApiProperty({ example: 1048576 })
  @IsNumber()
  fileSize!: number;
}

@ApiBearerAuth()
@Controller('customer/documents')
@UseGuards(CustomerAuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}
  @Post('upload-url') uploadUrl(@Req() req: { user: { sub: string } }, @Body() body: UploadUrlDto) { return this.documents.uploadUrl(req.user.sub, body); }
  @Post('complete') complete(@Req() req: { user: { sub: string } }, @Body() body: CompleteUploadDto) { return this.documents.complete(req.user.sub, body); }
  @Get(':id/download') download(@Req() req: { user: { sub: string } }, @Param('id') id: string) { return this.documents.download(req.user.sub, id); }
}
