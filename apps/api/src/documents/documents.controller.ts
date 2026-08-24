import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { DocumentsService } from './documents.service';

@Controller('customer/documents')
@UseGuards(CustomerAuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}
  @Post('upload-url') uploadUrl(@Req() req: { user: { sub: string } }, @Body() body: { applicationId: string; documentType: string; fileName: string; mimeType: string; fileSize: number }) { return this.documents.uploadUrl(req.user.sub, body); }
  @Post('complete') complete(@Req() req: { user: { sub: string } }, @Body() body: { applicationId: string; documentType: string; storagePath: string; fileName: string; mimeType: string; fileSize: number }) { return this.documents.complete(req.user.sub, body); }
  @Get(':id/download') download(@Req() req: { user: { sub: string } }, @Param('id') id: string) { return this.documents.download(req.user.sub, id); }
}
