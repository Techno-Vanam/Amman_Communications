'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Wallet, Search, X, Eye, Edit2, ChevronDown, Filter,
  CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, Hourglass,
  FileText, User, Calendar, CreditCard, IndianRupee, Plus,
  Receipt, ArrowDownCircle, History,
} from 'lucide-react';
import {
  fetchInvoicesAction,
  fetchInvoiceDetailAction,
  updateInvoiceAction,
  recordInvoicePaymentAction,
} from './actions';

// ── Types ─────────────────────────────────────────────────────
type PaymentStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue' | 'Waived';

export interface FinanceRecord {
  id: string;
  invoiceNumber: string;
  appId: string;
  customerId: string;
  customer: string;
  email: string;
  phone: string;
  serviceType: string;
  governmentFee: number;
  serviceFee: number;
  totalCost: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentsCount: number;
  dueDate: string;
  createdAt: string;
  status: PaymentStatus;
  notes: string;
}

interface PaymentRecord {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  notes: string;
  paidAt: string;
  status: string;
}

const ALL_STATUSES: PaymentStatus[] = ['Paid', 'Partial', 'Pending', 'Overdue', 'Waived'];

const STATUS_CFG: Record<PaymentStatus, { badge: string; icon: React.ReactNode }> = {
  Paid:    { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  Partial: { badge: 'bg-blue-100 text-blue-800 border-blue-200',         icon: <Clock className="w-3 h-3" /> },
  Pending: { badge: 'bg-amber-100 text-amber-800 border-amber-200',      icon: <Hourglass className="w-3 h-3" /> },
  Overdue: { badge: 'bg-rose-100 text-rose-800 border-rose-200',         icon: <AlertCircle className="w-3 h-3" /> },
  Waived:  { badge: 'bg-gray-100 text-gray-600 border-gray-200',         icon: <XCircle className="w-3 h-3" /> },
};

const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'ONLINE', 'OTHER'];

