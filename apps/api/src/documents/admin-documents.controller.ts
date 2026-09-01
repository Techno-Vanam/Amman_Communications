import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  StreamableFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DocumentsService } from './documents.service';
import { DirectUploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@ApiTags('Admin - Documents')
@ApiBearerAuth()
@Controller('admin/applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':applicationId/documents')
  @ApiOperation({ summary: 'Get all documents for a specific application' })
  async getApplicationDocuments(@Param('applicationId') applicationId: string) {
    return this.documentsService.adminGetDocumentsForApplication(applicationId);
  }

  @Get(':applicationId/documents/:documentId')
  @ApiOperation({ summary: 'Get details of a specific document' })
  async getDocument(
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.adminGetDocumentById(
      applicationId,
      documentId,
    );
  }

  @Get(':applicationId/documents/:documentId/stream')
  @ApiOperation({ summary: 'Stream a decrypted document for review' })
  async streamDocumentById(
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
    @Query('download') download: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const document = await this.documentsService.adminGetDocumentById(
      applicationId,
      documentId,
    );
    const { buffer, mimeType, fileName } =
      await this.documentsService.streamDecryptedDocument(document.storagePath);

    const disposition = download ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`;

    res.set({
      'Content-Type': mimeType || 'application/pdf',
      'Content-Disposition': disposition,
      'Content-Length': buffer.length,
      'Cache-Control': 'private, no-cache',
    });

    return new StreamableFile(buffer);
  }

  @Post(':applicationId/documents/upload')
  @ApiOperation({ summary: 'Admin uploads a document on behalf of a customer (base64)' })
  async adminUploadDocument(
    @Param('applicationId') applicationId: string,
    @Body() dto: DirectUploadDocumentDto,
  ) {
    return this.documentsService.adminDirectUploadDocument(applicationId, dto);
  }

  @Put(':applicationId/documents/:documentId/status')
  @ApiOperation({ summary: 'Update the status of a document (Approve/Reject)' })
  async updateDocumentStatus(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
    @Body() dto: UpdateDocumentStatusDto,
  ) {
    return this.documentsService.adminUpdateDocumentStatus(
      req.user.sub,
      applicationId,
      documentId,
      dto,
    );
  }
}
