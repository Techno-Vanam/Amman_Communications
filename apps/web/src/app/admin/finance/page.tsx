'use client';

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Search,
  X,
  Eye,
  Edit2,
  ChevronDown,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Hourglass,
  FileText,
  User,
  Calendar,
  CreditCard,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
type PaymentStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue' | 'Waived';

interface FinanceRecord {
  id: string;
  appId: string;
  customer: string;
  email: string;
  serviceType: string;
  totalCost: number;
  advancePaid: number;
  dueDate: string;
  status: PaymentStatus;
  notes?: string;
}

// ── Mock Data ─────────────────────────────────────────────────
const INITIAL_RECORDS: FinanceRecord[] = [
  { id: 'FIN-001', appId: 'APP-2026-089', customer: 'Ahmad Hassan',      email: 'ahmad.hassan@email.com',  serviceType: 'Commercial Fiber Broadband',     totalCost: 48000, advancePaid: 12000, dueDate: '2026-09-10', status: 'Partial' },
  { id: 'FIN-002', appId: 'APP-2026-088', customer: 'Sarah Jenkins',     email: 'sarah.jenkins@email.com', serviceType: 'Dedicated Leased Line',           totalCost: 72000, advancePaid: 72000, dueDate: '2026-08-26', status: 'Paid' },
  { id: 'FIN-003', appId: 'APP-2026-087', customer: 'TechCorp LLC',      email: 'admin@techcorp.com',       serviceType: 'Enterprise VoIP Infrastructure', totalCost: 95000, advancePaid: 95000, dueDate: '2026-08-25', status: 'Paid' },
  { id: 'FIN-004', appId: 'APP-2026-086', customer: 'City Retail Group', email: 'cityretail@business.com', serviceType: 'Managed Network Security',        totalCost: 36000, advancePaid: 0,     dueDate: '2026-09-01', status: 'Pending' },
  { id: 'FIN-005', appId: 'APP-2026-085', customer: 'Rachel Vance',      email: 'rachel.vance@mail.com',   serviceType: 'Cloud Backup & Storage',         totalCost: 18000, advancePaid: 5000,  dueDate: '2026-08-23', status: 'Overdue' },
  { id: 'FIN-006', appId: 'APP-2026-084', customer: 'Mohammad Ali',      email: 'mohd.ali@gmail.com',       serviceType: 'Commercial Fiber Broadband',     totalCost: 48000, advancePaid: 0,     dueDate: '2026-09-15', status: 'Pending' },
  { id: 'FIN-007', appId: 'APP-2026-083', customer: 'Ahmad Hassan',      email: 'ahmad.hassan@email.com',  serviceType: 'Enterprise VoIP Infrastructure', totalCost: 95000, advancePaid: 50000, dueDate: '2026-09-05', status: 'Partial' },
  { id: 'FIN-008', appId: 'APP-2026-082', customer: 'TechCorp LLC',      email: 'admin@techcorp.com',       serviceType: 'Dedicated Leased Line',          totalCost: 72000, advancePaid: 72000, dueDate: '2026-08-18', status: 'Waived',  notes: 'Waived on settlement agreement.' },
];

