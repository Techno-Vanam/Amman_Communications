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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { DocumentsService } from './documents.service';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';

@ApiTags('Admin - Documents')
@ApiBearerAuth()
@Controller('admin/applications')
@UseGuards(AdminAuthGuard)
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
