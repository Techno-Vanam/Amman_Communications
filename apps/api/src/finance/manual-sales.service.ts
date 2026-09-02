import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManualSaleDto } from './dto/manual-sale.dto';
import { PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class ManualSalesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateSaleNumber(): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `MS-${yearMonth}-`;

    const lastSale = await this.prisma.manualSale.findFirst({
      where: { saleNumber: { startsWith: prefix } },
      orderBy: { saleNumber: 'desc' },
      select: { saleNumber: true },
    });

    if (!lastSale) {
      return `${prefix}0001`;
    }

    const lastSeq = parseInt(lastSale.saleNumber.replace(prefix, ''), 10);
    const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  async create(dto: CreateManualSaleDto) {
    const saleNumber = await this.generateSaleNumber();

    const result = await this.prisma.manualSale.create({
      data: {
        saleNumber,
        customerName: dto.customerName,
        customerPhone: dto.phoneNumber || null,
        category: dto.category,
        amount: new Prisma.Decimal(dto.amount),
        details: dto.details || null,
        status: PaymentStatus.PAID,
        paymentMethod: dto.paymentMethod || 'CASH',
      },
    });

    return {
      ...result,
      amount: result.amount.toNumber(),
    };
  }

  async findAll(query: { search?: string }) {
    const where: Prisma.ManualSaleWhereInput = {};

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { saleNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.manualSale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return items.map(item => ({
      ...item,
      amount: item.amount.toNumber(),
    }));
  }
}
