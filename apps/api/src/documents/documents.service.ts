import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService) {}
  async uploadUrl(customerId: string, input: { applicationId: string; documentType: string; fileName: string; mimeType: string; fileSize: number }) {
    const max = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10) * 1024 * 1024;
    if (!allowedTypes.has(input.mimeType) || input.fileSize > max) throw new BadRequestException('Unsupported file or size');
    const application = await this.prisma.application.findFirst({ where: { id: input.applicationId, customerId } });
    if (!application) throw new NotFoundException('Application not found');
    const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `documents/${customerId}/${input.applicationId}/${input.documentType}_${Date.now()}_${safeName}`;
    return { uploadUrl: await this.storage.createUploadUrl(storagePath, input.mimeType), storagePath };
  }
  async complete(customerId: string, input: { applicationId: string; documentType: string; storagePath: string; fileName: string; mimeType: string; fileSize: number }) {
    if (!input.storagePath.startsWith(`documents/${customerId}/${input.applicationId}/`)) throw new BadRequestException('Invalid storage path');
    return this.prisma.document.create({ data: { ...input, customerId } });
  }
  async download(customerId: string, id: string) {
    const document = await this.prisma.document.findFirst({ where: { id, customerId } });
    if (!document) throw new NotFoundException('Document not found');
    return { downloadUrl: await this.storage.createDownloadUrl(document.storagePath) };
  }
}
