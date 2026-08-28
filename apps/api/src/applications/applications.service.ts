import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateApplicationNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `AMC-${year}-${random}`;
  }

  async listCustomerApplications(customerId: string) {
    const applications = await this.prisma.application.findMany({
      where: { customerId },
      include: {
        documents: {
          select: {
            id: true,
            documentType: true,
            fileName: true,
            originalFileName: true,
            mimeType: true,
            fileSize: true,
            isEncrypted: true,
            status: true,
            version: true,
            uploadedAt: true,
            updatedAt: true,
            rejectionReason: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  }

  async getCustomerApplicationById(customerId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        documents: {
          select: {
            id: true,
            documentType: true,
            fileName: true,
            originalFileName: true,
            mimeType: true,
            fileSize: true,
            isEncrypted: true,
            status: true,
            version: true,
            uploadedAt: true,
            updatedAt: true,
            rejectionReason: true,
          },
          orderBy: { uploadedAt: 'asc' },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this application');
    }

    return application;
  }

  async createApplication(customerId: string, dto: CreateApplicationDto) {
    const applicationNumber =
      dto.applicationNumber || this.generateApplicationNumber();

    // Update authenticated customer's profile if fullName or phone provided
    if (customerId) {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: {
          ...(dto.fullName ? { name: dto.fullName } : {}),
          ...(dto.phone ? { phone: dto.phone } : {}),
        },
      }).catch(() => {});
    }

    const application = await this.prisma.application.create({
      data: {
        applicationNumber,
        customerId,
        serviceType: dto.serviceType,
        title: dto.title || dto.serviceType,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth,
        nationality: dto.nationality,
        address: dto.address,
        notes: dto.notes,
      },
      include: {
        documents: true,
        customer: true,
      },
    });

    return application;
  }

  async updateApplication(
    customerId: string,
    applicationId: string,
    dto: UpdateApplicationDto,
  ) {
    const existing = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      throw new NotFoundException('Application not found');
    }

    if (existing.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this application');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.serviceType !== undefined ? { serviceType: dto.serviceType } : {}),
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.dateOfBirth !== undefined ? { dateOfBirth: dto.dateOfBirth } : {}),
        ...(dto.nationality !== undefined ? { nationality: dto.nationality } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: {
        documents: true,
      },
    });
  }

  async adminListApplications(filters: { search?: string; status?: any }) {
    const where: any = {};
    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { applicationNumber: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { serviceType: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.application.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        service: {
          select: { id: true, name: true, totalFee: true },
        },
        documents: {
          orderBy: { uploadedAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminGetApplicationById(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        customer: true,
        service: true,
        documents: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async adminUpdateApplicationStatus(applicationId: string, status: any) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        customer: true,
        service: true,
        documents: true,
      },
    });
  }
}
