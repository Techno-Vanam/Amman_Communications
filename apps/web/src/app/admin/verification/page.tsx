'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  X,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  Filter,
  FileText,
  CalendarDays,
  MessageSquare,
  Edit2,
  Hourglass,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
type VerifStatus = 'Pending Review' | 'Verified' | 'Needs Correction' | 'Rejected';

type DocType =
  | 'Business Registration'
  | 'Identity Proof'
  | 'Address Proof'
  | 'Tax Certificate'
  | 'Bank Statement'
  | 'Utility Bill'
  | 'NOC Letter'
  | 'Partnership Deed';

interface VerifRecord {
  id: string;
  appId: string;
  customer: string;
  docType: DocType;
  uploadedDate: string;
  status: VerifStatus;
  remarks: string;
  reviewedBy?: string;
}

// ── Mock Data ─────────────────────────────────────────────────
const TODAY = '2026-08-27';

const INITIAL_RECORDS: VerifRecord[] = [
  { id: 'VRF-001', appId: 'APP-2026-089', customer: 'Ahmad Hassan',      docType: 'Business Registration', uploadedDate: '2026-08-27', status: 'Pending Review',    remarks: '' },
  { id: 'VRF-002', appId: 'APP-2026-089', customer: 'Ahmad Hassan',      docType: 'Identity Proof',        uploadedDate: '2026-08-27', status: 'Pending Review',    remarks: '' },
  { id: 'VRF-003', appId: 'APP-2026-088', customer: 'Sarah Jenkins',     docType: 'Bank Statement',        uploadedDate: '2026-08-26', status: 'Verified',          remarks: 'All documents verified successfully.', reviewedBy: 'Admin' },
  { id: 'VRF-004', appId: 'APP-2026-088', customer: 'Sarah Jenkins',     docType: 'Address Proof',         uploadedDate: '2026-08-26', status: 'Needs Correction',  remarks: 'Address mismatch found. Please re-upload.' },
  { id: 'VRF-005', appId: 'APP-2026-085', customer: 'Rachel Vance',      docType: 'Tax Certificate',       uploadedDate: '2026-08-25', status: 'Pending Review',    remarks: '' },
  { id: 'VRF-006', appId: 'APP-2026-085', customer: 'Rachel Vance',      docType: 'Utility Bill',          uploadedDate: '2026-08-25', status: 'Needs Correction',  remarks: 'Document expired. Please provide a recent bill.' },
  { id: 'VRF-007', appId: 'APP-2026-084', customer: 'Mohammad Ali',      docType: 'Identity Proof',        uploadedDate: '2026-08-22', status: 'Pending Review',    remarks: '' },
  { id: 'VRF-008', appId: 'APP-2026-083', customer: 'Ahmad Hassan',      docType: 'Partnership Deed',      uploadedDate: '2026-08-20', status: 'Verified',          remarks: 'Verified and approved.', reviewedBy: 'Admin' },
  { id: 'VRF-009', appId: 'APP-2026-082', customer: 'TechCorp LLC',      docType: 'NOC Letter',            uploadedDate: '2026-08-18', status: 'Rejected',          remarks: 'NOC not from the correct authority. Application rejected.' },
  { id: 'VRF-010', appId: 'APP-2026-087', customer: 'TechCorp LLC',      docType: 'Business Registration', uploadedDate: '2026-08-27', status: 'Verified',          remarks: 'Documents in order.', reviewedBy: 'Admin' },
];

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG: Record<VerifStatus, { badge: string; icon: React.ReactNode; ring: string }> = {
  'Pending Review':    { badge: 'bg-amber-100 text-amber-800 border-amber-200',   icon: <Clock className="w-3 h-3" />,          ring: 'border-amber-300' },
  'Verified':          { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="w-3 h-3" />,  ring: 'border-emerald-300' },
  'Needs Correction':  { badge: 'bg-orange-100 text-orange-800 border-orange-200', icon: <AlertTriangle className="w-3 h-3" />, ring: 'border-orange-300' },
  'Rejected':          { badge: 'bg-rose-100 text-rose-800 border-rose-200',       icon: <XCircle className="w-3 h-3" />,        ring: 'border-rose-300' },
};

