import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { FinanceSummaryQueryDto, InvoiceQueryDto, PaymentQueryDto } from './dto/finance-query.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

type DbClient = Prisma.TransactionClient | PrismaService;

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a sequential invoice number like INV-202608-0001
   */
  private async generateInvoiceNumber(tx?: DbClient): Promise<string> {
    const db = tx || this.prisma;
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `INV-${yearMonth}-`;

    const lastInvoice = await db.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    if (!lastInvoice) {
      return `${prefix}0001`;
    }

    const lastSeq = parseInt(lastInvoice.invoiceNumber.replace(prefix, ''), 10);
    const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * Generates a sequential payment number like PAY-202608-0001
   */
  private async generatePaymentNumber(tx?: DbClient): Promise<string> {
    const db = tx || this.prisma;
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `PAY-${yearMonth}-`;

    const lastPayment = await db.payment.findFirst({
      where: { paymentNumber: { startsWith: prefix } },
      orderBy: { paymentNumber: 'desc' },
      select: { paymentNumber: true },
    });

    if (!lastPayment) {
      return `${prefix}0001`;
    }

    const lastSeq = parseInt(lastPayment.paymentNumber.replace(prefix, ''), 10);
    const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * Aggregate Finance Summary with date-range filtering
   */
  async getSummary(query: FinanceSummaryQueryDto = {}) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (query.from) dateFilter.gte = new Date(query.from);
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.lte = toDate;
    }
    const hasDate = Object.keys(dateFilter).length > 0;

    const [invoices, payments] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          ...(hasDate ? { createdAt: dateFilter } : {}),
          status: { not: InvoiceStatus.CANCELLED },
        },
        include: {
          payments: {
            where: { status: PaymentStatus.PAID },
            select: { amount: true },
          },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          ...(hasDate ? { paidAt: dateFilter } : {}),
          status: PaymentStatus.PAID,
        },
        select: { amount: true },
      }),
    ]);

    let totalInvoiced = new Prisma.Decimal(0);
    let totalGovtFees = new Prisma.Decimal(0);
    let totalServiceFees = new Prisma.Decimal(0);
    let totalOverdue = new Prisma.Decimal(0);
    const now = new Date();

    for (const inv of invoices) {
      totalInvoiced = totalInvoiced.add(inv.totalAmount);
      totalGovtFees = totalGovtFees.add(inv.governmentFee);
      totalServiceFees = totalServiceFees.add(inv.serviceFee);

      const paidForInv = inv.payments.reduce(
        (acc, p) => acc.add(p.amount),
        new Prisma.Decimal(0)
      );
      const outstanding = inv.totalAmount.sub(paidForInv);

      if (outstanding.gt(0) && inv.dueDate && new Date(inv.dueDate) < now) {
        totalOverdue = totalOverdue.add(outstanding);
      }
    }

    const totalPaid = payments.reduce(
      (acc, p) => acc.add(p.amount),
      new Prisma.Decimal(0)
    );

    const totalOutstanding = Prisma.Decimal.max(
      new Prisma.Decimal(0),
      totalInvoiced.sub(totalPaid)
    );

    const invoiceCount = await this.prisma.invoice.count({
      where: hasDate ? { createdAt: dateFilter } : {},
    });

    const paymentCount = await this.prisma.payment.count({
      where: hasDate ? { paidAt: dateFilter } : {},
    });

    return {
      period: {
        from: query.from || null,
        to: query.to || null,
      },
      totalInvoiced: totalInvoiced.toNumber(),
      totalPaid: totalPaid.toNumber(),
      totalOutstanding: totalOutstanding.toNumber(),
      totalOverdue: totalOverdue.toNumber(),
      governmentFeesTotal: totalGovtFees.toNumber(),
      serviceFeesTotal: totalServiceFees.toNumber(),
      invoiceCount,
      paymentCount,
    };
  }

  /**
   * List paginated invoices with search and filters
   */
  async findAllInvoices(query: InvoiceQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) {
        const toDate = new Date(query.to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          service: {
            select: { id: true, name: true },
          },
          application: {
            select: { id: true },
          },
          payments: {
            where: { status: PaymentStatus.PAID },
            select: { id: true, amount: true, paidAt: true, paymentMethod: true, reference: true },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const formattedItems = items.map((inv) => {
      const totalPaid = inv.payments.reduce(
        (acc, p) => acc.add(p.amount),
        new Prisma.Decimal(0)
      );
      const outstanding = Prisma.Decimal.max(new Prisma.Decimal(0), inv.totalAmount.sub(totalPaid));

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customerId,
        customer: inv.customer,
        serviceId: inv.serviceId,
        service: inv.service,
        applicationId: inv.applicationId,
        governmentFee: inv.governmentFee.toNumber(),
        serviceFee: inv.serviceFee.toNumber(),
        totalAmount: inv.totalAmount.toNumber(),
        paidAmount: totalPaid.toNumber(),
        outstandingAmount: outstanding.toNumber(),
        status: inv.status,
        dueDate: inv.dueDate,
        notes: inv.notes,
        paymentsCount: inv.payments.length,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      };
    });

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Find single invoice with full details & payment history
   */
  async findOneInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true, status: true },
        },
        service: {
          select: { id: true, name: true, description: true },
        },
        application: {
          select: { id: true, createdAt: true },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID "${id}" not found.`);
    }

    const totalPaid = invoice.payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((acc, p) => acc.add(p.amount), new Prisma.Decimal(0));

    const outstanding = Prisma.Decimal.max(
      new Prisma.Decimal(0),
      invoice.totalAmount.sub(totalPaid)
    );

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customer: invoice.customer,
      serviceId: invoice.serviceId,
      service: invoice.service,
      applicationId: invoice.applicationId,
      application: invoice.application,
      governmentFee: invoice.governmentFee.toNumber(),
      serviceFee: invoice.serviceFee.toNumber(),
      totalAmount: invoice.totalAmount.toNumber(),
      paidAmount: totalPaid.toNumber(),
      outstandingAmount: outstanding.toNumber(),
      status: invoice.status,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      payments: invoice.payments.map((p) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        amount: p.amount.toNumber(),
        paymentMethod: p.paymentMethod,
        status: p.status,
        reference: p.reference,
        notes: p.notes,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  /**
   * Create an invoice
   */
  async createInvoice(dto: CreateInvoiceDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID "${dto.customerId}" not found.`);
    }

    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });
      if (!service) {
        throw new NotFoundException(`Service with ID "${dto.serviceId}" not found.`);
      }
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const governmentFee = new Prisma.Decimal(dto.governmentFee);
    const serviceFee = new Prisma.Decimal(dto.serviceFee);
    const totalAmount = governmentFee.add(serviceFee);

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: dto.customerId,
        serviceId: dto.serviceId || null,
        applicationId: dto.applicationId || null,
        governmentFee,
        serviceFee,
        totalAmount,
        status: InvoiceStatus.UNPAID,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        notes: dto.notes || null,
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true } },
      },
    });

    return {
      ...invoice,
      governmentFee: invoice.governmentFee.toNumber(),
      serviceFee: invoice.serviceFee.toNumber(),
      totalAmount: invoice.totalAmount.toNumber(),
      paidAmount: 0,
      outstandingAmount: invoice.totalAmount.toNumber(),
    };
  }

  /**
   * Update invoice details
   */
  async updateInvoice(id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        payments: {
          where: { status: PaymentStatus.PAID },
          select: { amount: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Invoice with ID "${id}" not found.`);
    }

    const data: Prisma.InvoiceUpdateInput = {};

    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.status !== undefined) data.status = dto.status;

    let newGovFee = existing.governmentFee;
    let newSvcFee = existing.serviceFee;
    let feeChanged = false;

    if (dto.governmentFee !== undefined) {
      newGovFee = new Prisma.Decimal(dto.governmentFee);
      data.governmentFee = newGovFee;
      feeChanged = true;
    }

    if (dto.serviceFee !== undefined) {
      newSvcFee = new Prisma.Decimal(dto.serviceFee);
      data.serviceFee = newSvcFee;
      feeChanged = true;
    }

    if (feeChanged) {
      const newTotal = newGovFee.add(newSvcFee);
      const totalPaid = existing.payments.reduce(
        (acc, p) => acc.add(p.amount),
        new Prisma.Decimal(0)
      );

      if (newTotal.lt(totalPaid)) {
        throw new BadRequestException(
          `Cannot reduce invoice total (${newTotal}) below already paid amount (${totalPaid}).`
        );
      }

      data.totalAmount = newTotal;

      // Automatically update status if not explicitly overridden
      if (dto.status === undefined) {
        if (totalPaid.gte(newTotal)) {
          data.status = InvoiceStatus.PAID;
        } else if (totalPaid.gt(0)) {
          data.status = InvoiceStatus.PARTIALLY_PAID;
        } else {
          data.status = InvoiceStatus.UNPAID;
        }
      }
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true } },
      },
    });

    return {
      ...updated,
      governmentFee: updated.governmentFee.toNumber(),
      serviceFee: updated.serviceFee.toNumber(),
      totalAmount: updated.totalAmount.toNumber(),
    };
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(id: string, status: InvoiceStatus) {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Invoice with ID "${id}" not found.`);
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Record a payment against an invoice inside a transaction
   */
  async recordPayment(invoiceId: string, dto: RecordPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          payments: {
            where: { status: PaymentStatus.PAID },
            select: { amount: true },
          },
          application: { select: { id: true, status: true } },
        },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID "${invoiceId}" not found.`);
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestException('Cannot record payment for a cancelled invoice.');
      }

      const paymentNumber = await this.generatePaymentNumber(tx);
      const paymentAmount = new Prisma.Decimal(dto.amount);
      const paymentStatus = dto.status || PaymentStatus.PAID;

      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          amount: paymentAmount,
          paymentMethod: dto.paymentMethod,
          status: paymentStatus,
          reference: dto.reference || null,
          notes: dto.notes || null,
          paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        },
      });

      // Recalculate invoice status if this payment is marked as PAID
      if (paymentStatus === PaymentStatus.PAID) {
        const existingPaid = invoice.payments.reduce(
          (acc, p) => acc.add(p.amount),
          new Prisma.Decimal(0)
        );
        const newTotalPaid = existingPaid.add(paymentAmount);

        let newStatus: InvoiceStatus;
        if (newTotalPaid.gte(invoice.totalAmount)) {
          newStatus = InvoiceStatus.PAID;
        } else if (newTotalPaid.gt(0)) {
          newStatus = InvoiceStatus.PARTIALLY_PAID;
        } else {
          newStatus = invoice.status;
        }

        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: newStatus },
        });

        // Automatically advance application if paid
        if (invoice.applicationId && (newStatus === InvoiceStatus.PAID || newStatus === InvoiceStatus.PARTIALLY_PAID)) {
          // You could also check if it's currently in PENDING_PAYMENT or DRAFT
          await tx.application.update({
            where: { id: invoice.applicationId },
            data: { status: 'UNDER_REVIEW' },
          });
        }
      }

      return {
        id: payment.id,
        paymentNumber: payment.paymentNumber,
        invoiceId: payment.invoiceId,
        customerId: payment.customerId,
        amount: payment.amount.toNumber(),
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        reference: payment.reference,
        notes: payment.notes,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      };
    });
  }

  /**
   * List paginated payments with search and filters
   */
  async findAllPayments(query: PaymentQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.paidAt = {};
      if (query.from) where.paidAt.gte = new Date(query.from);
      if (query.to) {
        const toDate = new Date(query.to);
        toDate.setHours(23, 59, 59, 999);
        where.paidAt.lte = toDate;
      }
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { paymentNumber: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paidAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          invoice: { select: { id: true, invoiceNumber: true, totalAmount: true, status: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    const formattedItems = items.map((p) => ({
      id: p.id,
      paymentNumber: p.paymentNumber,
      invoiceId: p.invoiceId,
      invoiceNumber: p.invoice.invoiceNumber,
      invoiceTotal: p.invoice.totalAmount.toNumber(),
      invoiceStatus: p.invoice.status,
      customerId: p.customerId,
      customer: p.customer,
      amount: p.amount.toNumber(),
      paymentMethod: p.paymentMethod,
      status: p.status,
      reference: p.reference,
      notes: p.notes,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Find single payment
   */
  async findOnePayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        invoice: { select: { id: true, invoiceNumber: true, totalAmount: true, status: true, service: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID "${id}" not found.`);
    }

    return {
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      invoiceId: payment.invoiceId,
      invoice: payment.invoice,
      customerId: payment.customerId,
      customer: payment.customer,
      amount: payment.amount.toNumber(),
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      reference: payment.reference,
      notes: payment.notes,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    };
  }
}
