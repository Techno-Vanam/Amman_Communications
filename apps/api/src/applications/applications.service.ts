import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
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

<<<<<<< HEAD
  async adminGetApplications(search?: string, status?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { applicationNumber: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, email: true },
          },
          service: {
            select: { name: true },
          },
          _count: {
            select: { documents: true },
          },
        },
      }),
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async adminUpdateApplicationStatus(applicationId: string, status: any, notes?: string) {
    const existing = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
      include: { customer: true },
    });
  }

  async adminUpdateApplication(id: string, dto: UpdateApplicationDto) {
    const existing = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Application not found');
    }
    return this.prisma.application.update({
      where: { id },
      data: {
        title: dto.title,
        serviceType: dto.serviceType,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth,
        nationality: dto.nationality,
        address: dto.address,
        notes: dto.notes,
        status: dto.status,
      },
    });
  }

  async adminCreateApplication(dto: { customerId: string; serviceType: string; title?: string; fullName?: string; email?: string; phone?: string; address?: string; notes?: string }) {
    const applicationNumber = this.generateApplicationNumber();

    // Fetch customer info for defaults
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${dto.customerId} not found`);
    }

    const emailToCheck = dto.email && dto.email !== customer.email ? dto.email : null;
    const nameToCheck = dto.fullName && dto.fullName !== customer.name ? dto.fullName : null;

    if (emailToCheck || nameToCheck) {
      const existingOtherCustomer = await this.prisma.customer.findFirst({
        where: {
          id: { not: dto.customerId },
          OR: [
            ...(emailToCheck ? [{ email: { equals: emailToCheck.toLowerCase().trim(), mode: 'insensitive' as any } }] : []),
            ...(nameToCheck ? [{ name: { equals: nameToCheck.trim(), mode: 'insensitive' as any } }] : []),
          ]
        }
      });

      if (existingOtherCustomer) {
        throw new BadRequestException('A different customer with this email or name already exists.');
      }
    }

    const matchedService = await this.prisma.service.findFirst({
      where: { name: { equals: dto.serviceType, mode: 'insensitive' as any } }
    });

    return this.prisma.application.create({
      data: {
        applicationNumber,
        customerId: dto.customerId,
        serviceId: matchedService?.id || null,
        serviceType: dto.serviceType,
        title: dto.title || dto.serviceType,
        fullName: dto.fullName || customer.name,
        email: dto.email || customer.email,
        phone: dto.phone || customer.phone || '',
        address: dto.address || '',
        notes: dto.notes || '',
      },
      include: { customer: true, documents: true },
=======
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
>>>>>>> origin/backend-merge
    });
  }

  async adminGetApplicationById(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
<<<<<<< HEAD
        customer: { select: { id: true, name: true, email: true, phone: true } },
=======
        customer: true,
        service: true,
>>>>>>> origin/backend-merge
        documents: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

<<<<<<< HEAD
  async getApplicationDocuments(applicationId: string) {
=======
  async adminUpdateApplicationStatus(applicationId: string, status: any) {
>>>>>>> origin/backend-merge
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

<<<<<<< HEAD
    return this.prisma.document.findMany({
      where: { applicationId },
      orderBy: { uploadedAt: 'desc' },
=======
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        customer: true,
        service: true,
        documents: true,
      },
>>>>>>> origin/backend-merge
    });
  }
}

