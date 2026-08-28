'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  Filter,
  CheckCircle,
  XCircle,
  FileEdit,
  Clock,
  Tag,
  FileText,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
type ServiceStatus = 'Active' | 'Inactive' | 'Draft';

interface RequiredDoc {
  name: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  requiredDocs: RequiredDoc[];
  govtFee: number;
  officeCharge: number;
  estDays: number;
  status: ServiceStatus;
  description: string;
}

// ── Mock Data ─────────────────────────────────────────────────
const CATEGORIES = [
  'Broadband', 'Leased Line', 'VoIP', 'Security', 'Cloud', 'Consulting', 'Support',
];

// ── Live Dataset ─────────────────────────────────────────────────
const INITIAL_SERVICES: Service[] = [];

const DEFAULT_DOCS = [
  'Business Registration', 'Identity Proof', 'Address Proof', 'Tax Certificate',
  'Bank Statement', 'NOC Letter', 'Partnership Deed', 'Utility Bill',
];

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG: Record<ServiceStatus, { badge: string; icon: React.ReactNode; dot: string }> = {
  Active:   { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="w-3 h-3" />, dot: 'bg-emerald-500' },
  Inactive: { badge: 'bg-gray-100 text-gray-600 border-gray-200',         icon: <XCircle className="w-3 h-3" />,    dot: 'bg-gray-400' },
  Draft:    { badge: 'bg-amber-100 text-amber-800 border-amber-200',      icon: <FileEdit className="w-3 h-3" />,   dot: 'bg-amber-500' },
};

function StatusBadge({ status }: { status: ServiceStatus }) {
  const { badge, icon } = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
      {icon}{status}
    </span>
  );
}

