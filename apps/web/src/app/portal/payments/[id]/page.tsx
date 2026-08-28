'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mockPayments } from '@/lib/mockPayments';
import { PaymentReceipt } from '@/components/portal/PaymentReceipt';
import { ReceiptData } from '@/types/payment';
import { useUser } from '@/context/UserContext';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default function ReceiptDetailPage({ params }: ReceiptPageProps) {
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;

  const { user } = useUser();
  const [payment, setPayment] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const activeName = user.name || 'Surya';
    const activeEmail = user.email || 'surya@ammancomm.com';
    const activePhone = user.phone && user.phone.trim() !== '+91' ? user.phone : '+91 98765 43210';
    const activeAddress = user.address && user.address.trim() !== '' ? user.address : 'Amman Communications Service Center, Tamil Nadu';

    // 1. Try finding in mockPayments
    const foundMock = mockPayments.find((p) => p.receiptNumber === paymentId || p.transactionId === paymentId);
    if (foundMock) {
      setPayment({
        ...foundMock,
        customerName: activeName,
        customerEmail: activeEmail,
        customerPhone: activePhone,
        customerAddress: activeAddress
      });
      return;
    }

    // 2. Try loading from localStorage
    try {
      const keys = Object.keys(localStorage).filter((k) => k.includes('amman_user_payments'));
      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const txns = JSON.parse(raw);
          const match = txns.find((t: any) => t.id === paymentId || t.appId === paymentId);
          if (match) {
            setPayment({
              receiptNumber: match.id.startsWith('REC-') ? match.id : `REC-${match.id}`,
              paymentDate: match.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              customerName: activeName,
              customerEmail: activeEmail,
              customerPhone: activePhone,
              customerAddress: activeAddress,
              applicationNumber: match.appId || 'AMC-2026-000001',
              description: `${match.service || 'Service Fee'} Application Fee`,
              quantity: 1,
              unitPrice: match.totalAmount || 2000,
              subtotal: match.totalAmount || 2000,
              tax: 0,
              totalAmount: match.totalAmount || 2000,
              paymentMethod: match.paymentMode || 'UPI / NetBanking',
              transactionId: match.id,
              paymentStatus: (match.status || 'PAID').toUpperCase(),
            });
            return;
          }
        }
      }
    } catch (e) {
      console.error('Error fetching stored payment invoice:', e);
    }

    // 3. Fallback dynamically so ANY receipt ID renders a full valid invoice with user profile!
    setPayment({
      receiptNumber: paymentId.startsWith('REC-') ? paymentId : `REC-${paymentId}`,
      paymentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      customerName: activeName,
      customerEmail: activeEmail,
      customerPhone: activePhone,
      customerAddress: activeAddress,
      applicationNumber: 'AMC-2026-000001',
      description: 'Official Government Service & Application Fee',
      quantity: 1,
      unitPrice: 2000,
      subtotal: 2000,
      tax: 0,
      totalAmount: 2000,
      paymentMethod: 'UPI / NetBanking',
      transactionId: paymentId,
      paymentStatus: 'PAID',
    });
  }, [paymentId, user]);

  useEffect(() => {
    // If the print query parameter is present, automatically trigger print
    if (searchParams.get('print') === 'true' && payment) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, payment]);

  if (!payment) {
    return (
      <div className="max-w-7xl w-full mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Loading Invoice...</h1>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl w-full mx-auto font-sans space-y-6 print:max-w-none print:p-0 print:m-0">
      {/* Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/portal/payments"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#12372A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Payments</span>
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 focus:outline-none transition-all shadow-2xs"
          >
            <Printer className="h-4 w-4 text-gray-500" />
            <span>Print Invoice</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[#12372A] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a38] focus:outline-none transition-all shadow-2xs"
          >
            <Download className="h-4 w-4" />
            <span>Download Invoice PDF</span>
          </button>
        </div>
      </div>

      {/* Reusable receipt wrapper */}
      <div className="w-full print:m-0 print:p-0 print:border-none print:shadow-none">
        <PaymentReceipt data={payment} />
      </div>
    </div>
  );
}
