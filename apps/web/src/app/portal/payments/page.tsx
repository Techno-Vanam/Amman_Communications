'use client';

import React from 'react';
import Link from 'next/link';
import { mockPayments } from '@/lib/mockPayments';
import { Eye, Download } from 'lucide-react';

export default function PaymentsPage() {
  const handlePrint = (paymentId: string) => {
    // Open the receipt view page in a new window/tab and trigger print, or do it inline.
    // For convenience, we open a print-optimized window or let them click view receipt and click print.
    window.open(`/portal/payments/${paymentId}?print=true`, '_blank');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Customer portal</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Payments & Receipts</h1>
      <p className="mt-3 text-gray-600">View and download receipts for all your application payments.</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4">Receipt No</th>
                <th scope="col" className="px-6 py-4">Application</th>
                <th scope="col" className="px-6 py-4">Date</th>
                <th scope="col" className="px-6 py-4">Amount</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {mockPayments.map((payment) => (
                <tr key={payment.receiptNumber} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                    {payment.receiptNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs">
                    {payment.applicationNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {payment.paymentDate}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                    ₹{payment.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/portal/payments/${payment.receiptNumber}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        <Eye className="h-3.5 w-3.5 text-gray-400" />
                        View
                      </Link>
                      <button
                        onClick={() => handlePrint(payment.receiptNumber)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        <Download className="h-3.5 w-3.5 text-gray-400" />
                        Download PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
