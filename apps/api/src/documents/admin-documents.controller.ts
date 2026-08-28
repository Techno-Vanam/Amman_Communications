import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { DocumentsService } from './documents.service';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';

@Controller(['admin/applications', 'v1/admin/applications', 'api/v1/admin/applications'])
@UseGuards(AdminAuthGuard)
export class AdminDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * GET /api/v1/admin/applications/:applicationId/documents
   */
  @Get(':applicationId/documents')
  async getApplicationDocuments(@Param('applicationId') applicationId: string) {
    return this.documentsService.adminGetDocumentsForApplication(applicationId);
  }

  /**
   * GET /api/v1/admin/applications/:applicationId/documents/:documentId
   */
  @Get(':applicationId/documents/:documentId')
  async getDocument(
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.adminGetDocumentById(
      applicationId,
      documentId,
    );
  }

  /**
   * GET /api/v1/admin/applications/:applicationId/documents/:documentId/stream
   * Decrypt and stream document for admin review
   */
  @Get(':applicationId/documents/:documentId/stream')
  async streamDocumentById(
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const document = await this.documentsService.adminGetDocumentById(
      applicationId,
      documentId,
    );
    const { buffer, mimeType, fileName } =
      await this.documentsService.streamDecryptedDocument(document.storagePath);

    res.set({
      'Content-Type': mimeType || 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'private, no-cache',
    });

    return new StreamableFile(buffer);
  }

  /**
   * PUT /api/v1/admin/applications/:applicationId/documents/:documentId/status
   */
  @Put(':applicationId/documents/:documentId/status')
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
