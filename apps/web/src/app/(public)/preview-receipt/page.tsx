'use client';

import React from 'react';
import { PaymentReceipt } from '@/components/portal/PaymentReceipt';
import { ReceiptData } from '@/types/payment';

const defaultReceipt: ReceiptData = {
  receiptNumber: 'REC-2026-0001',
  paymentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  customerName: 'Customer Name',
  customerEmail: 'customer@example.com',
  customerPhone: '+91 98765 43210',
  customerAddress: 'Amman Communications Service Center',
  applicationNumber: 'APP-2026-0001',
  description: 'Communications Service Application Fee',
  quantity: 1,
  unitPrice: 2000,
  subtotal: 2000,
  tax: 0,
  totalAmount: 2000,
  paymentMethod: 'Online Payment',
  transactionId: 'TXN-PREVIEW-001',
  paymentStatus: 'PAID',
};

export default function TempReceiptPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Receipt Design Template Preview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Standard invoice and receipt formatting layout
        </p>
      </div>
      <PaymentReceipt data={defaultReceipt} />
    </div>
  );
}
