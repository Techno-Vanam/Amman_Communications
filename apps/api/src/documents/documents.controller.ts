import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { DocumentsService } from './documents.service';
import { DocumentQueryDto, UploadDocumentDto, VerifyDocumentDto } from './dto/document.dto';

// -----------------------------------------------------------------
// CUSTOMER DOCUMENTS CONTROLLER
// -----------------------------------------------------------------
@Controller('customer/documents')
@UseGuards(CustomerAuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  async getMyDocuments(@Req() req: { user: { sub: string } }) {
    return this.documents.customerFindAll(req.user.sub);
  }

  @Post()
  async uploadDocument(
    @Req() req: { user: { sub: string } },
    @Body() body: UploadDocumentDto,
  ) {
    return this.documents.customerUpload(req.user.sub, body);
  }

  @Post('upload-url')
  uploadUrl(
    @Req() req: { user: { sub: string } },
    @Body() body: { applicationId: string; documentType: string; fileName: string; mimeType: string; fileSize: number },
  ) {
    return this.documents.uploadUrl(req.user.sub, body);
  }

  @Post('complete')
  complete(
    @Req() req: { user: { sub: string } },
    @Body() body: { applicationId: string; documentType: string; storagePath: string; fileName: string; mimeType: string; fileSize: number },
  ) {
    return this.documents.complete(req.user.sub, body);
  }

  @Get(':id/download')
  download(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.documents.download(req.user.sub, id);
  }
}

// -----------------------------------------------------------------
// ADMIN DOCUMENTS CONTROLLER
// -----------------------------------------------------------------
@Controller('v1/admin/documents')
@UseGuards(AdminAuthGuard)
export class AdminDocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get('stats')
  async getStats() {
    return this.documents.adminGetStats();
  }

  @Get()
  async findAll(@Query() query: DocumentQueryDto) {
    return this.documents.adminFindAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documents.adminFindOne(id);
  }

  @Patch(':id/verify')
  async verify(@Param('id') id: string, @Body() dto: VerifyDocumentDto) {
    return this.documents.adminVerify(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.documents.adminDelete(id);
  }
}
