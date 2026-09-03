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
  Check,
  ChevronRight,
  ArrowUpRight,
  ArrowLeft,
  FileCheck,
  LayoutGrid,
  List,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomTabDropdown from '@/components/ui/CustomTabDropdown';
import { fetchApplicationsAction, updateApplicationStatusAction, createApplicationAction } from './actions';
import { fetchCustomersAction } from '../customers/actions';
import { fetchServicesAction } from '../services/actions';

// ── Types & Phase Config ─────────────────────────────────────────
type AppStatus =
  | 'Submitted'
  | 'Under Verification'
  | 'Documents Received'
  | 'Approved'
  | 'Rejected'
  | 'Pending Payment'
  | 'Completed';

const TRACKER_PHASES = [
  { step: 1, title: 'Application Submitted' },
  { step: 2, title: 'Documents Received' },
  { step: 3, title: 'Verification' },
  { step: 4, title: 'Processing' },
  { step: 5, title: 'Government Submission' },
  { step: 6, title: 'Awaiting Approval' },
  { step: 7, title: 'Completed' },
  { step: 8, title: 'Ready for Collection' },
] as const;

interface AppDocument {
  id: string;
  name: string;
  required: string;
  uploaded: string;
  status: 'Approved' | 'Under Review' | 'Pending';
  uploadedFile?: string;
}

