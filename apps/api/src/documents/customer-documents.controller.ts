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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import {
  DirectUploadDocumentDto,
  RequestUploadUrlDto,
  UploadOrReplaceDocumentDto,
} from './dto/upload-document.dto';

@ApiTags('Customer - Documents')
@ApiBearerAuth()
@Controller(['customer', 'v1/customer', 'api/v1/customer'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class CustomerDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('services-catalog')
  @ApiOperation({ summary: 'List available services with required document schemas' })
  getServicesCatalog() {
    return this.documentsService.getServicesCatalog();
  }

  @Get('documents')
  @ApiOperation({ summary: 'Convenience endpoint: grouped by application for Document Upload Center' })
  async getAllDocumentsGrouped(@Req() req: { user: { sub?: string; id?: string; customerId?: string } }) {
    const customerId = req.user.customerId || req.user.id || req.user.sub || '';
    return this.documentsService.getAllCustomerDocumentsGrouped(customerId);
  }

  @Get('documents/download-stream')
  @ApiOperation({ summary: 'Decrypt and stream an encrypted document file to the browser' })
  async downloadStream(
    @Req() req: { user: { sub?: string; id?: string; customerId?: string } },
    @Query('path') storagePath: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const customerId = req.user.customerId || req.user.id || req.user.sub || '';
    const allowed = await this.documentsService.verifyCustomerOwnsPath(
      customerId,
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

  @Post('applications/:applicationId/documents/upload-url')
  @ApiOperation({ summary: 'Request signed upload URL' })
  async requestUploadUrl(
    @Req() req: { user: { sub?: string; id?: string; customerId?: string } },
    @Param('applicationId') applicationId: string,
    @Body() dto: RequestUploadUrlDto,
  ) {
    const customerId = req.user.customerId || req.user.id || req.user.sub || '';
    return this.documentsService.requestUploadUrl(
      customerId,
      applicationId,
      dto,
    );
  }

  @Post('applications/:applicationId/documents/upload')
  @ApiOperation({ summary: 'Direct encrypted file upload (AES-256-GCM) with 10MB limit' })
  async directUpload(
    @Req() req: { user: { sub?: string; id?: string; customerId?: string } },
    @Param('applicationId') applicationId: string,
    @Body() dto: DirectUploadDocumentDto,
  ) {
    const customerId = req.user.customerId || req.user.id || req.user.sub || '';
    return this.documentsService.directUploadAndEncrypt(
      customerId,
      applicationId,
      dto,
    );
  }

  @Get('applications/:applicationId/documents')
  @ApiOperation({ summary: 'Fetch all documents for an application' })
  async getApplicationDocuments(
    @Req() req: { user: { sub?: string; id?: string; customerId?: string } },
    @Param('applicationId') applicationId: string,
  ) {
    const customerId = req.user.customerId || req.user.id || req.user.sub || '';
    return this.documentsService.getDocumentsForApplication(
      customerId,
      applicationId,
    );
  }

  @Post('applications/:applicationId/documents')
  @ApiOperation({ summary: 'Upload or replace document for an application (Single Source of Truth)' })
  async uploadOrReplaceDocument(
    @Req() req: { user: { sub?: string; id?: string; customerId?: string } },
    @Param('applicationId') applicationId: string,
    @Body() dto: UploadOrReplaceDocumentDto,
  ) {
    const customerId = req.user.customerId || req.user.id || req.user.sub || '';
    return this.documentsService.uploadOrReplaceDocument(
      customerId,
      applicationId,
      dto,
    );
  }

  @Get('applications/:applicationId/documents/:documentId')
  @ApiOperation({ summary: 'Fetch a single document' })
  async getDocument(
    @Req() req: { user: { sub?: string; id?: string; customerId?: string } },
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    const customerId = req.user.customerId || req.user.id || req.user.sub || '';
    return this.documentsService.getCustomerDocumentById(
      customerId,
      applicationId,
      documentId,
    );
  }

  @Put('applications/:applicationId/documents/:documentId')
  @ApiOperation({ summary: 'Replace or update a single document' })
  async replaceDocument(
    @Req() req: { user: { sub?: string; id?: string; customerId?: string } },
    @Param('applicationId') applicationId: string,
    @Param('documentId') _documentId: string,
    @Body() dto: UploadOrReplaceDocumentDto,
  ) {
    const customerId = req.user.customerId || req.user.id || req.user.sub || '';
    return this.documentsService.uploadOrReplaceDocument(
      customerId,
      applicationId,
      dto,
    );
  }

  @Delete('applications/:applicationId/documents/:documentId')
  @ApiOperation({ summary: 'Delete document' })
  async deleteDocument(
    @Req() req: { user: { sub?: string; id?: string; customerId?: string } },
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    const customerId = req.user.customerId || req.user.id || req.user.sub || '';
    return this.documentsService.deleteCustomerDocument(
      customerId,
      applicationId,
      documentId,
    );
  }
}