// ── Add / Edit Service Modal ──────────────────────────────────
function ServiceModal({
  mode,
  service,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  service?: Service;
  onClose: () => void;
  onSave: (data: Partial<Service>) => void;
}) {
  const [form, setForm] = useState({
    name: service?.name ?? '',
    category: service?.category ?? CATEGORIES[0],
    description: service?.description ?? '',
    govtFee: service?.govtFee?.toString() ?? '0',
    officeCharge: service?.officeCharge?.toString() ?? '0',
    estDays: service?.estDays?.toString() ?? '7',
    status: service?.status ?? 'Active' as ServiceStatus,
    selectedDocs: service?.requiredDocs.map(d => d.name) ?? [] as string[],
    customDoc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Service name is required';
    if (isNaN(Number(form.govtFee)) || Number(form.govtFee) < 0) e.govtFee = 'Valid amount required';
    if (isNaN(Number(form.officeCharge)) || Number(form.officeCharge) < 0) e.officeCharge = 'Valid amount required';
    if (isNaN(Number(form.estDays)) || Number(form.estDays) < 1) e.estDays = 'Minimum 1 day';
    return e;
  }

  function toggleDoc(doc: string) {
    setForm(p => ({
      ...p,
      selectedDocs: p.selectedDocs.includes(doc)
        ? p.selectedDocs.filter(d => d !== doc)
        : [...p.selectedDocs, doc],
    }));
  }

  function addCustomDoc() {
    const doc = form.customDoc.trim();
    if (doc && !form.selectedDocs.includes(doc)) {
      setForm(p => ({ ...p, selectedDocs: [...p.selectedDocs, doc], customDoc: '' }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      name: form.name,
      category: form.category,
      description: form.description,
      govtFee: Number(form.govtFee),
      officeCharge: Number(form.officeCharge),
      estDays: Number(form.estDays),
      status: form.status,
      requiredDocs: form.selectedDocs.map(n => ({ name: n })),
    });
    onClose();
  }

  const totalFee = Number(form.govtFee) + Number(form.officeCharge);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto admin-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              {mode === 'add' ? <Plus className="w-5 h-5 text-[#a8d5b9]" /> : <Edit2 className="w-5 h-5 text-[#a8d5b9]" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">{mode === 'add' ? 'Add New Service' : 'Edit Service'}</h2>
              <p className="text-[11px] text-gray-400">{mode === 'add' ? 'Configure and publish a new service' : service?.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Service Name</label>
            <input type="text" placeholder="e.g. Commercial Fiber Broadband"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
            {errors.name && <p className="text-[10px] text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Active', 'Inactive', 'Draft'] as ServiceStatus[]).map(s => (
                  <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                    className={`py-2 rounded-xl border text-[10px] font-bold transition-all ${form.status === s ? STATUS_CFG[s].badge + ' ring-2 ring-[#12372A] ring-offset-1' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Govt. Fee (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="number" min="0" value={form.govtFee} onChange={e => setForm(p => ({ ...p, govtFee: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
              </div>
              {errors.govtFee && <p className="text-[10px] text-rose-600 mt-1">{errors.govtFee}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Office Charge (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="number" min="0" value={form.officeCharge} onChange={e => setForm(p => ({ ...p, officeCharge: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
              </div>
              {errors.officeCharge && <p className="text-[10px] text-rose-600 mt-1">{errors.officeCharge}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Est. Days</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="number" min="1" value={form.estDays} onChange={e => setForm(p => ({ ...p, estDays: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
              </div>
              {errors.estDays && <p className="text-[10px] text-rose-600 mt-1">{errors.estDays}</p>}
            </div>
          </div>

          {/* Total fee preview */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#f0f7f2] border border-[#a8d5b9]/50">
            <span className="text-xs font-bold text-[#12372A]">Total Fee</span>
            <span className="text-base font-extrabold text-[#12372A]">₹{totalFee.toLocaleString('en-IN')}</span>
          </div>

          {/* Required Docs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Required Documents</label>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {DEFAULT_DOCS.map(doc => (
                <button key={doc} type="button" onClick={() => toggleDoc(doc)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-semibold text-left transition-all ${form.selectedDocs.includes(doc) ? 'bg-[#12372A] border-[#12372A] text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate">{doc}</span>
                </button>
              ))}
            </div>
            {/* Custom doc input */}
            <div className="flex gap-2">
              <input type="text" placeholder="Add custom document..." value={form.customDoc}
                onChange={e => setForm(p => ({ ...p, customDoc: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomDoc(); }}}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
              <button type="button" onClick={addCustomDoc}
                className="px-3 py-2 rounded-xl bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors">
                Add
              </button>
            </div>
            {form.selectedDocs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.selectedDocs.map(d => (
                  <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0f7f2] border border-[#a8d5b9] text-[10px] font-bold text-[#12372A]">
                    {d}
                    <button type="button" onClick={() => toggleDoc(d)} className="hover:text-rose-600 transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of the service..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors shadow-md">
              {mode === 'add' ? 'Publish Service' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── View Detail Modal ─────────────────────────────────────────
function ViewModal({ service, onClose }: { service: Service; onClose: () => void }) {
  const fmtAmt = (n: number) => n === 0 ? '—' : `₹${n.toLocaleString('en-IN')}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center"><Eye className="w-5 h-5 text-[#a8d5b9]" /></div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Service Detail</h2>
              <p className="text-[11px] text-gray-400">{service.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div>
            <p className="text-base font-extrabold text-gray-900">{service.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold">{service.category}</span>
            <StatusBadge status={service.status} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Govt. Fee', value: fmtAmt(service.govtFee) },
              { label: 'Office Charge', value: fmtAmt(service.officeCharge) },
              { label: 'Total Fee', value: `₹${(service.govtFee + service.officeCharge).toLocaleString('en-IN')}` },
            ].map(r => (
              <div key={r.label} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-[9px] text-gray-400 font-semibold uppercase mb-0.5">{r.label}</p>
                <p className="text-xs font-extrabold text-[#12372A]">{r.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <Clock className="w-4 h-4 text-gray-400" />
            <p className="text-xs font-semibold text-gray-700">Estimated completion: <span className="font-extrabold text-gray-900">{service.estDays} working days</span></p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Required Documents ({service.requiredDocs.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {service.requiredDocs.map(d => (
                <span key={d.name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0f7f2] border border-[#a8d5b9] text-[10px] font-bold text-[#12372A]">
                  <BadgeCheck className="w-2.5 h-2.5" />{d.name}
                </span>
              ))}
              {service.requiredDocs.length === 0 && <span className="text-[11px] text-gray-400">No documents required</span>}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────
function DeleteModal({ service, onClose, onConfirm }: { service: Service; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6 text-rose-600" /></div>
        <div className="text-center">
          <h2 className="text-base font-extrabold text-gray-900">Delete Service?</h2>
          <p className="text-xs text-gray-500 mt-1.5">Are you sure you want to delete <span className="font-bold text-gray-700">{service.name}</span>? This cannot be undone.</p>
        </div>
        {service.status === 'Active' && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium">This service is currently Active. Deleting it may affect existing applications.</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
type FilterType = 'All' | ServiceStatus;

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewService, setViewService] = useState<Service | null>(null);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteService, setDeleteService] = useState<Service | null>(null);

  const filtered = useMemo(() => services.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    const matchCat = filterCategory === 'All' || s.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  }), [services, search, filterStatus, filterCategory]);

  function handleAdd(data: Partial<Service>) {
    const newSvc: Service = {
      id: `SVC-${String(services.length + 1).padStart(3, '0')}`,
      name: data.name ?? '',
      category: data.category ?? 'Support',
      requiredDocs: data.requiredDocs ?? [],
      govtFee: data.govtFee ?? 0,
      officeCharge: data.officeCharge ?? 0,
      estDays: data.estDays ?? 7,
      status: data.status ?? 'Draft',
      description: data.description ?? '',
    };
    setServices(prev => [newSvc, ...prev]);
  }

  function handleEdit(data: Partial<Service>) {
    if (!editService) return;
    setServices(prev => prev.map(s => s.id === editService.id ? { ...s, ...data } : s));
  }

  function toggleStatus(id: string) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
  }

  function handleDelete(id: string) {
    setServices(prev => prev.filter(s => s.id !== id));
  }

  const counts = {
    total: services.length,
    active: services.filter(s => s.status === 'Active').length,
    inactive: services.filter(s => s.status === 'Inactive').length,
    draft: services.filter(s => s.status === 'Draft').length,
  };

  const fmtAmt = (n: number) => n === 0 ? '—' : `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>

      {/* ── Page Header ── */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#12372A] hover:bg-[#1a4a38] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#a8d5b9]" />
          Add New Service
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', value: counts.total, icon: <Building2 className="w-5 h-5 text-[#12372A]" />, bg: 'bg-[#f0f7f2] border-[#a8d5b9]/50', text: 'text-[#12372A]', sub: 'In catalog' },
          { label: 'Active Services', value: counts.active, icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', sub: 'Published & live' },
          { label: 'Inactive Services', value: counts.inactive, icon: <XCircle className="w-5 h-5 text-gray-500" />, bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', sub: 'Disabled' },
          { label: 'Draft Services', value: counts.draft, icon: <FileEdit className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', sub: 'Unpublished' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl border p-5 ${card.bg} hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center">{card.icon}</div>
            </div>
            <p className={`text-3xl font-extrabold ${card.text}`}>{card.value}</p>
            <p className="text-xs text-gray-500 font-semibold mt-1">{card.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by service name or ID..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] shadow-xs transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button onClick={() => setShowStatusMenu(s => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition-all">
            <Filter className="w-4 h-4 text-gray-500" />
            {filterStatus === 'All' ? 'All Status' : filterStatus}
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showStatusMenu ? 'rotate-180' : ''}`} />
          </button>
          {showStatusMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 py-1.5">
              {(['All', 'Active', 'Inactive', 'Draft'] as FilterType[]).map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setShowStatusMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold' : 'text-gray-700 hover:bg-gray-50'}`}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button onClick={() => setShowCatMenu(s => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition-all">
            <Tag className="w-4 h-4 text-gray-500" />
            {filterCategory === 'All' ? 'All Categories' : filterCategory}
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showCatMenu ? 'rotate-180' : ''}`} />
          </button>
          {showCatMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 py-1.5">
              {['All', ...CATEGORIES].map(c => (
                <button key={c} onClick={() => { setFilterCategory(c); setShowCatMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${filterCategory === c ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold' : 'text-gray-700 hover:bg-gray-50'}`}>{c}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Services Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
          <div className="col-span-3">Service Name</div>
          <div className="col-span-2">Required Docs</div>
          <div className="col-span-1 text-right">Govt. Fee</div>
          <div className="col-span-1 text-right">Office Charge</div>
          <div className="col-span-1 text-right">Total Fee</div>
          <div className="col-span-1 text-center">Est. Time</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400">No services found</p>
            <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : filtered.map((svc, idx) => (
          <div key={svc.id} className={`grid grid-cols-12 px-5 py-4 items-center hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
            {/* Service Name */}
            <div className="col-span-3 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_CFG[svc.status].dot}`} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{svc.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">{svc.category}</span>
                </div>
              </div>
            </div>

            {/* Required Docs */}
            <div className="col-span-2">
              {svc.requiredDocs.length === 0 ? (
                <span className="text-[11px] text-gray-400 italic">None</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[9px] font-bold border border-gray-200">
                    <FileText className="w-2.5 h-2.5" />{svc.requiredDocs[0].name}
                  </span>
                  {svc.requiredDocs.length > 1 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[9px] font-bold border border-gray-200">
                      +{svc.requiredDocs.length - 1} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Govt Fee */}
            <div className="col-span-1 text-right">
              <span className="text-xs font-semibold text-gray-700">{fmtAmt(svc.govtFee)}</span>
            </div>

            {/* Office Charge */}
            <div className="col-span-1 text-right">
              <span className="text-xs font-semibold text-gray-700">{fmtAmt(svc.officeCharge)}</span>
            </div>

            {/* Total Fee */}
            <div className="col-span-1 text-right">
              <span className="text-sm font-extrabold text-[#12372A]">₹{(svc.govtFee + svc.officeCharge).toLocaleString('en-IN')}</span>
            </div>

            {/* Est Time */}
            <div className="col-span-1 text-center">
              <div className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-700">{svc.estDays}d</span>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-1 flex justify-center">
              <StatusBadge status={svc.status} />
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-center gap-1.5">
              <button onClick={() => setViewService(svc)}
                className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all" title="View">
                <Eye className="w-3 h-3" />
              </button>
              <button onClick={() => setEditService(svc)}
                className="w-7 h-7 rounded-full bg-[#f0f7f2] hover:bg-[#12372A] text-[#12372A] hover:text-white flex items-center justify-center transition-all" title="Edit">
                <Edit2 className="w-3 h-3" />
              </button>
              <button onClick={() => toggleStatus(svc.id)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${svc.status === 'Active' ? 'bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white' : 'bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white'}`}
                title={svc.status === 'Active' ? 'Deactivate' : 'Activate'}>
                {svc.status === 'Active' ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
              </button>
              <button onClick={() => setDeleteService(svc)}
                className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-all" title="Delete">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {services.length} services</p>
          <p className="text-[11px] text-gray-400">{counts.active} active · {counts.draft} drafts</p>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && <ServiceModal mode="add" onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editService && <ServiceModal mode="edit" service={editService} onClose={() => setEditService(null)} onSave={handleEdit} />}
      {viewService && <ViewModal service={viewService} onClose={() => setViewService(null)} />}
      {deleteService && <DeleteModal service={deleteService} onClose={() => setDeleteService(null)} onConfirm={() => handleDelete(deleteService.id)} />}
    </div>
  );
}
