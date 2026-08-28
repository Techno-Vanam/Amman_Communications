'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  X,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  Filter,
  User,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
type AppStatus =
  | 'Submitted'
  | 'Under Verification'
  | 'Documents Received'
  | 'Approved'
  | 'Rejected'
  | 'Pending Payment'
  | 'Completed';

interface Application {
  id: string;
  customer: string;
  email: string;
  phone: string;
  serviceType: string;
  createdDate: string;
  status: AppStatus;
  notes?: string;
}

// ── Mock Data ─────────────────────────────────────────────────
const INITIAL_APPS: Application[] = [
  { id: 'APP-2026-089', customer: 'Ahmad Hassan',      email: 'ahmad.hassan@email.com',    phone: '+91 98456 12300', serviceType: 'Commercial Fiber Broadband',      createdDate: '2026-08-27', status: 'Under Verification' },
  { id: 'APP-2026-088', customer: 'Sarah Jenkins',     email: 'sarah.jenkins@email.com',   phone: '+91 99001 45678', serviceType: 'Dedicated Leased Line',           createdDate: '2026-08-26', status: 'Documents Received' },
  { id: 'APP-2026-087', customer: 'TechCorp LLC',      email: 'admin@techcorp.com',        phone: '+91 80112 77890', serviceType: 'Enterprise VoIP Infrastructure',  createdDate: '2026-08-25', status: 'Completed' },
  { id: 'APP-2026-086', customer: 'City Retail Group', email: 'cityretail@business.com',   phone: '+91 94561 23890', serviceType: 'Managed Network Security',         createdDate: '2026-08-24', status: 'Pending Payment' },
  { id: 'APP-2026-085', customer: 'Rachel Vance',      email: 'rachel.vance@mail.com',     phone: '+91 77823 64120', serviceType: 'Cloud Backup & Storage',          createdDate: '2026-08-23', status: 'Under Verification' },
  { id: 'APP-2026-084', customer: 'Mohammad Ali',      email: 'mohd.ali@gmail.com',        phone: '+91 88790 34511', serviceType: 'Commercial Fiber Broadband',      createdDate: '2026-08-22', status: 'Submitted' },
  { id: 'APP-2026-083', customer: 'Ahmad Hassan',      email: 'ahmad.hassan@email.com',    phone: '+91 98456 12300', serviceType: 'Enterprise VoIP Infrastructure',  createdDate: '2026-08-20', status: 'Approved' },
  { id: 'APP-2026-082', customer: 'TechCorp LLC',      email: 'admin@techcorp.com',        phone: '+91 80112 77890', serviceType: 'Dedicated Leased Line',           createdDate: '2026-08-18', status: 'Rejected', notes: 'Missing business registration documents.' },
];

const SERVICE_TYPES = [
  'Commercial Fiber Broadband',
  'Dedicated Leased Line',
  'Enterprise VoIP Infrastructure',
  'Managed Network Security',
  'Cloud Backup & Storage',
  'Managed Network Review',
  'Leased Line Inquiry',
  'Technical Onsite Survey',
];