function fmtAmt(n: number) { return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`; }
function fmtDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const { badge, icon } = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
      {icon}{status}
    </span>
  );
}

// ── Record Payment Modal ───────────────────────────────────────
function RecordPaymentModal({
  record,
  onClose,
  onSuccess,
}: {
  record: FinanceRecord;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outstanding = record.outstandingAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    if (amt > outstanding) { setError(`Amount cannot exceed outstanding balance ${fmtAmt(outstanding)}`); return; }
    setSaving(true);
    setError(null);
    const res = await recordInvoicePaymentAction(record.id, amt, method, reference || undefined, notes || undefined);
    setSaving(false);
    if (res.error) { setError(res.error); return; }
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Record Payment</h2>
              <p className="text-[11px] text-gray-400">{record.invoiceNumber} · {record.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Fee breakdown */}
        <div className="px-6 pt-4 grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <p className="text-[9px] text-gray-400 font-semibold uppercase mb-1">Total</p>
            <p className="text-sm font-extrabold text-gray-900">{fmtAmt(record.totalCost)}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p className="text-[9px] text-emerald-500 font-semibold uppercase mb-1">Paid</p>
            <p className="text-sm font-extrabold text-emerald-800">{fmtAmt(record.paidAmount)}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-center">
            <p className="text-[9px] text-rose-400 font-semibold uppercase mb-1">Outstanding</p>
            <p className="text-sm font-extrabold text-rose-800">{fmtAmt(outstanding)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Amount (₹) <span className="text-gray-400 font-normal">max {fmtAmt(outstanding)}</span></label>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number" min="1" step="0.01" max={outstanding}
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder={outstanding.toString()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex gap-2 mt-1.5">
              {[outstanding, outstanding / 2].map((preset, i) => (
                <button key={i} type="button"
                  onClick={() => setAmount(preset.toFixed(2))}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 hover:bg-[#f0f7f2] hover:text-[#12372A] text-gray-600 transition-colors">
                  {i === 0 ? 'Full' : 'Half'} ({fmtAmt(preset)})
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={`py-1.5 rounded-xl border text-[10px] font-bold transition-all ${method === m ? 'bg-[#12372A] text-white border-[#12372A]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Reference / Transaction ID <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={reference} onChange={e => setReference(e.target.value)}
              placeholder="e.g. UTR123456789"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Payment remarks..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all resize-none" />
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-60">
              {saving ? 'Recording…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Invoice Modal ─────────────────────────────────────────
function EditModal({
  record,
  onClose,
  onSave,
}: {
  record: FinanceRecord;
  onClose: () => void;
  onSave: (id: string, data: Partial<FinanceRecord>) => void;
}) {
  const [status, setStatus] = useState<PaymentStatus>(record.status);
  const [notes, setNotes] = useState(record.notes ?? '');
  const [dueDate, setDueDate] = useState(record.dueDate);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(record.id, { status, notes, dueDate });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Edit Invoice</h2>
              <p className="text-[11px] text-gray-400">{record.invoiceNumber} · {record.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Breakdown summary */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Govt Fee', value: fmtAmt(record.governmentFee), color: 'text-gray-900' },
              { label: 'Service Fee', value: fmtAmt(record.serviceFee), color: 'text-indigo-700' },
              { label: 'Total', value: fmtAmt(record.totalCost), color: 'text-gray-900' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-[9px] text-gray-400 font-semibold uppercase mb-1">{s.label}</p>
                <p className={`text-sm font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Status</label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_STATUSES.map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border text-[10px] font-bold transition-all ${status === s ? STATUS_CFG[s].badge + ' ring-2 ring-[#12372A] ring-offset-1' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {STATUS_CFG[s].icon}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Payment remarks or special instructions..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors shadow-md">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail View Modal ─────────────────────────────────────────
function ViewModal({ record, onClose }: { record: FinanceRecord; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceDetailAction(record.id).then(res => {
      if (res.success) setDetail(res.data);
      setLoading(false);
    });
  }, [record.id]);

  const balance = record.outstandingAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Invoice Detail</h2>
              <p className="text-[11px] text-gray-400">{record.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Payment breakdown */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Govt Fee', value: fmtAmt(record.governmentFee), color: 'text-gray-900', bg: 'bg-gray-50 border-gray-100' },
              { label: 'Service Fee', value: fmtAmt(record.serviceFee), color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
              { label: 'Paid', value: fmtAmt(record.paidAmount), color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-100' },
              { label: 'Balance', value: fmtAmt(balance), color: balance > 0 ? 'text-rose-800' : 'text-emerald-800', bg: balance > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100' },
            ].map(s => (
              <div key={s.label} className={`p-3 rounded-xl border text-center ${s.bg}`}>
                <p className="text-[9px] text-gray-400 font-semibold uppercase mb-1">{s.label}</p>
                <p className={`text-sm font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Info rows */}
          {[
            { icon: <FileText className="w-4 h-4 text-gray-400" />, label: 'Application ID', value: record.appId },
            { icon: <User className="w-4 h-4 text-gray-400" />, label: 'Customer', value: `${record.customer} · ${record.email}` },
            { icon: <CreditCard className="w-4 h-4 text-gray-400" />, label: 'Service', value: record.serviceType },
            { icon: <Calendar className="w-4 h-4 text-gray-400" />, label: 'Due Date', value: fmtDate(record.dueDate) },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">{r.icon}</div>
              <div>
                <p className="text-[9px] text-gray-400 font-semibold uppercase">{r.label}</p>
                <p className="text-xs font-bold text-gray-800">{r.value}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 font-semibold">Status</p>
            <StatusBadge status={record.status} />
          </div>

          {record.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-[10px] text-amber-600 font-bold uppercase mb-1">Notes</p>
              <p className="text-xs text-amber-800">{record.notes}</p>
            </div>
          )}

          {/* Payment History */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-extrabold text-gray-700 uppercase tracking-widest">Payment History</p>
            </div>
            {loading ? (
              <p className="text-xs text-gray-400 py-3 text-center">Loading…</p>
            ) : detail?.payments?.length > 0 ? (
              <div className="space-y-2">
                {detail.payments.map((p: PaymentRecord) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div>
                      <p className="text-xs font-bold text-emerald-800">{fmtAmt(p.amount)}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">{p.paymentMethod.replace('_', ' ')} {p.reference ? `· ${p.reference}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-semibold">{fmtDate(p.paidAt)}</p>
                      {p.paymentNumber && <p className="text-[9px] text-gray-400">{p.paymentNumber}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center border border-dashed border-gray-200 rounded-xl">
                <Receipt className="w-6 h-6 text-gray-200 mx-auto mb-1" />
                <p className="text-xs text-gray-400">No payments recorded yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
type FilterType = 'All' | PaymentStatus;

export default function FinanceClient({ initialRecords }: { initialRecords: FinanceRecord[] }) {
  const [records, setRecords] = useState<FinanceRecord[]>(initialRecords);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [viewRecord, setViewRecord] = useState<FinanceRecord | null>(null);
  const [editRecord, setEditRecord] = useState<FinanceRecord | null>(null);
  const [payRecord, setPayRecord] = useState<FinanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadInvoices = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await fetchInvoicesAction(search, filterStatus);
    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.success && res.data) {
      setRecords(res.data as FinanceRecord[]);
    }
    setIsLoading(false);
  };

  // Skip initial load since we have initialRecords, but load on search/filter changes
  useEffect(() => {
    // We already do client-side filtering, so we don't strictly need to refetch unless we want real-time updates.
    // We can just rely on the client-side filter for now to keep it fast.
  }, [search, filterStatus]);

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.appId.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) ||
      r.invoiceNumber.toLowerCase().includes(q) || r.serviceType.toLowerCase().includes(q);
    const matchFilter = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchFilter;
  }), [records, search, filterStatus]);

  async function handleSave(id: string, data: Partial<FinanceRecord>) {
    setErrorMsg(null);
    const res = await updateInvoiceAction(id, {
      status: data.status,
      notes: data.notes,
      dueDate: data.dueDate,
    });
    if (res.error) { setErrorMsg(res.error); }
    else { loadInvoices(); }
  }

  // Aggregates
  const totalBilled    = records.reduce((s, r) => s + r.totalCost, 0);
  const totalCollected = records.reduce((s, r) => s + r.paidAmount, 0);
  const totalPending   = records.reduce((s, r) => s + r.outstandingAmount, 0);

  const counts = Object.fromEntries(
    (['All', ...ALL_STATUSES] as FilterType[]).map(s => [s, s === 'All' ? records.length : records.filter(r => r.status === s).length])
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{records.length} invoices</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-blue-700">{fmtAmt(totalBilled)}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Total Amount Billed</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% collected
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-700">{fmtAmt(totalCollected)}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Total Collected</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Hourglass className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">{counts['Overdue']} overdue</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-700">{fmtAmt(totalPending)}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Total Outstanding</p>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by App ID, customer, invoice, or service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] shadow-xs transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(s => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition-all"
          >
            <Filter className="w-4 h-4 text-gray-500" />
            {filterStatus === 'All' ? 'All Status' : filterStatus}
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 py-1.5">
              {(['All', ...ALL_STATUSES] as FilterType[]).map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setShowFilterMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${filterStatus === s ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <span>{s}</span>
                  <span className="text-gray-400">{counts[s]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-4 py-3 rounded-2xl">
          ⚠ {errorMsg}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[780px]">
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Application</div>
              <div className="col-span-1 text-right pr-2">Govt Fee</div>
              <div className="col-span-1 text-right pr-2">Svc Fee</div>
              <div className="col-span-1 text-right pr-2">Total</div>
              <div className="col-span-1 text-right pr-3">Paid</div>
              <div className="col-span-1 text-right pr-2">Balance</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Rows */}
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="w-6 h-6 border-2 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-400">Loading invoices…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">No finance records found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filter</p>
              </div>
            ) : filtered.map((r, idx) => (
              <div key={r.id} className={`grid grid-cols-12 px-5 py-3.5 items-center hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                {/* Customer */}
                <div className="col-span-2 flex items-center gap-2 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#12372A] to-[#2e8a60] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {r.customer.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{r.customer}</p>
                    <p className="text-[9px] text-gray-400 truncate">{r.invoiceNumber}</p>
                  </div>
                </div>

                {/* Application */}
                <div className="col-span-2 min-w-0 pr-2">
                  <p className="text-xs font-bold text-[#12372A] truncate">{r.appId}</p>
                  <p className="text-[9px] text-gray-400 truncate">{r.serviceType}</p>
                </div>

                {/* Govt Fee */}
                <div className="col-span-1 text-right pr-2">
                  <span className="text-xs font-semibold text-gray-700">{fmtAmt(r.governmentFee)}</span>
                </div>

                {/* Service Fee */}
                <div className="col-span-1 text-right pr-2">
                  <span className="text-xs font-semibold text-indigo-700">{fmtAmt(r.serviceFee)}</span>
                </div>

                {/* Total */}
                <div className="col-span-1 text-right pr-2">
                  <span className="text-xs font-extrabold text-gray-900">{fmtAmt(r.totalCost)}</span>
                </div>

                {/* Paid */}
                <div className="col-span-1 text-right pr-3">
                  <span className="text-xs font-bold text-emerald-700">{fmtAmt(r.paidAmount)}</span>
                  {r.paymentsCount > 0 && (
                    <p className="text-[9px] text-gray-400">{r.paymentsCount} txn{r.paymentsCount > 1 ? 's' : ''}</p>
                  )}
                </div>

                {/* Balance */}
                <div className="col-span-1 text-right pr-2">
                  <span className={`text-xs font-extrabold ${r.outstandingAmount > 0 ? 'text-rose-700' : 'text-emerald-600'}`}>
                    {r.outstandingAmount === 0 ? '✓' : fmtAmt(r.outstandingAmount)}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 flex justify-center">
                  <StatusBadge status={r.status} />
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-center gap-1.5">
                  <button onClick={() => setViewRecord(r)}
                    className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all" title="View details">
                    <Eye className="w-3 h-3" />
                  </button>
                  {r.outstandingAmount > 0 && (
                    <button onClick={() => setPayRecord(r)}
                      className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition-all" title="Record Payment">
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => setEditRecord(r)}
                    className="w-7 h-7 rounded-full bg-[#f0f7f2] hover:bg-[#12372A] text-[#12372A] hover:text-white flex items-center justify-center transition-all" title="Edit invoice">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {records.length} records</p>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="text-gray-700">Collected: <span className="text-emerald-700">{fmtAmt(filtered.reduce((s, r) => s + r.paidAmount, 0))}</span></span>
            <span className="text-gray-700">Outstanding: <span className="text-rose-700">{fmtAmt(filtered.reduce((s, r) => s + r.outstandingAmount, 0))}</span></span>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {viewRecord && <ViewModal record={viewRecord} onClose={() => setViewRecord(null)} />}
      {editRecord && <EditModal record={editRecord} onClose={() => setEditRecord(null)} onSave={handleSave} />}
      {payRecord && <RecordPaymentModal record={payRecord} onClose={() => setPayRecord(null)} onSuccess={loadInvoices} />}
    </div>
  );
}
