import { Prisma } from '@prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ServiceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [total, active, inactive, draft] = await Promise.all([
      this.prisma.service.count(),
      this.prisma.service.count({ where: { status: ServiceStatus.ACTIVE } }),
      this.prisma.service.count({ where: { status: ServiceStatus.INACTIVE } }),
      this.prisma.service.count({ where: { status: ServiceStatus.DRAFT } }),
    ]);

    return { total, active, inactive, draft };
  }

  async findAll(search?: string, status?: ServiceStatus) {
    const where: Prisma.ServiceWhereInput = {};

    if (status && Object.values(ServiceStatus).includes(status)) {
      where.status = status;
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    const services = await this.prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        requiredDocuments: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return services.map((s) => ({
      ...s,
      governmentFee: Number(s.governmentFee),
      serviceFee: Number(s.serviceFee),
      totalFee: Number(s.totalFee),
      applicationsCount: s._count.applications,
    }));
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        requiredDocuments: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return {
      ...service,
      governmentFee: Number(service.governmentFee),
      serviceFee: Number(service.serviceFee),
      totalFee: Number(service.totalFee),
      applicationsCount: service._count.applications,
    };
  }

  async create(dto: CreateServiceDto) {
    const govFee = Number(dto.governmentFee || 0);
    const svcFee = Number(dto.serviceFee || 0);
    const totalFee = govFee + svcFee;

    const requiredDocsData = (dto.requiredDocuments || []).map((doc, index) => ({
      name: doc.name.trim(),
      displayOrder: typeof doc.displayOrder === 'number' ? doc.displayOrder : index + 1,
      isRequired: typeof doc.isRequired === 'boolean' ? doc.isRequired : true,
    }));

    const service = await this.prisma.service.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        governmentFee: govFee,
        serviceFee: svcFee,
        totalFee: totalFee,
        estimatedTime: dto.estimatedTime?.trim() || null,
        status: dto.status || ServiceStatus.DRAFT,
        requiredDocuments: {
          create: requiredDocsData,
        },
      },
      include: {
        requiredDocuments: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return {
      ...service,
      governmentFee: Number(service.governmentFee),
      serviceFee: Number(service.serviceFee),
      totalFee: Number(service.totalFee),
      applicationsCount: service._count.applications,
    };
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    const govFee = dto.governmentFee !== undefined ? Number(dto.governmentFee) : Number(existing.governmentFee);
    const svcFee = dto.serviceFee !== undefined ? Number(dto.serviceFee) : Number(existing.serviceFee);
    const totalFee = govFee + svcFee;

    return this.prisma.$transaction(async (tx) => {
      if (dto.requiredDocuments !== undefined) {
        await tx.requiredDocument.deleteMany({ where: { serviceId: id } });
        const requiredDocsData = dto.requiredDocuments.map((doc, index) => ({
          serviceId: id,
          name: doc.name.trim(),
          displayOrder: typeof doc.displayOrder === 'number' ? doc.displayOrder : index + 1,
          isRequired: typeof doc.isRequired === 'boolean' ? doc.isRequired : true,
        }));
        if (requiredDocsData.length > 0) {
          await tx.requiredDocument.createMany({ data: requiredDocsData });
        }
      }

      const updated = await tx.service.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name.trim() }),
          ...(dto.description !== undefined && { description: dto.description.trim() || null }),
          governmentFee: govFee,
          serviceFee: svcFee,
          totalFee: totalFee,
          ...(dto.estimatedTime !== undefined && { estimatedTime: dto.estimatedTime.trim() || null }),
          ...(dto.status !== undefined && { status: dto.status }),
        },
        include: {
          requiredDocuments: {
            orderBy: { displayOrder: 'asc' },
          },
          _count: {
            select: { applications: true },
          },
        },
      });

      return {
        ...updated,
        governmentFee: Number(updated.governmentFee),
        serviceFee: Number(updated.serviceFee),
        totalFee: Number(updated.totalFee),
        applicationsCount: updated._count.applications,
      };
    });
  }

  async updateStatus(id: string, status: ServiceStatus) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    const updated = await this.prisma.service.update({
      where: { id },
      data: { status },
      include: {
        requiredDocuments: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return {
      ...updated,
      governmentFee: Number(updated.governmentFee),
      serviceFee: Number(updated.serviceFee),
      totalFee: Number(updated.totalFee),
      applicationsCount: updated._count.applications,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    if (existing._count.applications > 0) {
      throw new BadRequestException(
        'Cannot delete service because it is referenced by existing applications. Deactivate it instead.'
      );
    }

    await this.prisma.service.delete({ where: { id } });
    return { success: true, message: 'Service deleted successfully' };
  }
}
