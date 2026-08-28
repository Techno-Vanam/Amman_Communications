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
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { DocumentsService } from './documents.service';
import {
  DirectUploadDocumentDto,
  RequestUploadUrlDto,
  UploadOrReplaceDocumentDto,
} from './dto/upload-document.dto';

@ApiTags('Customer - Documents')
@ApiBearerAuth()
@Controller('customer')
@UseGuards(CustomerAuthGuard)
export class CustomerDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('services-catalog')
  @ApiOperation({ summary: 'List available services with required document schemas' })
  getServicesCatalog() {
    return this.documentsService.getServicesCatalog();
  }

  @Get('documents')
  @ApiOperation({ summary: 'Convenience endpoint: grouped by application for Document Upload Center' })
  async getAllDocumentsGrouped(@Req() req: { user: { sub: string } }) {
    return this.documentsService.getAllCustomerDocumentsGrouped(req.user.sub);
  }

  @Get('documents/download-stream')
  @ApiOperation({ summary: 'Decrypt and stream an encrypted document file to the browser' })
  async downloadStream(
    @Req() req: { user: { sub: string } },
    @Query('path') storagePath: string,
    @Res({ passthrough: true }) res: any,
  ) {
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

  @Post('applications/:applicationId/documents/upload-url')
  @ApiOperation({ summary: 'Request signed upload URL' })
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

  @Post('applications/:applicationId/documents/upload')
  @ApiOperation({ summary: 'Direct encrypted file upload (AES-256-GCM) with 10MB limit' })
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

  @Get('applications/:applicationId/documents')
  @ApiOperation({ summary: 'Fetch all documents for an application' })
  async getApplicationDocuments(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
  ) {
    return this.documentsService.getDocumentsForApplication(
      req.user.sub,
      applicationId,
    );
  }

  @Post('applications/:applicationId/documents')
  @ApiOperation({ summary: 'Upload or replace document for an application (Single Source of Truth)' })
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

  @Get('applications/:applicationId/documents/:documentId')
  @ApiOperation({ summary: 'Fetch a single document' })
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

  @Put('applications/:applicationId/documents/:documentId')
  @ApiOperation({ summary: 'Replace or update a single document' })
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

  @Delete('applications/:applicationId/documents/:documentId')
  @ApiOperation({ summary: 'Delete document' })
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
