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

  async adminUpdateApplicationStatus(applicationId: string, status: any) {
    const existing = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        customer: true,
      }
    });
  }
}

