'use client';

import React from 'react';
import { mockPayments } from '@/lib/mockPayments';
import { PaymentReceipt } from '@/components/customer/PaymentReceipt';

export default function TempReceiptPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Receipt Design Template Preview</h1>
        <p className="text-gray-500 text-sm mt-1">
          This is a public preview route for testing the payment receipt component.
        </p>
      </div>
      <PaymentReceipt data={mockPayments[0]} />
    </div>
  );
}