function VerifBadge({ status }: { status: VerifStatus }) {
  const { badge, icon } = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
      {icon}{status}
    </span>
  );
}

// ── Review / Edit Modal ───────────────────────────────────────
function ReviewModal({
  record,
  onClose,
  onSave,
}: {
  record: VerifRecord;
  onClose: () => void;
  onSave: (id: string, status: VerifStatus, remarks: string) => void;
}) {
  const [status, setStatus] = useState<VerifStatus>(record.status);
  const [remarks, setRemarks] = useState(record.remarks);

  const statusOptions: VerifStatus[] = ['Pending Review', 'Verified', 'Needs Correction', 'Rejected'];

  const statusColor: Record<VerifStatus, string> = {
    'Pending Review': 'border-amber-200 bg-amber-50 text-amber-800',
    'Verified': 'border-emerald-200 bg-emerald-50 text-emerald-800',
    'Needs Correction': 'border-orange-200 bg-orange-50 text-orange-800',
    'Rejected': 'border-rose-200 bg-rose-50 text-rose-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Review Document</h2>
              <p className="text-[11px] text-gray-400">{record.id} · {record.docType}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Document info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Application</p>
              <p className="text-xs font-bold text-[#12372A] mt-0.5">{record.appId}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Customer</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">{record.customer}</p>
            </div>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Verification Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${status === s ? statusColor[s] + ' ring-2 ring-offset-1 ring-[#12372A]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  {STATUS_CFG[s].icon}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Remarks</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Add verification notes, reasons for rejection or correction request..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all resize-none"
            />
          </div>

          {/* Quick action hint */}
          {status === 'Needs Correction' && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50 border border-orange-100">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700 font-medium">Customer will be notified to re-upload the corrected document.</p>
            </div>
          )}
          {status === 'Rejected' && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">Rejecting this document may affect the overall application status.</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button
              onClick={() => { onSave(record.id, status, remarks); onClose(); }}
              className="flex-1 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors shadow-md"
            >
              Save Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail View Modal ─────────────────────────────────────────
function DetailModal({ record, onClose }: { record: VerifRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Document Detail</h2>
              <p className="text-[11px] text-gray-400">{record.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            { label: 'Application ID', value: record.appId },
            { label: 'Customer', value: record.customer },
            { label: 'Document Type', value: record.docType },
            { label: 'Uploaded Date', value: new Date(record.uploadedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
            { label: 'Reviewed By', value: record.reviewedBy ?? 'Not yet reviewed' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <p className="text-[11px] text-gray-400 font-semibold">{r.label}</p>
              <p className="text-xs font-bold text-gray-800">{r.value}</p>
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <p className="text-[11px] text-gray-400 font-semibold">Status</p>
            <VerifBadge status={record.status} />
          </div>
          {record.remarks && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Remarks</p>
              <p className="text-xs text-gray-700">{record.remarks}</p>
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
type FilterType = 'All' | VerifStatus;

export default function VerificationPage() {
  const [records, setRecords] = useState<VerifRecord[]>(INITIAL_RECORDS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [reviewRecord, setReviewRecord] = useState<VerifRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<VerifRecord | null>(null);

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.id.toLowerCase().includes(q) || r.appId.toLowerCase().includes(q) ||
      r.customer.toLowerCase().includes(q) || r.docType.toLowerCase().includes(q);
    const matchFilter = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchFilter;
  }), [records, search, filterStatus]);

  function handleSaveReview(id: string, status: VerifStatus, remarks: string) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status, remarks, reviewedBy: 'Admin' } : r));
  }

  const ALL_STATUS_LIST: VerifStatus[] = ['Pending Review', 'Verified', 'Needs Correction', 'Rejected'];
  const counts = Object.fromEntries(
    (['All', ...ALL_STATUS_LIST] as FilterType[]).map(s => [s, s === 'All' ? records.length : records.filter(r => r.status === s).length])
  );

  const pendingCount    = records.filter(r => r.status === 'Pending Review').length;
  const verifiedToday   = records.filter(r => r.status === 'Verified' && r.uploadedDate === TODAY).length;
  const needsCorrection = records.filter(r => r.status === 'Needs Correction').length;

  // avg processing (mock: days between upload and today for verified records)
  const verifiedRecords = records.filter(r => r.status === 'Verified');
  const avgDays = verifiedRecords.length === 0 ? 0 :
    Math.round(verifiedRecords.reduce((acc, r) => {
      const diff = (new Date(TODAY).getTime() - new Date(r.uploadedDate).getTime()) / 86400000;
      return acc + diff;
    }, 0) / verifiedRecords.length);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Summary cards config
  const summaryCards = [
    {
      label: 'Pending Review',
      value: pendingCount,
      icon: <Hourglass className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800',
      desc: 'Awaiting officer action',
    },
    {
      label: 'Verified Today',
      value: verifiedToday,
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
      desc: 'Documents cleared today',
    },
    {
      label: 'Needs Correction',
      value: needsCorrection,
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      iconBg: 'bg-orange-50 border-orange-100',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800',
      desc: 'Customer action required',
    },
    {
      label: 'Avg. Processing',
      value: `${avgDays}d`,
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-100',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
      desc: 'Days to verify per doc',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">


      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badge}`}>
                {card.desc}
              </span>
            </div>
            <p className={`text-3xl font-extrabold ${card.text}`}>{card.value}</p>
            <p className="text-xs text-gray-500 font-semibold mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by record ID, application ID, customer, or document type..."
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
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 py-1.5">
              {(['All', ...ALL_STATUS_LIST] as FilterType[]).map(s => (
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

      {/* ── Verification Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">

        {/* Table Header */}
        <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
          <div className="col-span-1">ID</div>
          <div className="col-span-2">App. ID</div>
          <div className="col-span-2">Document Type</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-1">Uploaded</div>
          <div className="col-span-2 text-center">Verif. Status</div>
          <div className="col-span-1">Remarks</div>
          <div className="col-span-1 text-center">Action</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400">No verification records found</p>
            <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filter</p>
          </div>
        ) : filtered.map((r, idx) => (
          <div key={r.id} className={`grid grid-cols-12 px-5 py-3.5 items-center hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
            {/* ID */}
            <div className="col-span-1">
              <span className="text-[11px] font-bold text-gray-500">{r.id}</span>
            </div>
            {/* App ID */}
            <div className="col-span-2">
              <span className="text-xs font-bold text-[#12372A]">{r.appId}</span>
            </div>
            {/* Doc Type */}
            <div className="col-span-2 min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs font-semibold text-gray-700 truncate">{r.docType}</span>
              </div>
            </div>
            {/* Customer */}
            <div className="col-span-2 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#12372A] to-[#2e8a60] text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
                  {r.customer.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-gray-800 truncate">{r.customer}</span>
              </div>
            </div>
            {/* Uploaded Date */}
            <div className="col-span-1">
              <div className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap">{fmtDate(r.uploadedDate)}</span>
              </div>
            </div>
            {/* Status */}
            <div className="col-span-2 flex justify-center">
              <VerifBadge status={r.status} />
            </div>
            {/* Remarks preview */}
            <div className="col-span-1 min-w-0">
              {r.remarks ? (
                <div className="flex items-center gap-1" title={r.remarks}>
                  <MessageSquare className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="text-[10px] text-gray-500 truncate max-w-[80px]">{r.remarks}</span>
                </div>
              ) : (
                <span className="text-[10px] text-gray-300 italic">—</span>
              )}
            </div>
            {/* Actions */}
            <div className="col-span-1 flex items-center justify-center gap-1.5">
              <button
                onClick={() => setViewRecord(r)}
                className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all"
                title="View details"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                onClick={() => setReviewRecord(r)}
                className="w-7 h-7 rounded-full bg-[#f0f7f2] hover:bg-[#12372A] text-[#12372A] hover:text-white flex items-center justify-center transition-all"
                title="Review"
              >
                <ShieldCheck className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400 font-medium">Showing {filtered.length} of {records.length} documents</p>
          <p className="text-[11px] text-gray-400">{pendingCount} pending officer action</p>
        </div>
      </div>

      {/* ── Modals ── */}
      {reviewRecord && (
        <ReviewModal record={reviewRecord} onClose={() => setReviewRecord(null)} onSave={handleSaveReview} />
      )}
      {viewRecord && (
        <DetailModal record={viewRecord} onClose={() => setViewRecord(null)} />
      )}
    </div>
  );
}
