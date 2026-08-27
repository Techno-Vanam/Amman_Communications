'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  Printer,
  RefreshCw,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  InvoiceItem,
  PaymentMethod,
} from '@/lib/api/finance';
import {
  fetchInvoiceById,
  recordPaymentAction,
  updateInvoiceStatusAction,
} from '../../actions';
import CustomSelect from '@/components/CustomSelect';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [invoice, setInvoice] = useState<InvoiceItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [payReference, setPayReference] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadInvoice = async () => {
    setLoading(true);
    const res = await fetchInvoiceById(id);
    if (res.invoice) {
      setInvoice(res.invoice);
      setPayAmount(String(res.invoice.outstandingAmount > 0 ? res.invoice.outstandingAmount : res.invoice.totalAmount));
    } else {
      setError(res.error || 'Failed to load invoice.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setFormError(null);

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Payment amount must be greater than zero.');
      return;
    }

    setSubmitting(true);
    const res = await recordPaymentAction(invoice.id, {
      amount: amountNum,
      paymentMethod: payMethod,
      reference: payReference || undefined,
      notes: payNotes || undefined,
      paidAt: payDate ? new Date(payDate).toISOString() : undefined,
    });

    if (res.error) {
      setFormError(res.error);
    } else {
      setIsPaymentModalOpen(false);
      setSuccessMessage(`Payment recorded successfully.`);
      loadInvoice();
    }
    setSubmitting(false);
  };

  const handleCancelInvoice = async () => {
    if (!invoice) return;
    if (!confirm(`Are you sure you want to cancel Invoice "${invoice.invoiceNumber}"?`)) return;
    const res = await updateInvoiceStatusAction(invoice.id, 'CANCELLED');
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(`Invoice cancelled.`);
      loadInvoice();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-800" />
        <p className="mt-3 text-sm font-semibold text-gray-700">Loading invoice details...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
          <ShieldAlert className="h-10 w-10 text-red-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-red-950">Invoice Error</h2>
          <p className="text-sm text-red-800 mt-1">{error || 'Invoice not found.'}</p>
          <Link
            href="/admin/finance"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-red-800 text-white hover:bg-red-900 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Finance
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top action bar (Back, Print, Actions) */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/admin/finance"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Finance Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            <Printer className="h-3.5 w-3.5" /> Print Invoice
          </button>

          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={() => {
                setPayAmount(String(invoice.outstandingAmount));
                setPayDate(new Date().toISOString().split('T')[0]);
                setIsPaymentModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 shadow-sm transition"
            >
              <Banknote className="h-3.5 w-3.5" /> Record Payment
            </button>
          )}

          {invoice.status !== 'CANCELLED' && invoice.paidAmount === 0 && (
            <button
              type="button"
              onClick={handleCancelInvoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition"
            >
              <X className="h-3.5 w-3.5" /> Cancel Invoice
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Printable Invoice Card */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-8 md:p-12 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-200 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-900 flex items-center justify-center text-white font-bold text-sm">
                AC
              </div>
              <h2 className="text-xl font-bold text-gray-900">Amman Communications</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">High-Speed Broadband & Telecom Solutions</p>
            <p className="text-xs text-gray-400">official@ammancommunications.com</p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Tax Invoice</p>
            <h1 className="text-2xl font-bold font-mono text-gray-900 mt-0.5">{invoice.invoiceNumber}</h1>
            <div className="mt-2 inline-block">
              {invoice.status === 'PAID' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> PAID IN FULL
                </span>
              )}
              {invoice.status === 'PARTIALLY_PAID' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
                  <Clock className="h-3.5 w-3.5 text-blue-600" /> PARTIALLY PAID
                </span>
              )}
              {invoice.status === 'UNPAID' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                  <Clock className="h-3.5 w-3.5 text-amber-600" /> UNPAID
                </span>
              )}
              {invoice.status === 'OVERDUE' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-800 border border-red-200">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-600" /> OVERDUE
                </span>
              )}
              {invoice.status === 'CANCELLED' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                  CANCELLED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Metadata (Billed To & Dates) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Billed To</p>
            <p className="font-bold text-gray-900 text-base">{invoice.customer.name}</p>
            <p className="text-gray-600 text-xs mt-0.5">{invoice.customer.email}</p>
            {invoice.customer.phone && (
              <p className="text-gray-600 text-xs font-mono mt-0.5">{invoice.customer.phone}</p>
            )}
            <p className="text-gray-400 text-[11px] font-mono mt-1">Customer ID: {invoice.customerId}</p>
          </div>

          <div className="sm:text-right space-y-1 text-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Invoice Dates</p>
            <p className="text-gray-600">
              <span className="text-gray-400">Issue Date:</span>{' '}
              <span className="font-semibold text-gray-800">
                {new Date(invoice.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </span>
            </p>
            {invoice.dueDate && (
              <p className="text-gray-600">
                <span className="text-gray-400">Due Date:</span>{' '}
                <span className="font-semibold text-gray-800">
                  {new Date(invoice.dueDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </span>
              </p>
            )}
            {invoice.service && (
              <p className="text-gray-600">
                <span className="text-gray-400">Service:</span>{' '}
                <span className="font-semibold text-emerald-900">{invoice.service.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Financial Charge Table */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">#</th>
                <th className="px-6 py-3.5">Item & Description</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono text-xs">
              <tr>
                <td className="px-6 py-4 text-gray-400">1</td>
                <td className="px-6 py-4 font-sans font-semibold text-gray-900">
                  Government & Regulatory Fee
                  <p className="text-xs font-normal text-gray-500">Statutory and licensing levies</p>
                </td>
                <td className="px-6 py-4 font-sans text-gray-600">Government Levy</td>
                <td className="px-6 py-4 text-right text-gray-900 font-bold">₹{invoice.governmentFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-gray-400">2</td>
                <td className="px-6 py-4 font-sans font-semibold text-gray-900">
                  {invoice.service?.name || 'Service & Connection Charges'}
                  <p className="text-xs font-normal text-gray-500">Installation, equipment, & processing fee</p>
                </td>
                <td className="px-6 py-4 font-sans text-gray-600">Service Fee</td>
                <td className="px-6 py-4 text-right text-gray-900 font-bold">₹{invoice.serviceFee.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50/80 border-t border-gray-200 text-sm">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right font-bold text-gray-700">
                  Total Invoiced:
                </td>
                <td className="px-6 py-3 text-right font-mono font-bold text-gray-900">
                  ₹{invoice.totalAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right font-bold text-emerald-800">
                  Amount Paid:
                </td>
                <td className="px-6 py-3 text-right font-mono font-bold text-emerald-800">
                  - ₹{invoice.paidAmount.toFixed(2)}
                </td>
              </tr>
              <tr className="border-t-2 border-emerald-800 text-base font-bold bg-emerald-50/50">
                <td colSpan={3} className="px-6 py-4 text-right text-emerald-950 font-sans">
                  Remaining Balance Due:
                </td>
                <td className="px-6 py-4 text-right font-mono text-emerald-950">
                  ₹{invoice.outstandingAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment History Audit */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Payment & Transaction History ({invoice.payments?.length || 0})
          </h3>
          {invoice.payments && invoice.payments.length > 0 ? (
            <div className="rounded-2xl border border-gray-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 font-semibold text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5">Payment #</th>
                    <th className="px-4 py-2.5">Amount</th>
                    <th className="px-4 py-2.5">Method</th>
                    <th className="px-4 py-2.5">Reference</th>
                    <th className="px-4 py-2.5">Paid Date</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.payments.map((p) => (
                    <tr key={p.id} className="font-mono">
                      <td className="px-4 py-3 font-bold text-gray-900">{p.paymentNumber}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">₹{p.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 font-sans font-medium text-gray-700">
                        {p.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.reference || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 font-sans">
                        {new Date(p.paidAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
              No payments recorded against this invoice yet.
            </p>
          )}
        </div>

        {/* Terms & Notes */}
        {invoice.notes && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
            <p className="font-bold text-gray-600 uppercase tracking-wider">Invoice Notes</p>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800">
                  <Banknote className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Record Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Amount to Record (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-mono font-bold border border-gray-200 rounded-xl bg-white text-emerald-800 focus:outline-none focus:border-emerald-800"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={payMethod}
                  onChange={(val) => setPayMethod(val as PaymentMethod)}
                  options={[
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer / Wire' },
                    { value: 'UPI', label: 'UPI' },
                    { value: 'CASH', label: 'Cash' },
                    { value: 'CREDIT_CARD', label: 'Credit Card' },
                    { value: 'DEBIT_CARD', label: 'Debit Card' },
                    { value: 'CHEQUE', label: 'Cheque' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. TXN-12345"
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Optional payment notes..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-emerald-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 disabled:opacity-50 transition"
                >
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
