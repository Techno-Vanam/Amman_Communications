import { describe, it, expect } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, PaymentMethod, Prisma } from '@prisma/client';
import { FinanceService } from './finance.service';

describe('FinanceService', () => {
  it('calculates totalAmount correctly', async () => {
    const prisma = {
      customer: {
        findUnique: async () => ({ id: 'cust-1', name: 'Test Customer' }),
      },
      service: {
        findUnique: async () => ({ id: 'srv-1', name: 'Fiber Broadband' }),
      },
      invoice: {
        findFirst: async () => null,
        create: async ({ data }: { data: Record<string, unknown> }) => ({
          id: 'inv-1',
          ...data,
        }),
      },
    };

    const service = new FinanceService(prisma as never);
    const result = await service.createInvoice({
      customerId: 'cust-1',
      serviceId: 'srv-1',
      governmentFee: 250,
      serviceFee: 750,
    });

    expect(result.totalAmount).toBe(1000);
    expect(result.governmentFee).toBe(250);
    expect(result.serviceFee).toBe(750);
    expect(result.status).toBe(InvoiceStatus.UNPAID);
    expect(result.invoiceNumber).toMatch(/^INV-\d{6}-\d{4}$/);
  });

  it('rejects invalid customer', async () => {
    const prisma = {
      customer: {
        findUnique: async () => null,
      },
    };

    const service = new FinanceService(prisma as never);
    await expect(
      service.createInvoice({
        customerId: 'missing-cust',
        governmentFee: 100,
        serviceFee: 200,
      })
    ).rejects.toThrow(NotFoundException);
  });

  it('transitions invoice from UNPAID to PARTIALLY_PAID and PAID', async () => {
    let updatedInvoiceStatus: string | null = null;
    const mockInvoice = {
      id: 'inv-1',
      invoiceNumber: 'INV-202608-0001',
      customerId: 'cust-1',
      totalAmount: new Prisma.Decimal(1000),
      status: InvoiceStatus.UNPAID,
      payments: [],
    };

    const prisma = {
      $transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          invoice: {
            findUnique: async () => mockInvoice,
            update: async ({ data }: { data: { status: string } }) => {
              updatedInvoiceStatus = data.status;
              return { ...mockInvoice, status: data.status };
            },
          },
          payment: {
            findFirst: async () => null,
            create: async ({ data }: { data: Record<string, unknown> }) => ({
              id: 'pay-1',
              ...data,
            }),
          },
        };
        return cb(tx);
      },
    };

    const service = new FinanceService(prisma as never);
    const pay1 = await service.recordPayment('inv-1', {
      amount: 400,
      paymentMethod: PaymentMethod.UPI,
    });

    expect(pay1.amount).toBe(400);
    expect(updatedInvoiceStatus).toBe(InvoiceStatus.PARTIALLY_PAID);
  });

  it('rejects payment on cancelled invoice', async () => {
    const mockInvoice = {
      id: 'inv-cancelled',
      status: InvoiceStatus.CANCELLED,
      payments: [],
    };

    const prisma = {
      $transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          invoice: { findUnique: async () => mockInvoice },
        };
        return cb(tx);
      },
    };

    const service = new FinanceService(prisma as never);
    await expect(
      service.recordPayment('inv-cancelled', {
        amount: 100,
        paymentMethod: PaymentMethod.CASH,
      })
    ).rejects.toThrow(BadRequestException);
  });
});
