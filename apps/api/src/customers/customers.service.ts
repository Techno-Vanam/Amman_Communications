import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CustomerStatus, Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

const safeCustomerSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      applications: true,
      documents: true,
    },
  },
} as const;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [total, active, inactive, withApplications] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      this.prisma.customer.count({ where: { status: CustomerStatus.INACTIVE } }),
      this.prisma.customer.count({ where: { applications: { some: {} } } }),
    ]);

    return { total, active, inactive, withApplications };
  }

  async findAll(query: CustomerQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (query.status && query.status !== 'ALL') {
      if (Object.values(CustomerStatus).includes(query.status as CustomerStatus)) {
        where.status = query.status as CustomerStatus;
      }
    }

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        select: safeCustomerSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        ...safeCustomerSelect,
        applications: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        documents: {
          take: 5,
          orderBy: { uploadedAt: 'desc' },
          select: {
            id: true,
            fileName: true,
            documentType: true,
            status: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer record not found.');
    }

    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const [existingAdmin, existingCustomer] = await Promise.all([
      this.prisma.admin.findUnique({ where: { email: normalizedEmail } }),
      this.prisma.customer.findUnique({ where: { email: normalizedEmail } }),
    ]);

    if (existingAdmin || existingCustomer) {
      throw new BadRequestException('Email is already in use by another account.');
    }

    const passwordHash = await hash(dto.password, 10);

    return this.prisma.customer.create({
      data: {
        name: dto.name.trim(),
        email: normalizedEmail,
        passwordHash,
        status: dto.status || CustomerStatus.ACTIVE,
      },
      select: safeCustomerSelect,
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Customer record not found.');
    }

    const dataToUpdate: Prisma.CustomerUpdateInput = {};

    if (dto.name) {
      dataToUpdate.name = dto.name.trim();
    }

    if (dto.email && dto.email.toLowerCase().trim() !== existing.email) {
      const normalizedEmail = dto.email.toLowerCase().trim();

      const [existingAdmin, otherCustomer] = await Promise.all([
        this.prisma.admin.findUnique({ where: { email: normalizedEmail } }),
        this.prisma.customer.findFirst({
          where: {
            email: normalizedEmail,
            id: { not: id },
          },
        }),
      ]);

      if (existingAdmin || otherCustomer) {
        throw new BadRequestException('Email is already in use by another account.');
      }

      dataToUpdate.email = normalizedEmail;
    }

    if (dto.status) {
      dataToUpdate.status = dto.status;
    }

    return this.prisma.customer.update({
      where: { id },
      data: dataToUpdate,
      select: safeCustomerSelect,
    });
  }

  async updateStatus(id: string, status: CustomerStatus) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Customer record not found.');
    }

    return this.prisma.customer.update({
      where: { id },
      data: { status },
      select: safeCustomerSelect,
    });
  }

  async delete(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            applications: true,
            documents: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer record not found.');
    }

    if (customer._count.applications > 0 || customer._count.documents > 0) {
      throw new BadRequestException(
        'Cannot delete customer with existing applications or documents. Deactivate the customer account instead to preserve records.'
      );
    }

    await this.prisma.customer.delete({ where: { id } });
    return { success: true, message: 'Customer record deleted successfully.' };
  }
}