const ALL_STATUSES: AppStatus[] = [
  'Submitted', 'Under Verification', 'Documents Received',
  'Approved', 'Rejected', 'Pending Payment', 'Completed',
];

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG: Record<AppStatus, { badge: string; icon: React.ReactNode }> = {
  'Submitted':          { badge: 'bg-blue-100 text-blue-800 border-blue-200',    icon: <FileText className="w-3 h-3" /> },
  'Under Verification': { badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  'Documents Received': { badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <RefreshCw className="w-3 h-3" /> },
  'Approved':           { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  'Rejected':           { badge: 'bg-rose-100 text-rose-800 border-rose-200',    icon: <XCircle className="w-3 h-3" /> },
  'Pending Payment':    { badge: 'bg-orange-100 text-orange-800 border-orange-200', icon: <AlertCircle className="w-3 h-3" /> },
  'Completed':          { badge: 'bg-teal-100 text-teal-800 border-teal-200',    icon: <CheckCircle className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: AppStatus }) {
  const { badge, icon } = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
      {icon}{status}
    </span>
  );
}

// ── Detail / View Modal ───────────────────────────────────────
function ViewModal({ app, onClose }: { app: Application; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Application Details</h2>
              <p className="text-[11px] text-gray-400">{app.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            { label: 'Customer', value: app.customer, icon: <User className="w-4 h-4 text-gray-400" /> },
            { label: 'Email', value: app.email, icon: <Mail className="w-4 h-4 text-gray-400" /> },
            { label: 'Phone', value: app.phone, icon: <Phone className="w-4 h-4 text-gray-400" /> },
            { label: 'Service Type', value: app.serviceType, icon: <Building2 className="w-4 h-4 text-gray-400" /> },
            { label: 'Created Date', value: new Date(app.createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), icon: <CalendarDays className="w-4 h-4 text-gray-400" /> },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">{row.icon}</div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{row.label}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{row.value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Status</p>
              <div className="mt-1"><StatusBadge status={app.status} /></div>
            </div>
          </div>
          {app.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wide mb-1">Remarks</p>
              <p className="text-xs text-amber-800">{app.notes}</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Application Modal ──────────────────────────────
function AppModal({
  mode,
  app,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  app?: Application;
  onClose: () => void;
  onSave: (data: Partial<Application>) => void;
}) {
  const [form, setForm] = useState({
    customer: app?.customer ?? '',
    email: app?.email ?? '',
    phone: app?.phone ?? '',
    serviceType: app?.serviceType ?? SERVICE_TYPES[0],
    status: app?.status ?? 'Submitted' as AppStatus,
    notes: app?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customer.trim()) e.customer = 'Customer name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              {mode === 'add' ? <Plus className="w-5 h-5 text-[#a8d5b9]" /> : <Edit2 className="w-5 h-5 text-[#a8d5b9]" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">{mode === 'add' ? 'New Application' : 'Edit Application'}</h2>
              <p className="text-[11px] text-gray-400">{mode === 'add' ? 'Fill in all fields to submit' : `Editing ${app?.id}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Customer */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Customer Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Full name" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
            </div>
            {errors.customer && <p className="text-[10px] text-rose-600 mt-1">{errors.customer}</p>}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
              </div>
              {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" placeholder="+91..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
              </div>
              {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Service Type</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none">
                {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Status (edit only) */}
          {mode === 'edit' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as AppStatus }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none">
                  {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Remarks <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional notes or remarks..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors shadow-md">
              {mode === 'add' ? 'Submit Application' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────
function DeleteModal({ app, onClose, onConfirm }: { app: Application; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6 text-rose-600" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-extrabold text-gray-900">Delete Application?</h2>
          <p className="text-xs text-gray-500 mt-1.5">Are you sure you want to delete <span className="font-bold text-gray-700">{app.id}</span>? This cannot be undone.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Export CSV helper ─────────────────────────────────────────
function exportCSV(data: Application[]) {
  const headers = ['Application ID', 'Customer', 'Email', 'Phone', 'Service Type', 'Created Date', 'Status', 'Remarks'];
  const rows = data.map(a => [
    a.id, a.customer, a.email, a.phone, a.serviceType,
    new Date(a.createdDate).toLocaleDateString('en-IN'),
    a.status, a.notes ?? '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `applications_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ─────────────────────────────────────────────────
type FilterType = 'All' | AppStatus;

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(INITIAL_APPS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewApp, setViewApp] = useState<Application | null>(null);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [deleteApp, setDeleteApp] = useState<Application | null>(null);

  const filtered = useMemo(() => apps.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.id.toLowerCase().includes(q) || a.customer.toLowerCase().includes(q) ||
      a.serviceType.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    const matchFilter = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchFilter;
  }), [apps, search, filterStatus]);

  function handleAdd(data: Partial<Application>) {
    const newApp: Application = {
      id: `APP-2026-${String(90 + apps.length - INITIAL_APPS.length + 1).padStart(3, '0')}`,
      customer: data.customer ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      serviceType: data.serviceType ?? '',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      notes: data.notes,
    };
    setApps(prev => [newApp, ...prev]);
  }

  function handleEdit(data: Partial<Application>) {
    if (!editApp) return;
    setApps(prev => prev.map(a => a.id === editApp.id ? { ...a, ...data } : a));
  }

  function handleDelete(id: string) {
    setApps(prev => prev.filter(a => a.id !== id));
  }

  const counts = Object.fromEntries(
    (['All', ...ALL_STATUSES] as FilterType[]).map(s => [s, s === 'All' ? apps.length : apps.filter(a => a.status === s).length])
  );

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>

      {/* ── Page Header ── */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-xs"
        >
          <Download className="w-4 h-4 text-gray-500" />
          Export CSV
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#12372A] hover:bg-[#1a4a38] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md"
        >
          <Plus className="w-4 h-4 text-[#a8d5b9]" />
          New Application
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {ALL_STATUSES.map(s => {
          const cfg = STATUS_CFG[s];
          return (
            <div key={s} className={`rounded-2xl border p-3 ${cfg.badge.replace('text-', 'border-').split(' ')[1]} bg-white border-gray-100`}>
              <p className="text-xl font-extrabold text-[#0e2a47]">{counts[s]}</p>
              <p className="text-[9px] font-semibold mt-0.5 text-gray-500 leading-tight">{s}</p>
            </div>
          );
        })}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, customer, service type..."
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
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 py-1.5 overflow-hidden">
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
          <div className="min-w-[660px]">
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
              <div className="col-span-2">App. ID</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-3">Service Type</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">No applications found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filter</p>
              </div>
            ) : filtered.map((a, idx) => (
              <div key={a.id} className={`grid grid-cols-12 px-5 py-3.5 items-center hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                {/* ID */}
                <div className="col-span-2">
                  <span className="text-xs font-bold text-[#12372A]">{a.id}</span>
                </div>
                {/* Customer */}
                <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#12372A] to-[#2e8a60] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {a.customer.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{a.customer}</p>
                    <p className="text-[10px] text-gray-400 truncate">{a.email}</p>
                  </div>
                </div>
                {/* Service */}
                <div className="col-span-3 min-w-0 pr-2">
                  <p className="text-xs text-gray-700 font-semibold truncate">{a.serviceType}</p>
                </div>
                {/* Date */}
                <div className="col-span-1">
                  <p className="text-[11px] text-gray-600 font-medium whitespace-nowrap">{fmtDate(a.createdDate)}</p>
                </div>
                {/* Status */}
                <div className="col-span-2 flex justify-center">
                  <StatusBadge status={a.status} />
                </div>
                {/* Actions */}
                <div className="col-span-1 flex items-center justify-center gap-1.5">
                  <button onClick={() => setViewApp(a)} className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all" title="View">
                    <Eye className="w-3 h-3" />
                  </button>
                  <button onClick={() => setEditApp(a)} className="w-7 h-7 rounded-full bg-[#f0f7f2] hover:bg-[#12372A] text-[#12372A] hover:text-white flex items-center justify-center transition-all" title="Edit">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => setDeleteApp(a)} className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-all" title="Delete">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400 font-medium">Showing {filtered.length} of {apps.length} applications</p>
          <button onClick={() => exportCSV(filtered)} className="text-[11px] font-bold text-[#12372A] hover:underline flex items-center gap-1">
            <Download className="w-3 h-3" /> Export filtered
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && <AppModal mode="add" onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editApp && <AppModal mode="edit" app={editApp} onClose={() => setEditApp(null)} onSave={handleEdit} />}
      {viewApp && <ViewModal app={viewApp} onClose={() => setViewApp(null)} />}
      {deleteApp && <DeleteModal app={deleteApp} onClose={() => setDeleteApp(null)} onConfirm={() => handleDelete(deleteApp.id)} />}
    </div>
  );
}
