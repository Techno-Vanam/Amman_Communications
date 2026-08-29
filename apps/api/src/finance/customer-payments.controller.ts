import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

interface RequestWithUser {
  user: {
    customerId?: string;
    sub?: string;
    role?: string;
  };
}

export class CreateCustomerPaymentDto {
  @IsString()
  applicationId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  governmentFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceFee?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  paymentMode?: string; // User-facing label like "UPI / NetBanking"
}

@ApiTags('Customer Payments')
@ApiBearerAuth()
@Controller('customer/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class CustomerPaymentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financeService: FinanceService,
  ) {}

  /**
   * GET /customer/payments — List all invoices+payments for the logged-in customer
   */
  @Get()
  async listPayments(@Req() req: RequestWithUser) {
    const customerId = req.user.customerId || req.user.sub || '';

    const invoices = await this.prisma.invoice.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        application: {
          select: { id: true, applicationNumber: true, serviceType: true },
        },
        service: {
          select: { id: true, name: true },
        },
        payments: {
          where: { status: PaymentStatus.PAID },
          select: { id: true, amount: true, paymentMethod: true, reference: true, paidAt: true },
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    return invoices.map((inv) => {
      const totalPaid = inv.payments.reduce(
        (acc, p) => acc.add(p.amount),
        new Prisma.Decimal(0),
      );
      const outstanding = Prisma.Decimal.max(
        new Prisma.Decimal(0),
        inv.totalAmount.sub(totalPaid),
      );

      // Determine user-facing payment mode from first payment
      const firstPayment = inv.payments[0];
      let paymentMode = 'Pending';
      if (firstPayment) {
        const methodMap: Record<string, string> = {
          CASH: 'Cash',
          BANK_TRANSFER: 'Bank Transfer',
          CREDIT_CARD: 'Credit Card',
          DEBIT_CARD: 'Debit Card',
          UPI: 'UPI / NetBanking',
          CHEQUE: 'Cheque',
          OTHER: 'Other',
        };
        paymentMode = methodMap[firstPayment.paymentMethod] || firstPayment.paymentMethod;
      }

      return {
        id: inv.invoiceNumber,
        invoiceId: inv.id,
        appId: inv.application?.applicationNumber || inv.applicationId || '',
        service: inv.application?.serviceType || inv.service?.name || 'Service',
        totalAmount: inv.totalAmount.toNumber(),
        paidAmount: totalPaid.toNumber(),
        pendingAmount: outstanding.toNumber(),
        paymentMode,
        status: outstanding.gt(0) ? (totalPaid.gt(0) ? 'Partial' : 'Pending') : 'Paid',
        date: inv.createdAt.toISOString().split('T')[0],
        reference: firstPayment?.reference || null,
      };
    });
  }

  /**
   * POST /customer/payments — Create an invoice + record payment for an application
   */
  @Post()
  async createPayment(@Req() req: RequestWithUser, @Body() dto: CreateCustomerPaymentDto) {
    const customerId = req.user.customerId || req.user.sub || '';

    // Verify the application belongs to this customer
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
    });

    if (!application || application.customerId !== customerId) {
      throw new Error('Application not found or access denied');
    }

    // Check if invoice already exists for this application
    const existingInvoice = await this.prisma.invoice.findFirst({
      where: { applicationId: dto.applicationId, customerId },
    });

    if (existingInvoice) {
      // Already has an invoice — just return it
      return { message: 'Invoice already exists', invoiceId: existingInvoice.id };
    }

    // Map user-facing payment mode to Prisma enum
    const paymentMethodMap: Record<string, PaymentMethod> = {
      'Cash': PaymentMethod.CASH,
      'Cash (Pay at Office)': PaymentMethod.CASH,
      'Bank Transfer': PaymentMethod.BANK_TRANSFER,
      'Credit Card': PaymentMethod.CREDIT_CARD,
      'UPI / NetBanking': PaymentMethod.UPI,
      'Wire Transfer': PaymentMethod.BANK_TRANSFER,
    };
    const paymentMethod = dto.paymentMethod
      || (dto.paymentMode ? paymentMethodMap[dto.paymentMode] || PaymentMethod.OTHER : PaymentMethod.UPI);

    const govFee = dto.governmentFee || 0;
    const svcFee = dto.serviceFee || dto.amount;

    // 1. Create invoice
    const invoice = await this.financeService.createInvoice({
      customerId,
      applicationId: dto.applicationId,
      governmentFee: govFee,
      serviceFee: svcFee,
    });

    // 2. Record payment if amount > 0
    if (dto.amount > 0) {
      await this.financeService.recordPayment(invoice.id, {
        amount: dto.amount,
        paymentMethod,
        status: PaymentStatus.PAID,
        reference: dto.reference || undefined,
      });
    }

    return {
      message: 'Payment recorded successfully',
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    };
  }
}