const ALL_STATUSES: PaymentStatus[] = ['Paid', 'Partial', 'Pending', 'Overdue', 'Waived'];

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG: Record<PaymentStatus, { badge: string; icon: React.ReactNode }> = {
  Paid:    { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  Partial: { badge: 'bg-blue-100 text-blue-800 border-blue-200',         icon: <Clock className="w-3 h-3" /> },
  Pending: { badge: 'bg-amber-100 text-amber-800 border-amber-200',      icon: <Hourglass className="w-3 h-3" /> },
  Overdue: { badge: 'bg-rose-100 text-rose-800 border-rose-200',         icon: <AlertCircle className="w-3 h-3" /> },
  Waived:  { badge: 'bg-gray-100 text-gray-600 border-gray-200',         icon: <XCircle className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const { badge, icon } = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
      {icon}{status}
    </span>
  );
}

// ── Edit / Update Payment Modal ───────────────────────────────
function EditModal({
  record,
  onClose,
  onSave,
}: {
  record: FinanceRecord;
  onClose: () => void;
  onSave: (id: string, data: Partial<FinanceRecord>) => void;
}) {
  const [advancePaid, setAdvancePaid] = useState(record.advancePaid.toString());
  const [status, setStatus] = useState<PaymentStatus>(record.status);
  const [notes, setNotes] = useState(record.notes ?? '');
  const [dueDate, setDueDate] = useState(record.dueDate);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(record.id, { advancePaid: Number(advancePaid), status, notes, dueDate });
    onClose();
  }

  const balance = record.totalCost - Number(advancePaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Update Payment</h2>
              <p className="text-[11px] text-gray-400">{record.id} · {record.appId}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total Cost', value: `₹${record.totalCost.toLocaleString('en-IN')}`, color: 'text-gray-900' },
              { label: 'Advance Paid', value: `₹${Number(advancePaid).toLocaleString('en-IN')}`, color: 'text-emerald-700' },
              { label: 'Balance', value: `₹${balance.toLocaleString('en-IN')}`, color: balance > 0 ? 'text-rose-700' : 'text-emerald-700' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-[9px] text-gray-400 font-semibold uppercase mb-1">{s.label}</p>
                <p className={`text-sm font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Advance Paid */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Advance Paid (₹)</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="0"
                max={record.totalCost}
                value={advancePaid}
                onChange={e => setAdvancePaid(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Status</label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_STATUSES.map(s => (
                <button
                  key={s} type="button"
                  onClick={() => setStatus(s)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border text-[10px] font-bold transition-all ${status === s ? STATUS_CFG[s].badge + ' ring-2 ring-[#12372A] ring-offset-1' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  {STATUS_CFG[s].icon}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Payment remarks or special instructions..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all resize-none"
            />
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
  const balance = record.totalCost - record.advancePaid;
  const fmtAmt  = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Finance Detail</h2>
              <p className="text-[11px] text-gray-400">{record.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {/* Payment breakdown */}
          <div className="grid grid-cols-3 gap-2 mb-1">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <p className="text-[9px] text-gray-400 font-semibold uppercase mb-1">Total Cost</p>
              <p className="text-sm font-extrabold text-gray-900">{fmtAmt(record.totalCost)}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="text-[9px] text-emerald-500 font-semibold uppercase mb-1">Collected</p>
              <p className="text-sm font-extrabold text-emerald-800">{fmtAmt(record.advancePaid)}</p>
            </div>
            <div className={`p-3 rounded-xl border text-center ${balance > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <p className={`text-[9px] font-semibold uppercase mb-1 ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Balance</p>
              <p className={`text-sm font-extrabold ${balance > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>{fmtAmt(balance)}</p>
            </div>
          </div>

          {[
            { icon: <FileText className="w-4 h-4 text-gray-400" />, label: 'Application ID', value: record.appId },
            { icon: <User className="w-4 h-4 text-gray-400" />,     label: 'Customer',       value: record.customer },
            { icon: <CreditCard className="w-4 h-4 text-gray-400" />, label: 'Service',      value: record.serviceType },
            { icon: <Calendar className="w-4 h-4 text-gray-400" />, label: 'Due Date',       value: fmtDate(record.dueDate) },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">{r.icon}</div>
              <div>
                <p className="text-[9px] text-gray-400 font-semibold uppercase">{r.label}</p>
                <p className="text-xs font-bold text-gray-800">{r.value}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between py-2 border-t border-gray-100 mt-1">
            <p className="text-[11px] text-gray-400 font-semibold">Status</p>
            <StatusBadge status={record.status} />
          </div>
          {record.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-[10px] text-amber-600 font-bold uppercase mb-1">Notes</p>
              <p className="text-xs text-amber-800">{record.notes}</p>
            </div>
          )}
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

export default function FinancePage() {
  const [records, setRecords] = useState<FinanceRecord[]>(INITIAL_RECORDS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [viewRecord, setViewRecord] = useState<FinanceRecord | null>(null);
  const [editRecord, setEditRecord] = useState<FinanceRecord | null>(null);

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.appId.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) || r.serviceType.toLowerCase().includes(q);
    const matchFilter = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchFilter;
  }), [records, search, filterStatus]);

  function handleSave(id: string, data: Partial<FinanceRecord>) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }

  // Aggregates
  const totalAmount    = records.reduce((s, r) => s + r.totalCost, 0);
  const totalCollected = records.reduce((s, r) => s + r.advancePaid, 0);
  const totalPending   = records.reduce((s, r) => s + Math.max(0, r.totalCost - r.advancePaid), 0);

  const counts = Object.fromEntries(
    (['All', ...ALL_STATUSES] as FilterType[]).map(s => [s, s === 'All' ? records.length : records.filter(r => r.status === s).length])
  );

  const fmtAmt  = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>


      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Amount */}
        <div className="bg-gradient-to-br from-[#12372A] to-[#1a5c3a] rounded-2xl p-5 shadow-md text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-[#a8d5b9]">
              {records.length} records
            </span>
          </div>
          <p className="text-2xl font-extrabold">{fmtAmt(totalAmount)}</p>
          <p className="text-xs text-[#a8d5b9] font-semibold mt-1">Total Amount Billed</p>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {Math.round((totalCollected / totalAmount) * 100)}% collected
            </span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{fmtAmt(totalCollected)}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Total Collected</p>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {counts['Overdue']} overdue
            </span>
          </div>
          <p className="text-2xl font-extrabold text-rose-700">{fmtAmt(totalPending)}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Total Pending Balance</p>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by App ID, customer, service, or finance ID..."
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

      {/* ── Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[680px]">
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
              <div className="col-span-2">App. ID</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Total Cost</div>
              <div className="col-span-2">Advance Paid</div>
              <div className="col-span-1">Balance</div>
              <div className="col-span-1">Due Date</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">No finance records found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filter</p>
              </div>
            ) : filtered.map((r, idx) => {
              const balance = r.totalCost - r.advancePaid;
              return (
                <div key={r.id} className={`grid grid-cols-12 px-5 py-3.5 items-center hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  {/* App ID */}
                  <div className="col-span-2">
                    <span className="text-xs font-bold text-[#12372A]">{r.appId}</span>
                    <p className="text-[9px] text-gray-400">{r.id}</p>
                  </div>

                  {/* Customer */}
                  <div className="col-span-2 flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#12372A] to-[#2e8a60] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                      {r.customer.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{r.customer}</p>
                    </div>
                  </div>

                  {/* Total Cost */}
                  <div className="col-span-2">
                    <span className="text-xs font-extrabold text-gray-900">{fmtAmt(r.totalCost)}</span>
                  </div>

                  {/* Advance Paid */}
                  <div className="col-span-2">
                    <span className="text-xs font-bold text-emerald-700">{fmtAmt(r.advancePaid)}</span>
                  </div>

                  {/* Balance */}
                  <div className="col-span-1">
                    <span className={`text-xs font-extrabold ${balance > 0 ? 'text-rose-700' : 'text-emerald-600'}`}>
                      {balance === 0 ? '—' : fmtAmt(balance)}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div className="col-span-1">
                    <p className="text-[11px] text-gray-600 font-medium whitespace-nowrap">{r.dueDate ? fmtDate(r.dueDate) : '—'}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    <StatusBadge status={r.status} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-center gap-1.5">
                    <button onClick={() => setViewRecord(r)}
                      className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all" title="View">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditRecord(r)}
                      className="w-7 h-7 rounded-full bg-[#f0f7f2] hover:bg-[#12372A] text-[#12372A] hover:text-white flex items-center justify-center transition-all" title="Edit">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {records.length} records</p>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="text-gray-700">Collected: <span className="text-emerald-700">{fmtAmt(filtered.reduce((s, r) => s + r.advancePaid, 0))}</span></span>
            <span className="text-gray-700">Pending: <span className="text-rose-700">{fmtAmt(filtered.reduce((s, r) => s + Math.max(0, r.totalCost - r.advancePaid), 0))}</span></span>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {viewRecord && <ViewModal record={viewRecord} onClose={() => setViewRecord(null)} />}
      {editRecord && <EditModal record={editRecord} onClose={() => setEditRecord(null)} onSave={handleSave} />}
    </div>
  );
}
