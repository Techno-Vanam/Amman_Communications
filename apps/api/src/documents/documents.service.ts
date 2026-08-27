import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  DirectUploadDocumentDto,
  RequestUploadUrlDto,
  UploadOrReplaceDocumentDto,
} from './dto/upload-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { SERVICES_CATALOG } from '@repo/shared-types';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async complete(customerId: string, input: { applicationId: string; documentType: string; storagePath: string; fileName: string; mimeType: string; fileSize: number }) {
    return this.uploadOrReplaceDocument(customerId, input.applicationId, input);
  }

  async download(customerId: string, id: string) {
    const document = await this.prisma.document.findFirst({ where: { id, customerId } });
    if (!document) throw new NotFoundException('Document not found');
    return this.storage.createDownloadUrl(document.storagePath);
  }

  /**
   * Return available services and their required document specifications
   * Dynamically includes all active services managed in admin/services
   */
  async getServicesCatalog() {
    try {
      const dbServices = await this.prisma.service.findMany({
        where: { status: 'ACTIVE' },
        include: {
          requiredDocuments: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (dbServices.length > 0) {
        return dbServices.map((svc) => ({
          id: svc.id,
          code: svc.id,
          title: svc.name,
          category: svc.name.toLowerCase().includes('commercial') || svc.name.toLowerCase().includes('enterprise')
            ? 'Corporate Broadband'
            : 'Residential Broadband',
          tagline: svc.description || 'Amman Communications high-speed verified connection.',
          description: svc.description || '',
          estimatedProcessingDays: svc.estimatedTime || '2-4 Business Days',
          governmentFee: Number(svc.governmentFee),
          serviceFee: Number(svc.serviceFee),
          totalFee: Number(svc.totalFee),
          icon: svc.name.toLowerCase().includes('commercial') ? '🏢' : '📡',
          requiredDocuments: svc.requiredDocuments.map((doc) => ({
            type: doc.name.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
            name: doc.name,
            description: `Please upload valid ${doc.name} (PDF or Image, max 10MB).`,
            required: doc.isRequired,
            acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
            maxSizeMb: 10,
          })),
        }));
      }

      return [
        {
          id: 'svc_commercial_fiber',
          code: 'svc_commercial_fiber',
          title: 'Commercial Fiber Broadband',
          category: 'Corporate Broadband',
          tagline: 'High-speed dedicated fiber optic connectivity for corporate & business premises.',
          description: 'High-speed dedicated fiber optic connectivity for corporate & business premises.',
          estimatedProcessingDays: '3-5 Business Days',
          governmentFee: 250,
          serviceFee: 750,
          totalFee: 1000,
          icon: '🏢',
          requiredDocuments: [
            {
              type: 'COMMERCIAL_REGISTRATION_CERTIFICATE',
              name: 'Commercial Registration Certificate',
              description: 'Please upload Commercial Registration Certificate (PDF/Image max 10MB)',
              required: true,
              acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
              maxSizeMb: 10,
            },
            {
              type: 'AUTHORIZED_SIGNATORY_NATIONAL_ID',
              name: 'Authorized Signatory National ID',
              description: 'Please upload Authorized Signatory National ID (PDF/Image max 10MB)',
              required: true,
              acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
              maxSizeMb: 10,
            },
            {
              type: 'LEASE_AGREEMENT_PROOF_OF_ADDRESS',
              name: 'Lease Agreement / Proof of Address',
              description: 'Please upload Lease Agreement / Proof of Address (PDF/Image max 10MB)',
              required: true,
              acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
              maxSizeMb: 10,
            },
          ],
        },
        {
          id: 'svc_residential_broadband',
          code: 'svc_residential_broadband',
          title: 'Residential Broadband Setup',
          category: 'Home Internet',
          tagline: 'High-speed home internet connection with included Wi-Fi router setup.',
          description: 'High-speed home internet connection with included Wi-Fi router setup.',
          estimatedProcessingDays: '1-2 Business Days',
          governmentFee: 100,
          serviceFee: 300,
          totalFee: 400,
          icon: '📡',
          requiredDocuments: [
            {
              type: 'NATIONAL_IDENTIFICATION_PASSPORT',
              name: 'National Identification / Passport',
              description: 'Please upload National Identification / Passport (PDF/Image max 10MB)',
              required: true,
              acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
              maxSizeMb: 10,
            },
            {
              type: 'UTILITY_BILL_ELECTRICITY_WATER',
              name: 'Utility Bill (Electricity/Water)',
              description: 'Please upload Utility Bill (Electricity/Water) (PDF/Image max 10MB)',
              required: true,
              acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
              maxSizeMb: 10,
            },
          ],
        },
      ];
    } catch {
      return [];
    }
  }

  /**
   * Request a signed upload URL for an application document.
   */
  async requestUploadUrl(
    customerId: string,
    applicationId: string,
    dto: RequestUploadUrlDto,
  ) {
    this.storage.validateFile(dto.fileName, dto.mimeType, dto.fileSize);

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this application');
    }

    const safeName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `documents/${customerId}/${applicationId}/${dto.documentType}_${Date.now()}_${safeName}`;
    const uploadUrl = await this.storage.createUploadUrl(storagePath, dto.mimeType);

    return {
      uploadUrl,
      storagePath,
      documentType: dto.documentType,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
    };
  }

  /**
   * Direct upload with client-to-server file encryption (AES-256-GCM)
   */
  async directUploadAndEncrypt(
    customerId: string,
    applicationId: string,
    dto: DirectUploadDocumentDto,
  ) {
    this.storage.validateFile(dto.fileName, dto.mimeType, dto.fileSize);

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this application');
    }

    const appCustomerId = application.customerId;
    const safeName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `documents/${appCustomerId}/${applicationId}/${dto.documentType}_${Date.now()}_${safeName}`;

    const base64Clean = dto.base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    await this.storage.saveEncryptedFile(storagePath, buffer);

    return this.uploadOrReplaceDocument(customerId, applicationId, {
      documentType: dto.documentType,
      fileName: dto.fileName,
      originalFileName: dto.fileName,
      storagePath,
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
    });
  }

  /**
   * Record or replace a document in the database (Single Source of Truth).
   */
  async uploadOrReplaceDocument(
    customerId: string,
    applicationId: string,
    dto: UploadOrReplaceDocumentDto,
  ) {
    this.storage.validateFile(dto.fileName, dto.mimeType, dto.fileSize);

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const appCustomerId = application.customerId;
    if (application.customerId !== customerId && customerId !== appCustomerId) {
      throw new ForbiddenException('You do not have access to this application');
    }

    if (
      !dto.storagePath.startsWith(`documents/${customerId}/${applicationId}/`) &&
      !dto.storagePath.startsWith(`documents/${appCustomerId}/${applicationId}/`)
    ) {
      throw new BadRequestException('Invalid storage path for this customer application');
    }

    const existing = await this.prisma.document.findUnique({
      where: {
        applicationId_documentType: {
          applicationId,
          documentType: dto.documentType,
        },
      },
    });

    if (existing) {
      if (existing.storagePath && existing.storagePath !== dto.storagePath) {
        await this.storage.deleteFile(existing.storagePath);
      }

      const updated = await this.prisma.document.update({
        where: { id: existing.id },
        data: {
          originalFileName: dto.originalFileName || dto.fileName,
          fileName: dto.fileName,
          storagePath: dto.storagePath,
          fileUrl: dto.fileUrl || null,
          mimeType: dto.mimeType,
          fileSize: dto.fileSize,
          isEncrypted: true,
          status: 'UPLOADED',
          version: existing.version + 1,
          rejectionReason: null,
          verifiedAt: null,
          verifiedBy: null,
        },
      });

      return {
        ...updated,
        documentId: updated.id,
        downloadUrl: await this.storage.createDownloadUrl(updated.storagePath),
      };
    }

    const created = await this.prisma.document.create({
      data: {
        customerId: application.customerId,
        applicationId,
        documentType: dto.documentType,
        originalFileName: dto.originalFileName || dto.fileName,
        fileName: dto.fileName,
        storagePath: dto.storagePath,
        fileUrl: dto.fileUrl || null,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        isEncrypted: true,
        status: 'UPLOADED',
        version: 1,
      },
    });

    return {
      ...created,
      documentId: created.id,
      downloadUrl: await this.storage.createDownloadUrl(created.storagePath),
    };
  }

  async getDocumentsForApplication(customerId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this application');
    }

    const documents = await this.prisma.document.findMany({
      where: { applicationId },
      orderBy: { uploadedAt: 'asc' },
    });

    return Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        documentId: doc.id,
        downloadUrl: await this.storage.createDownloadUrl(doc.storagePath),
      })),
    );
  }

  async getAllCustomerDocumentsGrouped(customerId: string) {
    const applications = await this.prisma.application.findMany({
      where: { customerId },
      include: {
        documents: {
          orderBy: { uploadedAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      applications.map(async (app) => ({
        applicationId: app.id,
        applicationNumber: app.applicationNumber,
        title: app.title,
        serviceType: app.serviceType,
        status: app.status,
        documents: await Promise.all(
          app.documents.map(async (doc) => ({
            documentId: doc.id,
            id: doc.id,
            documentType: doc.documentType,
            fileName: doc.fileName,
            originalFileName: doc.originalFileName,
            mimeType: doc.mimeType,
            fileSize: doc.fileSize,
            isEncrypted: doc.isEncrypted,
            status: doc.status,
            version: doc.version,
            uploadedAt: doc.uploadedAt,
            updatedAt: doc.updatedAt,
            rejectionReason: doc.rejectionReason,
            downloadUrl: await this.storage.createDownloadUrl(doc.storagePath),
          })),
        ),
      })),
    );
  }

  async getCustomerDocumentById(
    customerId: string,
    applicationId: string,
    documentId: string,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { application: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (
      document.applicationId !== applicationId ||
      document.customerId !== customerId ||
      document.application.customerId !== customerId
    ) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return {
      ...document,
      documentId: document.id,
      downloadUrl: await this.storage.createDownloadUrl(document.storagePath),
    };
  }

  async deleteCustomerDocument(
    customerId: string,
    applicationId: string,
    documentId: string,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (
      document.applicationId !== applicationId ||
      document.customerId !== customerId
    ) {
      throw new ForbiddenException('You do not have access to this document');
    }

    await this.storage.deleteFile(document.storagePath);
    await this.prisma.document.delete({ where: { id: documentId } });

    return { message: 'Document deleted successfully' };
  }

  async adminGetDocumentsForApplication(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { customer: { select: { id: true, name: true, email: true } } },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const documents = await this.prisma.document.findMany({
      where: { applicationId },
      orderBy: { uploadedAt: 'asc' },
    });

    return {
      application,
      documents: await Promise.all(
        documents.map(async (doc) => ({
          ...doc,
          documentId: doc.id,
          downloadUrl: await this.storage.createDownloadUrl(doc.storagePath),
        })),
      ),
    };
  }

  async adminGetDocumentById(applicationId: string, documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { application: true },
    });

    if (!document || document.applicationId !== applicationId) {
      throw new NotFoundException('Document not found for this application');
    }

    return {
      ...document,
      documentId: document.id,
      downloadUrl: await this.storage.createDownloadUrl(document.storagePath),
    };
  }

  async adminUpdateDocumentStatus(
    adminId: string,
    applicationId: string,
    documentId: string,
    dto: UpdateDocumentStatusDto,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.applicationId !== applicationId) {
      throw new NotFoundException('Document not found for this application');
    }

    const isVerified = dto.status === 'VERIFIED';
    const isRejected =
      dto.status === 'REJECTED' || dto.status === 'ACTION_REQUIRED';

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: dto.status as any,
        rejectionReason: isRejected ? dto.rejectionReason || 'Document requires re-upload' : null,
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? adminId : null,
      },
    });

    return {
      ...updated,
      documentId: updated.id,
      downloadUrl: await this.storage.createDownloadUrl(updated.storagePath),
    };
  }

  async verifyCustomerOwnsPath(
    customerId: string,
    storagePath: string,
  ): Promise<boolean> {
    if (!storagePath) return false;
    const document = await this.prisma.document.findFirst({
      where: { storagePath, customerId },
    });
    return document !== null;
  }

  async streamDecryptedDocument(
    storagePath: string,
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    const document = await this.prisma.document.findFirst({
      where: { storagePath },
    });

    const mimeType = document?.mimeType || 'application/octet-stream';
    const fileName = document?.originalFileName || document?.fileName || 'document';

    const buffer = await this.storage.readDecryptedFile(storagePath);
    return { buffer, mimeType, fileName };
  }
}
