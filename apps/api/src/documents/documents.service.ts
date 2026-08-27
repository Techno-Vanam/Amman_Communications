import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentQueryDto, DocumentVerificationStatusEnum, UploadDocumentDto, VerifyDocumentDto } from './dto/document.dto';

const allowedTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------
  // ADMIN METHODS
  // -------------------------------------------------------------

  async adminGetStats() {
    const [total, pending, verified, rejected] = await Promise.all([
      this.prisma.document.count(),
      this.prisma.document.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.document.count({ where: { verificationStatus: 'VERIFIED' } }),
      this.prisma.document.count({ where: { verificationStatus: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      verified,
      rejected,
    };
  }

  async adminFindAll(query: DocumentQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.verificationStatus = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { documentType: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          application: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async adminFindOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        application: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }

    return doc;
  }

  async adminVerify(id: string, dto: VerifyDocumentDto) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        verificationStatus: dto.status,
        verificationRemarks: dto.remarks ?? null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async adminDelete(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }

    await this.prisma.document.delete({ where: { id } });
    return { success: true, message: 'Document deleted successfully.' };
  }

  // -------------------------------------------------------------
  // CUSTOMER METHODS
  // -------------------------------------------------------------

  async customerFindAll(customerId: string) {
    return this.prisma.document.findMany({
      where: { customerId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        application: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async customerUpload(customerId: string, input: UploadDocumentDto) {
    const max = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10) * 1024 * 1024;
    if (input.fileSize > max) {
      throw new BadRequestException(`File size exceeds limit of ${process.env.MAX_UPLOAD_SIZE_MB ?? 10}MB`);
    }

    let applicationId = input.applicationId;
    if (!applicationId) {
      // Find or create active application for customer
      let app = await this.prisma.application.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      if (!app) {
        app = await this.prisma.application.create({
          data: { customerId },
        });
      }
      applicationId = app.id;
    }

    const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = input.storagePath || `documents/${customerId}/${applicationId}/${Date.now()}_${safeName}`;

    return this.prisma.document.create({
      data: {
        customerId,
        applicationId,
        documentType: input.documentType,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        storagePath,
        verificationStatus: 'PENDING',
      },
      include: {
        application: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async uploadUrl(customerId: string, input: { applicationId: string; documentType: string; fileName: string; mimeType: string; fileSize: number }) {
    const max = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10) * 1024 * 1024;
    if (!allowedTypes.has(input.mimeType) || input.fileSize > max) throw new BadRequestException('Unsupported file or size');
    const application = await this.prisma.application.findFirst({ where: { id: input.applicationId, customerId } });
    if (!application) throw new NotFoundException('Application not found');
    const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `documents/${customerId}/${input.applicationId}/${input.documentType}_${Date.now()}_${safeName}`;
    return {
      uploadUrl: `mock://storage/${storagePath}`,
      storagePath,
    };
  }

  async complete(customerId: string, input: { applicationId: string; documentType: string; storagePath: string; fileName: string; mimeType: string; fileSize: number }) {
    const application = await this.prisma.application.findFirst({ where: { id: input.applicationId, customerId } });
    if (!application) throw new NotFoundException('Application not found');
    return this.prisma.document.create({ data: { ...input, customerId } });
  }

  async download(customerId: string, id: string) {
    const document = await this.prisma.document.findFirst({ where: { id, customerId } });
    if (!document) throw new NotFoundException('Document not found');
    return {
      downloadUrl: `mock://download/${document.storagePath}`,
      fileName: document.fileName,
    };
  }
}
