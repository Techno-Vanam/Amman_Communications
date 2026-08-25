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

  /**
   * Return available services and their required document specifications
   */
  getServicesCatalog() {
    return SERVICES_CATALOG;
  }

  /**
   * Request a signed upload URL for an application document.
   */
  async requestUploadUrl(
    customerId: string,
    applicationId: string,
    dto: RequestUploadUrlDto,
  ) {
    // 1. Validate file metadata
    this.storage.validateFile(dto.fileName, dto.mimeType, dto.fileSize);

    // 2. Validate application existence and customer ownership
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this application');
    }

    // 3. Generate storage path and upload URL
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

    const safeName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `documents/${customerId}/${applicationId}/${dto.documentType}_${Date.now()}_${safeName}`;

    // Extract base64 buffer
    const base64Clean = dto.base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    // Encrypt and persist
    await this.storage.saveEncryptedFile(storagePath, buffer);

    // Save or replace in DB (Single Source of Truth)
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
   * If a document of the same type exists for the application, updates that record and bumps version.
   */
  async uploadOrReplaceDocument(
    customerId: string,
    applicationId: string,
    dto: UploadOrReplaceDocumentDto,
  ) {
    // 1. Validate file
    this.storage.validateFile(dto.fileName, dto.mimeType, dto.fileSize);

    // 2. Verify application ownership
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this application');
    }

    // 3. Verify storage path security (prevent path traversal / cross-tenant writes)
    if (!dto.storagePath.startsWith(`documents/${customerId}/${applicationId}/`)) {
      throw new BadRequestException('Invalid storage path for this customer application');
    }

    // 4. Find existing document for (applicationId, documentType)
    const existing = await this.prisma.document.findUnique({
      where: {
        applicationId_documentType: {
          applicationId,
          documentType: dto.documentType,
        },
      },
    });

    if (existing) {
      // Clean up previous storage file if it has changed
      if (existing.storagePath && existing.storagePath !== dto.storagePath) {
        await this.storage.deleteFile(existing.storagePath);
      }

      // Update existing single record (Single Source of Truth replacement)
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

    // Create new document record
    const created = await this.prisma.document.create({
      data: {
        customerId,
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

  /**
   * Get all documents belonging to a customer's specific application.
   */
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

  /**
   * Get all customer documents grouped by application (Document Upload Center convenience view).
   */
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

  /**
   * Get a single document by ID with customer ownership verification.
   */
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

  /**
   * Delete a document by ID with customer ownership verification.
   */
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

  /**
   * Admin: List documents for an application.
   */
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

  /**
   * Admin: Get single document details with download URL.
   */
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

  /**
   * Admin: Update document status (VERIFIED, REJECTED, ACTION_REQUIRED, etc.)
   */
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

  /**
   * Verify that a given storage path belongs to the authenticated customer.
   * Used to guard the download-stream endpoint.
   */
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

  /**
   * Read and decrypt an encrypted document from local storage, returning
   * buffer + metadata for streaming to the browser.
   */
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
