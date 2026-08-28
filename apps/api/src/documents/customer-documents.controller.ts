import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { DocumentsService } from './documents.service';
import {
  DirectUploadDocumentDto,
  RequestUploadUrlDto,
  UploadOrReplaceDocumentDto,
} from './dto/upload-document.dto';

@Controller(['customer', 'v1/customer', 'api/v1/customer'])
@UseGuards(CustomerAuthGuard)
export class CustomerDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * GET /api/v1/customer/services-catalog
   * List available services with required document schemas
   */
  @Get('services-catalog')
  getServicesCatalog() {
    return this.documentsService.getServicesCatalog();
  }

  /**
   * GET /api/v1/customer/documents
   * Convenience endpoint: grouped by application for Document Upload Center
   */
  @Get('documents')
  async getAllDocumentsGrouped(@Req() req: { user: { sub: string } }) {
    return this.documentsService.getAllCustomerDocumentsGrouped(req.user.sub);
  }

  /**
   * GET /api/v1/customer/documents/download-stream?path=...
   * Decrypt and stream an encrypted document file to the browser.
   */
  @Get('documents/download-stream')
  async downloadStream(
    @Req() req: { user: { sub: string } },
    @Query('path') storagePath: string,
    @Res({ passthrough: true }) res: any,
  ) {
    // Verify the customer owns a document at this path
    const allowed = await this.documentsService.verifyCustomerOwnsPath(
      req.user.sub,
      storagePath,
    );
    if (!allowed) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const { buffer, mimeType, fileName } =
      await this.documentsService.streamDecryptedDocument(storagePath);

    res.set({
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'private, no-cache',
    });

    return new StreamableFile(buffer);
  }

  /**
   * POST /api/v1/customer/applications/:applicationId/documents/upload-url
   * Request signed upload URL
   */
  @Post('applications/:applicationId/documents/upload-url')
  async requestUploadUrl(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
    @Body() dto: RequestUploadUrlDto,
  ) {
    return this.documentsService.requestUploadUrl(
      req.user.sub,
      applicationId,
      dto,
    );
  }

  /**
   * POST /api/v1/customer/applications/:applicationId/documents/upload
   * Direct encrypted file upload (AES-256-GCM) with 10MB limit
   */
  @Post('applications/:applicationId/documents/upload')
  async directUpload(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
    @Body() dto: DirectUploadDocumentDto,
  ) {
    return this.documentsService.directUploadAndEncrypt(
      req.user.sub,
      applicationId,
      dto,
    );
  }

  /**
   * GET /api/v1/customer/applications/:applicationId/documents
   * Fetch all documents for an application
   */
  @Get('applications/:applicationId/documents')
  async getApplicationDocuments(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
  ) {
    return this.documentsService.getDocumentsForApplication(
      req.user.sub,
      applicationId,
    );
  }

  /**
   * POST /api/v1/customer/applications/:applicationId/documents
   * Upload or replace document for an application (Single Source of Truth)
   */
  @Post('applications/:applicationId/documents')
  async uploadOrReplaceDocument(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
    @Body() dto: UploadOrReplaceDocumentDto,
  ) {
    return this.documentsService.uploadOrReplaceDocument(
      req.user.sub,
      applicationId,
      dto,
    );
  }

  /**
   * GET /api/v1/customer/applications/:applicationId/documents/:documentId
   * Fetch a single document
   */
  @Get('applications/:applicationId/documents/:documentId')
  async getDocument(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.getCustomerDocumentById(
      req.user.sub,
      applicationId,
      documentId,
    );
  }

  /**
   * PUT /api/v1/customer/applications/:applicationId/documents/:documentId
   * Replace or update a single document
   */
  @Put('applications/:applicationId/documents/:documentId')
  async replaceDocument(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
    @Param('documentId') _documentId: string,
    @Body() dto: UploadOrReplaceDocumentDto,
  ) {
    return this.documentsService.uploadOrReplaceDocument(
      req.user.sub,
      applicationId,
      dto,
    );
  }

  /**
   * DELETE /api/v1/customer/applications/:applicationId/documents/:documentId
   * Delete document
   */
  @Delete('applications/:applicationId/documents/:documentId')
  async deleteDocument(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.deleteCustomerDocument(
      req.user.sub,
      applicationId,
      documentId,
    );
  }
}
