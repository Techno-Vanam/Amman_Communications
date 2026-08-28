import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, PaymentMethod, Prisma } from '@prisma/client';
import { FinanceService } from './finance.service';

test('FinanceService.createInvoice calculates totalAmount correctly', async () => {
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

  assert.equal(result.totalAmount, 1000);
  assert.equal(result.governmentFee, 250);
  assert.equal(result.serviceFee, 750);
  assert.equal(result.status, InvoiceStatus.UNPAID);
  assert.match(result.invoiceNumber, /^INV-\d{6}-\d{4}$/);
});

test('FinanceService.createInvoice rejects invalid customer', async () => {
  const prisma = {
    customer: {
      findUnique: async () => null,
    },
  };

  const service = new FinanceService(prisma as never);
  await assert.rejects(
    () => service.createInvoice({
      customerId: 'missing-cust',
      governmentFee: 100,
      serviceFee: 200,
    }),
    NotFoundException
  );
});

test('FinanceService.recordPayment transitions invoice from UNPAID to PARTIALLY_PAID and PAID', async () => {
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

  assert.equal(pay1.amount, 400);
  assert.equal(updatedInvoiceStatus, InvoiceStatus.PARTIALLY_PAID);
});

test('FinanceService.recordPayment rejects payment on cancelled invoice', async () => {
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
  await assert.rejects(
    () => service.recordPayment('inv-cancelled', {
      amount: 100,
      paymentMethod: PaymentMethod.CASH,
    }),
    BadRequestException
  );
});
