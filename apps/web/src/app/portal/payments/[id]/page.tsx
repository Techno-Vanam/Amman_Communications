'use client';

import React, { useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mockPayments } from '@/lib/mockPayments';
import { PaymentReceipt } from '@/components/portal/PaymentReceipt';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default function ReceiptDetailPage({ params }: ReceiptPageProps) {
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;

  const payment = mockPayments.find((p) => p.receiptNumber === paymentId);

  useEffect(() => {
    // If the print query parameter is present, automatically trigger print
    if (searchParams.get('print') === 'true' && payment) {
      // Small timeout to ensure font loading and rendering completed
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, payment]);

  if (!payment) {
    return (
      <div className="mx-auto max-w-3xl text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Receipt Not Found</h1>
        <p className="mt-2 text-gray-600">The requested payment receipt does not exist.</p>
        <Link
          href="/portal/payments"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-3xl print:max-w-none print:p-0">
      {/* Action Bar (hidden when printing) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/portal/payments"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            <Printer className="h-4 w-4 text-gray-500" />
            Print
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 focus:outline-none"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Reusable receipt wrapper */}
      <div className="print:m-0 print:border-none print:shadow-none">
        <PaymentReceipt data={payment} />
      </div>
    </div>
  );
}