interface Application {
  id: string; // Real DB CUID
  applicationNumber: string; // Display ID (e.g. APP-2026-001)
  customer: string;
  email: string;
  phone: string;
  serviceType: string;
  createdDate: string;
  status: AppStatus;
  stepPhase: number; // 1 to 8
  phaseDates?: Record<number, string>;
  notes?: string;
  paidAmount?: number;
  paymentStatus?: 'Paid' | 'Pending' | 'Overdue';
  paymentMode?: string;
  txnRef?: string;
  assignedOfficer?: string;
  documents?: AppDocument[];
}

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
  'Submitted',
  'Under Verification',
  'Documents Received',
  'Approved',
  'Rejected',
  'Pending Payment',
  'Completed',
];

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
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0 ${badge}`}>
      {icon}{status}
    </span>
  );
}

// ── Default Mock Initial Apps ────────────────────────────────────
const DEFAULT_SAMPLE_APPS: Application[] = [
  {
    id: 'APP-2026-001',
    applicationNumber: 'APP-2026-001',
    customer: 'Acme Telecom Ltd',
    email: 'contact@acme.com',
    phone: '+91 98765 43210',
    serviceType: 'Commercial Fiber Broadband',
    createdDate: '2026-08-25',
    status: 'Under Verification',
    stepPhase: 3,
    paidAmount: 2500,
    paymentStatus: 'Paid',
    paymentMode: 'UPI / NetBanking',
    txnRef: 'TXN-998412',
    assignedOfficer: 'Officer Rajesh Kumar',
    notes: 'Commercial license and identity proof verified.',
    phaseDates: {
      1: '25 Aug 2026',
      2: '26 Aug 2026',
      3: '28 Aug 2026'
    },
    documents: [
      { id: 'doc-1', name: 'Identity Proof (Aadhaar / Voter ID)', required: 'Required', uploaded: 'Yes', status: 'Approved', uploadedFile: 'aadhaar_copy.pdf' },
      { id: 'doc-2', name: 'PAN Card Copy', required: 'Required', uploaded: 'Yes', status: 'Approved', uploadedFile: 'pan_card.pdf' },
      { id: 'doc-3', name: 'Property Ownership / Rent Agreement', required: 'Required', uploaded: 'Yes', status: 'Under Review', uploadedFile: 'rent_agreement.pdf' },
      { id: 'doc-4', name: 'Bank Passbook Statement', required: 'Optional', uploaded: 'Yes', status: 'Approved', uploadedFile: 'bank_statement.pdf' },
    ]
  },
  {
    id: 'APP-2026-002',
    applicationNumber: 'APP-2026-002',
    customer: 'Vanam Software Solutions',
    email: 'admin@vanam.io',
    phone: '+91 98123 45678',
    serviceType: 'Dedicated Leased Line',
    createdDate: '2026-08-20',
    status: 'Documents Received',
    stepPhase: 2,
    paidAmount: 4800,
    paymentStatus: 'Paid',
    paymentMode: 'NEFT / RTGS',
    txnRef: 'TXN-774102',
    assignedOfficer: 'Officer Priya Sharma',
    notes: 'Site inspection scheduled for government submission.',
    phaseDates: {
      1: '20 Aug 2026',
      2: '22 Aug 2026'
    },
    documents: [
      { id: 'doc-1', name: 'Company Incorporation Certificate', required: 'Required', uploaded: 'Yes', status: 'Approved', uploadedFile: 'inc_cert.pdf' },
      { id: 'doc-2', name: 'GST Registration Copy', required: 'Required', uploaded: 'Yes', status: 'Under Review', uploadedFile: 'gst_copy.pdf' },
      { id: 'doc-3', name: 'Technical Architecture Plan', required: 'Required', uploaded: 'Yes', status: 'Pending', uploadedFile: 'arch_plan.pdf' }
    ]
  },
  {
    id: 'APP-2026-003',
    applicationNumber: 'APP-2026-003',
    customer: 'Amman Retail Outlets',
    email: 'info@ammanretail.com',
    phone: '+91 99887 76655',
    serviceType: 'Enterprise VoIP Infrastructure',
    createdDate: '2026-08-15',
    status: 'Completed',
    stepPhase: 8,
    paidAmount: 1800,
    paymentStatus: 'Paid',
    paymentMode: 'Credit Card',
    txnRef: 'TXN-551940',
    assignedOfficer: 'Officer Suresh Verma',
    notes: 'Installation and final verification completed.',
    phaseDates: {
      1: '15 Aug 2026',
      2: '16 Aug 2026',
      3: '18 Aug 2026',
      4: '20 Aug 2026',
      5: '22 Aug 2026',
      6: '24 Aug 2026',
      7: '26 Aug 2026',
      8: '28 Aug 2026'
    },
    documents: [
      { id: 'doc-1', name: 'Identity Proof', required: 'Required', uploaded: 'Yes', status: 'Approved', uploadedFile: 'id_proof.pdf' },
      { id: 'doc-2', name: 'Service Agreement Copy', required: 'Required', uploaded: 'Yes', status: 'Approved', uploadedFile: 'agreement.pdf' }
    ]
  }
];

// ── 8-Step Application Status Tracker Component ──────────────────
function AdminStatusTracker({
  stepPhase,
  onPhaseChange,
  submittedDate = '25 Aug 2026',
  phaseDates = {}
}: {
  stepPhase: number;
  onPhaseChange?: (newStep: number) => void;
  submittedDate?: string;
  phaseDates?: Record<number, string>;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Application Status Tracker
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Click any phase circle (1-8) below to advance or update application progress.
          </p>
        </div>
        <span className="text-xs font-extrabold text-[#12372A] bg-[#f0f7f2] border border-[#a8d5b9] px-3.5 py-1 rounded-full shadow-2xs">
          Phase {stepPhase} of 8: {TRACKER_PHASES[stepPhase - 1]?.title}
        </span>
      </div>

      {/* Stepper Nodes */}
      <div className="relative pt-2 pb-2 w-full overflow-x-auto admin-scrollbar">
        <div className="w-full min-w-[560px] sm:min-w-0 grid grid-cols-8 relative py-1">
          {/* Connecting Track Line (100% Equal Center-to-Center Spacing) */}
          <div className="absolute top-[12px] sm:top-[18px] left-[6.25%] right-[6.25%] h-1 bg-gray-200 z-0 overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-to-r from-[#12372A] to-[#2d6a4f] rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${Math.min(100, Math.max(0, ((stepPhase - 1) / (TRACKER_PHASES.length - 1)) * 100))}%`
              }}
            />
          </div>

          {TRACKER_PHASES.map((phase) => {
            const isCompleted = phase.step < stepPhase;
            const isActive = phase.step === stepPhase;

            let phaseDate = '';
            if (phaseDates && phaseDates[phase.step]) {
              phaseDate = phaseDates[phase.step];
            } else if (phase.step === 1) {
              phaseDate = submittedDate;
            } else if (phase.step <= stepPhase) {
              phaseDate = submittedDate;
            }

            return (
              <div
                key={phase.step}
                onClick={() => onPhaseChange && onPhaseChange(phase.step)}
                className={`flex flex-col items-center text-center space-y-1 z-10 px-0.5 ${
                  onPhaseChange ? 'cursor-pointer group' : ''
                }`}
                title={`Click to set Phase ${phase.step}: ${phase.title}`}
              >
                {/* Step Circle */}
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs transition-all shadow-2xs ${
                    isCompleted
                      ? 'bg-[#12372A] text-white ring-2 sm:ring-4 ring-gray-300 group-hover:scale-110'
                      : isActive
                      ? 'bg-[#1c3a63] text-white ring-2 sm:ring-4 ring-gray-300 scale-105 shadow-md'
                      : 'bg-white text-gray-800 hover:border-[#12372A] hover:bg-[#f0f7f2]'
                  }`}
                  style={{
                    border: '2px solid #6b7280',
                    backgroundColor: isCompleted ? '#12372A' : isActive ? '#1c3a63' : '#ffffff'
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3]" />
                  ) : (
                    phase.step
                  )}
                </div>

                {/* Step Title & Date */}
                <div className="space-y-0.5">
                  <p
                    className={`text-[7px] sm:text-[9px] md:text-[11px] font-bold leading-tight line-clamp-2 ${
                      isActive
                        ? 'text-[#1c3a63]'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400 group-hover:text-gray-700'
                    }`}
                  >
                    {phase.title}
                  </p>
                  {phaseDate && (
                    <p className="text-[6px] sm:text-[8px] md:text-[10px] text-gray-500 font-medium hidden sm:block">
                      {phaseDate}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Application Modal ─────────────────────────────────
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
  // Fetch customers and services for dropdowns
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  
  useEffect(() => {
    fetchCustomersAction().then((res) => {
      if (res.success && res.data) {
        setCustomers(res.data.map((c: any) => ({ id: c.id, name: c.name })));
      }
    });
    fetchServicesAction().then((res) => {
      if (res.success && res.data?.items) {
        setServices(res.data.items.map((s: any) => ({ id: s.id, name: s.name })));
      } else if (res.success && res.data) {
        const arr = Array.isArray(res.data) ? res.data : res.data.items || [];
        setServices(arr.map((s: any) => ({ id: s.id, name: s.name })));
      }
    });
  }, []);

  const [form, setForm] = useState({
    customerId: mode === 'add' ? (customers[0]?.id ?? '') : '',
    customer: app?.customer ?? '',
    email: app?.email ?? '',
    phone: app?.phone ?? '',
    serviceType: app?.serviceType ?? (services[0]?.name ?? 'Commercial Fiber Broadband'),
    status: app?.status ?? ('Submitted' as AppStatus),
    stepPhase: app?.stepPhase ?? 1,
    paidAmount: app?.paidAmount ?? 2000,
    notes: app?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (mode === 'add' && !form.customerId) e.customerId = 'Customer is required';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              {mode === 'add' ? <Plus className="w-5 h-5 text-[#a8d5b9]" /> : <Edit2 className="w-5 h-5 text-[#a8d5b9]" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">{mode === 'add' ? 'New Service Application' : 'Edit Application'}</h2>
              <p className="text-[11px] text-gray-400">{mode === 'add' ? 'Fill in all fields to submit' : `Editing ${app?.id}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">Customer *</label>
            <CustomSelect
              value={form.customerId}
              onChange={(val) => {
                const c = customers.find(x => x.id === val);
                setForm({ ...form, customerId: val, customer: c?.name || '' });
              }}
              options={customers.map(c => ({ value: c.id, label: c.name }))}
            />
            {errors.customerId && <p className="text-[10px] text-rose-600 font-bold">{errors.customerId}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="customer@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A]"
              />
              {errors.email && <p className="text-[10px] text-rose-600 font-bold">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">Phone *</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A]"
              />
              {errors.phone && <p className="text-[10px] text-rose-600 font-bold">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">Service Type</label>
            {services.length > 0 ? (
              <CustomSelect
                value={form.serviceType}
                onChange={val => setForm({ ...form, serviceType: val })}
                options={services.map(s => s.name)}
              />
            ) : (
              <CustomSelect
                value={form.serviceType}
                onChange={val => setForm({ ...form, serviceType: val })}
                options={SERVICE_TYPES}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">Application Status</label>
              <CustomSelect
                value={form.status}
                onChange={val => setForm({ ...form, status: val as AppStatus })}
                options={ALL_STATUSES}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">Process Phase Step</label>
              <CustomSelect
                value={`Phase ${form.stepPhase}: ${TRACKER_PHASES[form.stepPhase - 1]?.title}`}
                onChange={val => {
                  const idx = TRACKER_PHASES.findIndex((p) => `Phase ${p.step}: ${p.title}` === val);
                  if (idx !== -1) {
                    setForm({ ...form, stepPhase: idx + 1 });
                  }
                }}
                options={TRACKER_PHASES.map((p) => `Phase ${p.step}: ${p.title}`)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">Remarks / Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Internal administrative notes..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-full bg-[#12372A] hover:bg-[#1a4a38] text-white text-xs font-bold transition-all shadow-md">
              {mode === 'add' ? 'Create Application' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────
function DeleteModal({ app, onClose, onConfirm }: { app: Application; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-gray-900">Delete Application?</h3>
          <p className="text-xs text-gray-500 mt-1">Are you sure you want to delete <strong className="text-gray-800">{app.id}</strong>? This action cannot be undone.</p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Export CSV helper ─────────────────────────────────────────
function exportCSV(data: Application[]) {
  const headers = ['Application ID', 'Customer', 'Email', 'Phone', 'Service Type', 'Created Date', 'Status', 'Process Phase', 'Remarks'];
  const rows = data.map(a => [
    a.id, a.customer, a.email, a.phone, a.serviceType,
    new Date(a.createdDate).toLocaleDateString('en-IN'),
    a.status,
    `Phase ${a.stepPhase || 1}: ${TRACKER_PHASES[(a.stepPhase || 1) - 1]?.title}`,
    a.notes ?? '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `applications_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Main Admin Applications Page ──────────────────────────────
export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [mode, setMode] = useState<'list' | 'view'>('list');
  const [viewStyle, setViewStyle] = useState<'grid' | 'table'>('grid');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'All' | 'Verification' | 'Processing' | 'Completed'>('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [deleteApp, setDeleteApp] = useState<Application | null>(null);

  // ── Database to UI Mapper ──
  function dbToUI(dbApp: any): Application {
    const UI_STATUS: Record<string, AppStatus> = {
      'SUBMITTED': 'Submitted',
      'UNDER_REVIEW': 'Under Verification',
      'DOCUMENTS_RECEIVED': 'Documents Received',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'PENDING_PAYMENT': 'Pending Payment',
      'COMPLETED': 'Completed'
    };

    const STEP_MAP: Record<string, number> = {
      'SUBMITTED': 1,
      'DOCUMENTS_RECEIVED': 2,
      'UNDER_REVIEW': 3,
      'PENDING_PAYMENT': 4,
      'APPROVED': 6,
      'COMPLETED': 8,
      'REJECTED': 7
    };

    return {
      id: dbApp.id, // REAL DB CUID!
      applicationNumber: dbApp.applicationNumber || dbApp.id, // Display ID
      customer: dbApp.customer?.name || dbApp.fullName || 'Unknown',
      email: dbApp.customer?.email || dbApp.email || '',
      phone: dbApp.phone || '',
      serviceType: dbApp.serviceType || dbApp.service?.name || '',
      createdDate: dbApp.createdAt,
      status: UI_STATUS[dbApp.status] || 'Submitted',
      stepPhase: STEP_MAP[dbApp.status] || 1,
      paidAmount: 2000,
      paymentStatus: 'Paid',
      paymentMode: 'UPI',
      txnRef: 'TXN-000000',
      assignedOfficer: 'Officer Rajesh Kumar',
      notes: dbApp.notes || '',
      documents: [],
    };
  }

  const loadApplications = async () => {
    const res = await fetchApplicationsAction();
    if (res.success && res.data) {
      setApps(res.data.map(dbToUI));
    } else {
      setApps(DEFAULT_SAMPLE_APPS);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const saveApps = (updated: Application[]) => {
    setApps(updated);
  };

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        app.id.toLowerCase().includes(q) ||
        app.customer.toLowerCase().includes(q) ||
        app.serviceType.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTabFilter === 'Verification') return app.stepPhase <= 3;
      if (activeTabFilter === 'Processing') return app.stepPhase >= 4 && app.stepPhase <= 6;
      if (activeTabFilter === 'Completed') return app.stepPhase >= 7 || app.status === 'Completed';

      return true;
    });
  }, [apps, searchQuery, activeTabFilter]);

  async function handleAdd(data: any) {
    const res = await createApplicationAction({
      customerId: data.customerId,
      serviceType: data.serviceType,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
    });
    if (res.success) {
      loadApplications();
    } else {
      alert(res.error || 'Failed to create application');
    }
  }

  function handleEdit(data: Partial<Application>) {
    if (!editApp) return;
    const updated = apps.map(a => a.id === editApp.id ? { ...a, ...data } : a);
    saveApps(updated);
    if (selectedApp && selectedApp.id === editApp.id) {
      setSelectedApp({ ...selectedApp, ...data });
    }
  }

  async function handleUpdatePhase(id: string, newStep: number) {
    let newStatus: AppStatus = 'Submitted';
    if (newStep >= 8) newStatus = 'Completed';
    else if (newStep === 7) newStatus = 'Completed';
    else if (newStep === 6) newStatus = 'Approved';
    else if (newStep === 4) newStatus = 'Pending Payment';
    else if (newStep === 3) newStatus = 'Under Verification';
    else if (newStep === 2) newStatus = 'Documents Received';
    else newStatus = 'Submitted';

    // Pass the UI status directly — the action handles UI→DB conversion
    const res = await updateApplicationStatusAction(id, newStatus);
    if (res.success) {
      loadApplications();
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, stepPhase: newStep, status: newStatus });
      }
    } else {
      alert(res.error || 'Failed to update phase');
    }
  }

  function handleToggleDocumentStatus(docId: string) {
    if (!selectedApp) return;
    const updatedDocs = (selectedApp.documents || []).map((doc) => {
      if (doc.id === docId) {
        const nextStatus: AppDocument['status'] =
          doc.status === 'Approved' ? 'Under Review' : doc.status === 'Under Review' ? 'Pending' : 'Approved';
        return { ...doc, status: nextStatus };
      }
      return doc;
    });
    const updatedApp = { ...selectedApp, documents: updatedDocs };
    setSelectedApp(updatedApp);
    saveApps(apps.map((a) => (a.id === selectedApp.id ? updatedApp : a)));
  }

  function handleDelete(id: string) {
    saveApps(apps.filter(a => a.id !== id));
    if (selectedApp && selectedApp.id === id) {
      setMode('list');
      setSelectedApp(null);
    }
  }

  function handleOpenView(app: Application) {
    setSelectedApp(app);
    setMode('view');
  }

  function handleDownloadSummary() {
    if (!selectedApp) return;
    const summary = `AMMAN COMMUNICATIONS - APPLICATION SUMMARY
Application ID: ${selectedApp.applicationNumber || selectedApp.id}
Customer: ${selectedApp.customer}
Service: ${selectedApp.serviceType}
Status: ${selectedApp.status}
Submission Date: ${selectedApp.createdDate}`;
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Application-${selectedApp.id}.txt`;
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      {showAddModal && <AppModal mode="add" onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editApp && <AppModal mode="edit" app={editApp} onClose={() => setEditApp(null)} onSave={handleEdit} />}
      {deleteApp && <DeleteModal app={deleteApp} onClose={() => setDeleteApp(null)} onConfirm={() => handleDelete(deleteApp.id)} />}
    </div>
  );
}
