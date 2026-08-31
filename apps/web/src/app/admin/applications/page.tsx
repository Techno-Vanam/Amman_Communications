'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Upload,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import {
  fetchApplicationsAction,
  updateApplicationStatusAction,
  updateApplicationAction,
  createApplicationAction,
  fetchCustomersForSelectAction,
  adminUploadDocumentAction,
  fetchApplicationDocumentsAction,
  updateDocumentStatusAction,
} from './actions';

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

// ── Live Dataset ─────────────────────────────────────────────────
const INITIAL_APPS: Application[] = [];

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

const APP_PIPELINE: AppStatus[] = [
  'Submitted', 'Under Verification', 'Documents Received',
  'Approved', 'Pending Payment', 'Completed'
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

const downloadFileWithFetch = async (url: string, fallbackName: string) => {
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const objUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    
    let name = fallbackName;
    const cd = res.headers.get('content-disposition');
    if (cd && cd.includes('filename=')) {
      const match = cd.match(/filename="?([^"]+)"?/);
      if (match && match[1]) name = match[1];
    }
    
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(objUrl);
  } catch (err) {
    console.error('Download error:', err);
    alert('Failed to download document.');
  }
};

// ── Detail / View Modal ───────────────────────────────────────
function ViewModal({ app, onClose, onAdvance }: { app: Application; onClose: () => void; onAdvance?: () => void }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    fetchApplicationDocumentsAction(app.id).then(res => {
      if (res.success && res.data) setDocs(res.data);
      setLoadingDocs(false);
    });
  }, [app.id]);

  async function handleVerify(docId: string, status: 'VERIFIED' | 'REJECTED') {
    const res = await updateDocumentStatusAction(app.id, docId, status);
    if (res.success) {
      setDocs(docs.map(d => d.documentId === docId ? { ...d, status } : d));
    } else {
      alert(res.error || 'Failed to update document status');
    }
  }

  const DOC_STATUS_COLORS: Record<string, string> = {
    UPLOADED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    VERIFIED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-rose-100 text-rose-700',
    ACTION_REQUIRED: 'bg-orange-100 text-orange-700',
  };

  const currStageIndex = APP_PIPELINE.indexOf(app.status);
  const nextStage = currStageIndex !== -1 && currStageIndex < APP_PIPELINE.length - 1 ? APP_PIPELINE[currStageIndex + 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
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
        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {currStageIndex !== -1 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Pipeline Progress</p>
                <p className="text-[10px] font-bold text-gray-900">{currStageIndex + 1} / {APP_PIPELINE.length}</p>
              </div>
              <div className="flex items-center gap-1">
                {APP_PIPELINE.map((stage, idx) => (
                  <div key={stage} className={`h-1.5 flex-1 rounded-full ${idx <= currStageIndex ? 'bg-[#12372A]' : 'bg-gray-100'}`} title={stage} />
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Customer', value: app.customer, icon: <User className="w-4 h-4 text-gray-400" /> },
              { label: 'Email', value: app.email, icon: <Mail className="w-4 h-4 text-gray-400" /> },
              { label: 'Phone', value: app.phone, icon: <Phone className="w-4 h-4 text-gray-400" /> },
              { label: 'Service', value: app.serviceType, icon: <Building2 className="w-4 h-4 text-gray-400" /> },
              { label: 'Created Date', value: new Date(app.createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), icon: <CalendarDays className="w-4 h-4 text-gray-400" /> },
            ].map(row => (
              <div key={row.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">{row.icon}</div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{row.label}</p>
                  <p className="text-xs font-bold text-gray-800 mt-0.5 truncate" title={row.value}>{row.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Status</p>
                <StatusBadge status={app.status} />
              </div>
            </div>
          </div>
          {app.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wide mb-1">Remarks</p>
              <p className="text-xs text-amber-800">{app.notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#12372A]" /> Uploaded Documents
            </h3>
            {loadingDocs ? (
              <p className="text-xs text-gray-400">Loading documents...</p>
            ) : docs.length === 0 ? (
              <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#12372A] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{doc.documentType?.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-gray-400 truncate">{doc.originalFileName || doc.fileName}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${DOC_STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button onClick={() => {
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
                        const url = doc.downloadUrl?.startsWith('http') && !doc.downloadUrl.includes('localhost') ? doc.downloadUrl : `${baseUrl}/api/v1/admin/applications/${app.id}/documents/${doc.documentId}/stream`;
                        setViewingDoc({ url, name: doc.originalFileName || doc.fileName });
                      }}
                        className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button onClick={() => {
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
                        const baseDocUrl = doc.downloadUrl?.startsWith('http') && !doc.downloadUrl.includes('localhost') ? doc.downloadUrl : `${baseUrl}/api/v1/admin/applications/${app.id}/documents/${doc.documentId}/stream`;
                        const dlUrl = baseDocUrl.includes('?') ? `${baseDocUrl}&download=true` : `${baseDocUrl}?download=true`;
                        downloadFileWithFetch(dlUrl, doc.originalFileName || doc.fileName || 'document.pdf');
                      }}
                        className="flex-1 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors" title="Download">
                        <Download className="w-3 h-3" /> DL
                      </button>
                      <button onClick={() => handleVerify(doc.documentId, 'VERIFIED')} disabled={doc.status === 'VERIFIED'}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
                        <CheckCircle className="w-3 h-3" /> Verify
                      </button>
                      <button onClick={() => handleVerify(doc.documentId, 'REJECTED')} disabled={doc.status === 'REJECTED'}
                        className="flex-1 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50 rounded-b-3xl flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors">
            Close
          </button>
          {nextStage && onAdvance && (
            <button onClick={() => { onAdvance(); onClose(); }} className="flex-1 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors flex items-center justify-center gap-2">
              Advance to {nextStage} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {viewingDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-900 truncate pr-4">{viewingDoc.name}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const dlUrl = viewingDoc.url.includes('?') ? `${viewingDoc.url}&download=true` : `${viewingDoc.url}?download=true`;
                  downloadFileWithFetch(dlUrl, viewingDoc.name);
                }} className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center justify-center transition-colors shrink-0" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => setViewingDoc(null)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors shrink-0">
                  <X className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative bg-gray-100">
              <iframe src={viewingDoc.url} className="w-full h-full border-0" title="Document Viewer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add / Edit Application Modal ──────────────────────────────
function AppModal({
  mode,
  app,
  customers,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  app?: Application;
  customers: { id: string; name: string; email: string; phone: string }[];
  onClose: () => void;
  onSave: (data: Partial<Application> & { customerId?: string }) => void;
}) {
  const [form, setForm] = useState({
    customerId: app ? '' : (customers[0]?.id ?? ''),
    customer: app?.customer ?? '',
    email: app?.email ?? '',
    phone: app?.phone ?? '',
    serviceType: app?.serviceType ?? SERVICE_TYPES[0],
    status: app?.status ?? 'Submitted' as AppStatus,
    notes: app?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});;

  function validate() {
    const e: Record<string, string> = {};
    if (mode === 'add' && !form.customerId) e.customerId = 'Select a customer';
    if (mode === 'edit' && !form.customer.trim()) e.customer = 'Customer name is required';
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
            {mode === 'add' ? (
              <>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Customer</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={form.customerId}
                    onChange={e => {
                      const cust = customers.find(c => c.id === e.target.value);
                      setForm(p => ({ ...p, customerId: e.target.value, email: cust?.email || '', phone: cust?.phone || '' }));
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none">
                    {customers.length === 0 && <option value="">No customers found — create a customer first</option>}
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.customerId && <p className="text-[10px] text-rose-600 mt-1">{errors.customerId}</p>}
              </>
            ) : (
              <>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Full name" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all" />
                </div>
                {errors.customer && <p className="text-[10px] text-rose-600 mt-1">{errors.customer}</p>}
              </>
            )}
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

          {/* Service */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Service</label>
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

// ── Document Upload Modal ──────────────────────────────────────
const DOC_TYPES = [
  'BUSINESS_REGISTRATION', 'IDENTITY_PROOF', 'ADDRESS_PROOF',
  'TAX_CERTIFICATE', 'BANK_STATEMENT', 'UTILITY_BILL',
  'NOC_LETTER', 'PARTNERSHIP_DEED', 'PASSPORT', 'AADHAR_CARD', 'OTHER',
];

function DocumentUploadModal({
  app,
  onClose,
  onUploaded,
}: {
  app: Application;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchApplicationDocumentsAction(app.id).then(res => {
      if (res.success && res.data) setExistingDocs(res.data);
    });
  }, [app.id]);

  function handleFilePick(picked: File | null) {
    if (!picked) return;
    if (picked.size > 10 * 1024 * 1024) { setErrorMsg('File too large. Max size is 10MB.'); return; }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(picked.type)) { setErrorMsg('Only PDF, JPG, PNG, WEBP are allowed.'); return; }
    setErrorMsg(null);
    setFile(picked);
  }

  async function handleUpload() {
    if (!file) { setErrorMsg('Please select a file.'); return; }
    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = (e.target?.result as string) || '';
      const res = await adminUploadDocumentAction(app.id, {
        documentType: docType,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        base64Data,
      });
      setUploading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(`✅ ${file.name} uploaded successfully!`);
        setFile(null);
        const docsRes = await fetchApplicationDocumentsAction(app.id);
        if (docsRes.success && docsRes.data) setExistingDocs(docsRes.data);
        onUploaded();
      }
    };
    reader.readAsDataURL(file);
  }

  const STATUS_COLORS: Record<string, string> = {
    UPLOADED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    VERIFIED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-rose-100 text-rose-700',
    ACTION_REQUIRED: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Upload Document</h2>
              <p className="text-[11px] text-gray-400">For {app.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {existingDocs.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-[#12372A]" /> Uploaded Documents ({existingDocs.length})
              </p>
              <div className="space-y-1.5">
                {existingDocs.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-gray-700 truncate">{doc.documentType?.replace(/_/g, ' ')}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Document Type</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={docType} onChange={e => setDocType(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none">
                {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFilePick(e.dataTransfer.files[0] || null); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${dragging ? 'border-[#12372A] bg-[#f0f7f2]' : 'border-gray-200 hover:border-[#12372A] hover:bg-gray-50'}`}>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
              onChange={e => handleFilePick(e.target.files?.[0] || null)} />
            <div className="w-12 h-12 rounded-2xl bg-[#12372A]/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#12372A]" />
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-bold text-[#12372A]">{file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB · {file.type.split('/')[1].toUpperCase()}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">Drop file here or click to browse</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG, WEBP · Max 10 MB</p>
              </div>
            )}
          </div>

          {errorMsg && <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{errorMsg}</p>}
          {successMsg && <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">{successMsg}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {uploading
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                : <><Upload className="w-3.5 h-3.5" /> Upload Document</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function exportCSV(data: Application[]) {
  const headers = ['Application ID', 'Customer', 'Email', 'Phone', 'Service', 'Created Date', 'Status', 'Remarks'];
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
  const [apps, setApps] = useState<Application[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string; email: string; phone: string }[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewApp, setViewApp] = useState<Application | null>(null);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [deleteApp, setDeleteApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadDocApp, setUploadDocApp] = useState<Application | null>(null);

  const loadApps = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await fetchApplicationsAction();
    if (res.error) {
      setErrorMsg(res.error);
      setApps([]);
    } else if (res.success && res.data) {
      const DB_TO_UI_STATUS: Record<string, string> = {
        SUBMITTED: 'Submitted',
        UNDER_REVIEW: 'Under Verification',
        DOCUMENTS_RECEIVED: 'Documents Received',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
        PENDING_PAYMENT: 'Pending Payment',
        COMPLETED: 'Completed',
        DRAFT: 'Submitted',
      };
      const mapped = res.data.map((a: any) => ({
        id: a.id,
        customer: a.fullName || a.customer?.name || '—',
        email: a.email || a.customer?.email || '—',
        phone: a.phone || '—',
        serviceType: a.service?.name || a.serviceType || a.title || 'Support',
        createdDate: a.createdAt ? a.createdAt.split('T')[0] : '',
        status: DB_TO_UI_STATUS[a.status] || 'Submitted',
        notes: a.notes || '',
      }));
      setApps(mapped);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadApps();
    // Also pre-load customer list for the New Application modal
    fetchCustomersForSelectAction().then(res => {
      if (res.success && res.data) setCustomers(res.data);
    });
  }, []);

  const filtered = useMemo(() => apps.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.id.toLowerCase().includes(q) || a.customer.toLowerCase().includes(q) ||
      a.serviceType.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    const matchFilter = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchFilter;
  }), [apps, search, filterStatus]);

  async function handleAdd(data: Partial<Application> & { customerId?: string }) {
    if (!data.customerId) return;
    setErrorMsg(null);
    const res = await createApplicationAction({
      customerId: data.customerId,
      serviceType: data.serviceType || SERVICE_TYPES[0],
      notes: data.notes,
    });
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setShowAddModal(false);
      loadApps();
    }
  }

  async function handleEdit(data: Partial<Application>) {
    if (!editApp) return;
    setErrorMsg(null);
    const res = await updateApplicationAction(editApp.id, data);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setEditApp(null);
      loadApps();
    }
  }

  async function handleAdvance(app: Application) {
    const idx = APP_PIPELINE.indexOf(app.status);
    if (idx !== -1 && idx < APP_PIPELINE.length - 1) {
      const nextStatus = APP_PIPELINE[idx + 1];
      const res = await updateApplicationStatusAction(app.id, nextStatus);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        loadApps();
      }
    }
  }

  function handleDelete(id: string) {
    // Left unimplemented since Admin cannot delete applications
  }

  const counts = Object.fromEntries(
    (['All', ...ALL_STATUSES] as FilterType[]).map(s => [s, s === 'All' ? apps.length : apps.filter(a => a.status === s).length])
  );

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>



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
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-sm mr-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, customer, service..."
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
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowFilterMenu(s => !s)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition-all"
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
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#12372A] hover:bg-[#1a4a38] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 text-[#a8d5b9]" />
          New Application
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[660px]">
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
              <div className="col-span-3">Customer</div>
              <div className="col-span-3">Service</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Actions</div>
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
                {/* Customer */}
                <div className="col-span-3 flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#12372A] to-[#2e8a60] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {a.customer.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{a.customer}</p>
                    <p className="text-[10px] text-gray-400 truncate">{a.id}</p>
                  </div>
                </div>
                {/* Service */}
                <div className="col-span-3 min-w-0 pr-2">
                  <p className="text-xs text-gray-700 font-semibold truncate">{a.serviceType}</p>
                </div>
                {/* Date */}
                <div className="col-span-2">
                  <p className="text-[11px] text-gray-600 font-medium whitespace-nowrap">{fmtDate(a.createdDate)}</p>
                </div>
                {/* Status */}
                <div className="col-span-2 flex justify-center">
                  <StatusBadge status={a.status} />
                </div>
                {/* Actions */}
                <div className="col-span-2 flex items-center justify-center gap-1.5">
                  <button onClick={() => setViewApp(a)} className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all" title="View">
                    <Eye className="w-3 h-3" />
                  </button>
                  <button onClick={() => setUploadDocApp(a)} className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition-all" title="Upload Document">
                    <Upload className="w-3 h-3" />
                  </button>
                  {APP_PIPELINE.indexOf(a.status) !== -1 && APP_PIPELINE.indexOf(a.status) < APP_PIPELINE.length - 1 && (
                    <button onClick={() => handleAdvance(a)} className="w-7 h-7 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all" title="Advance Stage">
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
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
      {showAddModal && <AppModal mode="add" customers={customers} onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editApp && <AppModal mode="edit" app={editApp} customers={customers} onClose={() => setEditApp(null)} onSave={handleEdit} />}
      {viewApp && <ViewModal app={viewApp} onClose={() => setViewApp(null)} />}
      {uploadDocApp && <DocumentUploadModal app={uploadDocApp} onClose={() => setUploadDocApp(null)} onUploaded={() => {}} />}
      {deleteApp && <DeleteModal app={deleteApp} onClose={() => setDeleteApp(null)} onConfirm={() => handleDelete(deleteApp.id)} />}
    </div>
  );
}

