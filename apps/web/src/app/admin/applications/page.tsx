'use client';

<<<<<<< HEAD
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
  FileCheck,
  LayoutGrid,
  List,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomTabDropdown from '@/components/ui/CustomTabDropdown';

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
  id: string;
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
  const [form, setForm] = useState({
    customer: app?.customer ?? '',
    email: app?.email ?? '',
    phone: app?.phone ?? '',
    serviceType: app?.serviceType ?? SERVICE_TYPES[0],
    status: app?.status ?? ('Submitted' as AppStatus),
    stepPhase: app?.stepPhase ?? 1,
    paidAmount: app?.paidAmount ?? 2000,
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
            <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">Customer Name *</label>
            <input
              type="text"
              value={form.customer}
              onChange={e => setForm({ ...form, customer: e.target.value })}
              placeholder="e.g. Acme Corporation"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A]"
            />
            {errors.customer && <p className="text-[10px] text-rose-600 font-bold">{errors.customer}</p>}
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
            <CustomSelect
              value={form.serviceType}
              onChange={val => setForm({ ...form, serviceType: val })}
              options={SERVICE_TYPES}
            />
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

  // Load applications from localStorage or initialize with default dataset
  useEffect(() => {
    try {
      const saved = localStorage.getItem('amman_admin_applications');
      if (saved) {
        setApps(JSON.parse(saved));
      } else {
        setApps(DEFAULT_SAMPLE_APPS);
        localStorage.setItem('amman_admin_applications', JSON.stringify(DEFAULT_SAMPLE_APPS));
      }
    } catch (e) {
      console.error('Error loading admin applications:', e);
      setApps(DEFAULT_SAMPLE_APPS);
    }
  }, []);

  const saveApps = (updated: Application[]) => {
    setApps(updated);
    try {
      localStorage.setItem('amman_admin_applications', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving admin applications:', e);
    }
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

  function handleAdd(data: Partial<Application>) {
    const newApp: Application = {
      id: `APP-2026-${String(apps.length + 1).padStart(3, '0')}`,
      customer: data.customer ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      serviceType: data.serviceType ?? '',
      createdDate: new Date().toISOString().split('T')[0],
      status: data.status ?? 'Submitted',
      stepPhase: data.stepPhase ?? 1,
      paidAmount: data.paidAmount ?? 2000,
      paymentStatus: 'Paid',
      paymentMode: 'UPI / NetBanking',
      txnRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      assignedOfficer: 'Officer Rajesh Kumar',
      notes: data.notes,
      phaseDates: {
        1: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      },
      documents: [
        { id: 'doc-1', name: 'Identity Proof (Aadhaar / Voter ID)', required: 'Required', uploaded: 'Yes', status: 'Approved', uploadedFile: 'aadhaar_copy.pdf' },
        { id: 'doc-2', name: 'Service Application Form', required: 'Required', uploaded: 'Yes', status: 'Approved', uploadedFile: 'app_form.pdf' }
      ]
    };
    saveApps([newApp, ...apps]);
  }

  function handleEdit(data: Partial<Application>) {
    if (!editApp) return;
    const updated = apps.map(a => a.id === editApp.id ? { ...a, ...data } : a);
    saveApps(updated);
    if (selectedApp && selectedApp.id === editApp.id) {
      setSelectedApp({ ...selectedApp, ...data });
    }
  }

  function handleUpdatePhase(id: string, newStep: number) {
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const updated = apps.map(a => {
      if (a.id === id) {
        let newStatus = a.status;
        if (newStep >= 7) newStatus = 'Completed';
        if (newStep === 1) newStatus = 'Submitted';
        if (newStep === 3) newStatus = 'Under Verification';
        const newPhaseDates = { ...(a.phaseDates || {}), [newStep]: todayStr };
        return { ...a, stepPhase: newStep, status: newStatus, phaseDates: newPhaseDates };
      }
      return a;
    });
    saveApps(updated);
    if (selectedApp && selectedApp.id === id) {
      const updatedSelected = updated.find(a => a.id === id);
      if (updatedSelected) setSelectedApp(updatedSelected);
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
    const summary = `
=====================================================
AMMAN COMMUNICATIONS - OFFICIAL APPLICATION SUMMARY
=====================================================
Application ID   : ${selectedApp.id}
Customer Name    : ${selectedApp.customer}
Email Address    : ${selectedApp.email}
Phone Number     : ${selectedApp.phone}
Service Type     : ${selectedApp.serviceType}
Created Date     : ${selectedApp.createdDate}
Current Status   : ${selectedApp.status}
Process Phase    : Phase ${selectedApp.stepPhase} of 8 (${TRACKER_PHASES[selectedApp.stepPhase - 1]?.title})
Amount Paid      : ₹${(selectedApp.paidAmount || 2000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Transaction Ref  : ${selectedApp.txnRef || 'TXN-884920'}
Assigned Officer : ${selectedApp.assignedOfficer || 'Officer Rajesh Kumar'}
Remarks          : ${selectedApp.notes || 'None'}
=====================================================
`;
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Application_Summary_${selectedApp.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>

      {/* ======================================================== */}
      {/* 1. LIST MODE: MATCHING CUSTOMER PORTAL APPLICATION VIEW */}
      {/* ======================================================== */}
      {mode === 'list' && (
        <>
          {/* Top Title & Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Applications &amp; Process Manager</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage customer service requests and track 8-phase progress in real-time.</p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => exportCSV(filteredApps)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#12372A] hover:bg-[#1a4a38] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#a8d5b9]" />
                <span>New Application</span>
              </button>
            </div>
          </div>

          {/* Top 3 Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0f7f2] text-[#12372A] border border-[#a8d5b9] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#12372A]" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 tracking-wide">Total Applications</span>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-3">
                  {apps.length}
                </p>
              </div>
              <div className="mt-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f0f7f2] text-[#12372A] border border-[#a8d5b9]/60">
                  Active System Database
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 tracking-wide">In Processing</span>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-3">
                  {apps.filter((a) => a.stepPhase >= 2 && a.stepPhase <= 6).length}
                </p>
              </div>
              <div className="mt-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                  • Review &amp; Verification Active
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-800" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 tracking-wide">Completed Requests</span>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-3">
                  {apps.filter((a) => a.stepPhase >= 7 || a.status === 'Completed').length}
                </p>
              </div>
              <div className="mt-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/60">
                  • Successfully Dispatched
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Container Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-6">
            {/* Control Toolbar: Filter Tabs + Search + View Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Mobile Custom Tab Dropdown */}
              <CustomTabDropdown
                value={activeTabFilter}
                options={['All', 'Verification', 'Processing', 'Completed']}
                onChange={(val) => setActiveTabFilter(val)}
                className="sm:hidden self-start"
              />

              {/* Desktop Capsule Filter Tabs */}
              <div className="hidden sm:inline-flex bg-gray-100/90 p-1.5 rounded-full items-center gap-1 border border-gray-200/60 shrink-0">
                {(['All', 'Verification', 'Processing', 'Completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTabFilter(tab)}
                    className={`px-4 py-1.5 rounded-full transition-all text-xs whitespace-nowrap ${
                      activeTabFilter === tab
                        ? 'bg-[#12372A] text-white font-extrabold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 font-semibold'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Bar + Grid/Table Toggle */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-initial sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer, ID, service..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200/90 rounded-full text-xs font-medium text-gray-900 focus:outline-none focus:border-[#12372A] focus:ring-2 focus:ring-[#12372A]/10 shadow-2xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* View Style Switcher (Grid vs Table) */}
                <div className="inline-flex bg-gray-100 p-1 rounded-full border border-gray-200/60 shrink-0">
                  <button
                    onClick={() => setViewStyle('grid')}
                    className={`p-1.5 rounded-full transition-all ${
                      viewStyle === 'grid' ? 'bg-white text-[#12372A] shadow-2xs' : 'text-gray-400 hover:text-gray-700'
                    }`}
                    title="Grid Cards View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewStyle('table')}
                    className={`p-1.5 rounded-full transition-all ${
                      viewStyle === 'table' ? 'bg-white text-[#12372A] shadow-2xs' : 'text-gray-400 hover:text-gray-700'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── CARD GRID VIEW (Matching Customer Presentation) ── */}
            {viewStyle === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredApps.length === 0 ? (
                  <div className="col-span-full bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-4 shadow-2xs">
                    <div className="w-16 h-16 rounded-full bg-[#f0f7ff] text-[#12372A] flex items-center justify-center mx-auto border border-blue-100">
                      <FileText className="w-8 h-8 text-[#12372A]" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h3 className="text-lg font-bold text-gray-900">No Applications Found</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        No service applications match your current search query or filter selection.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredApps.map((app) => {
                    const isCompleted = app.status === 'Completed';
                    const progressPercent = Math.min(100, Math.round((app.stepPhase / 8) * 100));

                    return (
                      <div
                        key={app.id}
                        className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#f0f7f2] text-[#12372A] flex items-center justify-center shrink-0 border border-[#a8d5b9]/40 font-bold">
                              <FileText className="w-5 h-5 text-[#12372A]" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#12372A] transition-colors leading-snug">
                                {app.serviceType}
                              </h3>
                              <p className="text-[11px] text-gray-500 font-medium">
                                {app.customer} • <strong className="text-gray-700">{app.id}</strong>
                              </p>
                            </div>
                          </div>

                          <StatusBadge status={app.status} />
                        </div>

                        {/* Progress Stepper Bar */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                            <span>Phase {app.stepPhase} of 8: {TRACKER_PHASES[app.stepPhase - 1]?.title}</span>
                            <span className="text-[#12372A] font-extrabold">{progressPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#12372A] via-[#2e8a60] to-[#3b9f71] h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer Info & View Detail Action */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                          <div>
                            <p className="font-semibold text-gray-700">Submitted On</p>
                            <p className="text-gray-500 font-medium">{fmtDate(app.createdDate)}</p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-gray-700">Assigned Officer</p>
                            <p className="text-gray-500 font-medium truncate max-w-[120px]">{app.assignedOfficer || 'Officer Rajesh'}</p>
                          </div>

                          <button
                            onClick={() => handleOpenView(app)}
                            className="w-9 h-9 rounded-full bg-gray-50 hover:bg-[#12372A] hover:text-white border border-gray-200/80 flex items-center justify-center text-gray-700 transition-all shrink-0 ml-2 shadow-2xs"
                            title="View Live Tracker & Application Details"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* ── TABLE VIEW ── */
              <div className="overflow-x-auto w-full">
                <div className="min-w-[950px]">
                  <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                    <div className="col-span-2">App. ID</div>
                    <div className="col-span-3">Customer</div>
                    <div className="col-span-2">Service Type</div>
                    <div className="col-span-2 text-center">Process Phase</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-center">Actions</div>
                  </div>

                  {filteredApps.map((a, idx) => {
                    const currentStep = a.stepPhase || 1;
                    const currentPhaseTitle = TRACKER_PHASES[currentStep - 1]?.title || 'Submitted';

                    return (
                      <div key={a.id} className={`grid grid-cols-12 px-5 py-3.5 items-center hover:bg-gray-50/80 transition-colors ${idx !== filteredApps.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="col-span-2">
                          <span className="text-xs font-bold text-[#12372A]">{a.id}</span>
                        </div>

                        <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#12372A] to-[#2e8a60] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                            {a.customer.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{a.customer}</p>
                            <p className="text-[10px] text-gray-400 truncate">{a.email}</p>
                          </div>
                        </div>

                        <div className="col-span-2 min-w-0 pr-2">
                          <p className="text-xs text-gray-700 font-semibold truncate">{a.serviceType}</p>
                        </div>

                        <div className="col-span-2 text-center flex flex-col items-center justify-center space-y-1">
                          <button
                            onClick={() => handleOpenView(a)}
                            className="px-2.5 py-1 rounded-full bg-[#f0f7f2] hover:bg-[#dce9f7] border border-[#a8d5b9] text-[10px] font-extrabold text-[#12372A] flex items-center gap-1 shadow-2xs transition-all whitespace-nowrap"
                          >
                            <span className="w-4 h-4 rounded-full bg-[#12372A] text-white text-[9px] flex items-center justify-center font-bold shrink-0">
                              {currentStep}
                            </span>
                            <span className="truncate max-w-[100px]">{currentPhaseTitle}</span>
                          </button>
                        </div>

                        <div className="col-span-2 flex justify-center items-center">
                          <StatusBadge status={a.status} />
                        </div>

                        <div className="col-span-1 flex items-center justify-center gap-1">
                          <button onClick={() => handleOpenView(a)} className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all shrink-0" title="View Tracker & Details">
                            <Eye className="w-3 h-3" />
                          </button>
                          <button onClick={() => setEditApp(a)} className="w-7 h-7 rounded-full bg-[#f0f7f2] hover:bg-[#12372A] text-[#12372A] hover:text-white flex items-center justify-center transition-all shrink-0" title="Edit">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDeleteApp(a)} className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-all shrink-0" title="Delete">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 2. DETAIL VIEW MODE (Identical Presentation to Customer View) */}
      {/* ======================================================== */}
      {mode === 'view' && selectedApp && (
        <div className="space-y-6">
          {/* Breadcrumb Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500">
              <button
                onClick={() => setMode('list')}
                className="hover:text-[#12372A] transition-colors flex items-center gap-1 text-gray-700 font-bold"
              >
                <span>Applications Manager</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 font-bold">{selectedApp.id}</span>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={handleDownloadSummary}
                className="px-4 py-2 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all shadow-2xs flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span>Download Application Summary</span>
              </button>
              <button
                onClick={() => setMode('list')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
              >
                Back to List
              </button>
            </div>
          </div>

          {/* Top 3 Info Cards Grid: Info, Amount Paid, Current Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Card 1: Application Info */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Application Info
              </h2>

              <div className="grid grid-cols-1 gap-2.5 text-xs">
                <div className="flex items-center">
                  <span className="w-32 text-gray-500 font-medium">Application ID</span>
                  <span className="font-bold text-gray-900">: {selectedApp.id}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-gray-500 font-medium">Customer Name</span>
                  <span className="font-bold text-gray-900">: {selectedApp.customer}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-gray-500 font-medium">Email / Phone</span>
                  <span className="font-bold text-gray-900">: {selectedApp.email} • {selectedApp.phone}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-gray-500 font-medium">Service Type</span>
                  <span className="font-bold text-gray-900">: {selectedApp.serviceType}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-gray-500 font-medium">Submitted On</span>
                  <span className="font-bold text-gray-900">: {fmtDate(selectedApp.createdDate)}</span>
                </div>
                <div className="flex items-center border-t border-gray-100 pt-2">
                  <span className="w-32 text-gray-500 font-medium">Assigned Officer</span>
                  <span className="font-extrabold text-[#12372A]">: {selectedApp.assignedOfficer || 'Officer Rajesh Kumar'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Dedicated Amount Paid Box */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Amount Paid
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {selectedApp.paymentStatus || 'Paid'}
                </span>
              </div>

              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-[#12372A] tracking-tight">
                  ₹{(selectedApp.paidAmount || 2500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                  Total Official Fee: ₹{(selectedApp.paidAmount || 2500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 text-xs space-y-1 text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Payment Mode:</span>
                  <span className="font-bold text-gray-800">{selectedApp.paymentMode || 'UPI / NetBanking'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Transaction Ref:</span>
                  <span className="font-bold text-gray-800">{selectedApp.txnRef || 'TXN-998412'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Current Status & Admin Control */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 text-center flex flex-col justify-between space-y-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                Current Status
              </h2>

              <div className="py-2">
                <StatusBadge status={selectedApp.status} />
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-100 text-left">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Change Status</label>
                <CustomSelect
                  value={selectedApp.status}
                  onChange={(val) => {
                    const updated = { ...selectedApp, status: val as AppStatus };
                    setSelectedApp(updated);
                    saveApps(apps.map(a => a.id === selectedApp.id ? updated : a));
                  }}
                  options={ALL_STATUSES}
                />
              </div>
            </div>
          </div>

          {/* Middle Card: 8-Step Application Status Tracker (Identical Stepper) */}
          <AdminStatusTracker
            stepPhase={selectedApp.stepPhase || 1}
            onPhaseChange={(newStep) => handleUpdatePhase(selectedApp.id, newStep)}
            submittedDate={fmtDate(selectedApp.createdDate)}
            phaseDates={selectedApp.phaseDates}
          />

          {/* Uploaded & Required Documents Table (Admin View / Verification) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Required Documents &amp; Verification</h2>
                <p className="text-xs text-gray-500">Review uploaded documents and manage approval statuses.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                {(selectedApp.documents || []).filter(d => d.status === 'Approved').length} of {(selectedApp.documents || []).length} Approved
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Document Name</th>
                    <th className="pb-3">Requirement</th>
                    <th className="pb-3">Uploaded</th>
                    <th className="pb-3">Verification Status</th>
                    <th className="pb-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(selectedApp.documents || []).map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 font-bold text-gray-900">{doc.name}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.required === 'Required' ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {doc.required}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-gray-700">{doc.uploaded}</td>
                      <td className="py-3.5">
                        <button
                          onClick={() => handleToggleDocumentStatus(doc.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            doc.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : doc.status === 'Under Review'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="Click to toggle document verification status"
                        >
                          • {doc.status}
                        </button>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => alert(`Viewing ${doc.name} (${doc.uploadedFile || 'document.pdf'})`)}
                            className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-[11px] rounded-xl transition-all shadow-2xs inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleToggleDocumentStatus(doc.id)}
                            className="px-3 py-1.5 bg-[#f0f7f2] border border-[#a8d5b9] hover:bg-[#d8ebdd] text-[#12372A] font-bold text-[11px] rounded-xl transition-all shadow-2xs inline-flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{doc.status === 'Approved' ? 'Re-review' : 'Approve'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
=======
import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { fetchAdminApplications, updateAdminApplicationStatus } from './actions';

interface ApplicationDoc {
  id: string;
  documentType: string;
  fileName: string;
  status: string;
  version: number;
  uploadedAt: string;
  fileSize?: number;
}

interface ApplicationItem {
  id: string;
  applicationNumber: string;
  serviceType: string;
  title?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service?: {
    id: string;
    name: string;
    totalFee: number;
  };
  documents: ApplicationDoc[];
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminApplications(search, selectedStatus);
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setApplications(res.data);
      if (selectedApp) {
        const updated = res.data.find((a: ApplicationItem) => a.id === selectedApp.id);
        if (updated) setSelectedApp(updated);
      }
    }
    setLoading(false);
  }, [search, selectedStatus, selectedApp]);

  useEffect(() => {
    loadData();
  }, [search, selectedStatus]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setLoading(true);
    const res = await updateAdminApplicationStatus(appId, newStatus);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(`Application status updated to ${newStatus}`);
      await loadData();
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">APPROVED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">UNDER REVIEW</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">SUBMITTED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">DRAFT</span>;
    }
  };

  const statusTabs = [
    { id: 'ALL', label: 'All Applications' },
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'UNDER_REVIEW', label: 'Under Review' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'DRAFT', label: 'Draft' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applications Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review customer applications, verify submitted documents, and update processing statuses.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by app #, customer name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedStatus === tab.id
                    ? 'bg-emerald-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">App Number</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Service</th>
                <th className="px-6 py-3.5">Documents</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading && applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-900">No applications found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      {app.applicationNumber || `AMC-${app.id.slice(0, 8)}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{app.fullName || app.customer?.name || 'Applicant'}</div>
                      <div className="text-xs text-gray-500">{app.email || app.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{app.service?.name || app.serviceType || 'General Service'}</div>
                      {app.service?.totalFee ? (
                        <div className="text-xs text-emerald-600 font-semibold">JD {app.service.totalFee}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {app.documents.length} attached
                        </span>
                        {app.documents.some((d) => d.status === 'VERIFIED') && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            {app.documents.filter((d) => d.status === 'VERIFIED').length} verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Application Details — {selectedApp.applicationNumber || `AMC-${selectedApp.id.slice(0, 8)}`}
                </h3>
                <p className="text-xs text-gray-500">Created on {new Date(selectedApp.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-2xl">
              <div>
                <span className="text-xs font-medium text-gray-500">Applicant Name</span>
                <p className="font-semibold text-gray-900">{selectedApp.fullName || selectedApp.customer?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Applicant Email</span>
                <p className="font-semibold text-gray-900">{selectedApp.email || selectedApp.customer?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Applicant Phone</span>
                <p className="font-semibold text-gray-900">{selectedApp.phone || selectedApp.customer?.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Current Status</span>
                <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Attached Documents ({selectedApp.documents.length})</h4>
              {selectedApp.documents.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No documents uploaded yet for this application.</p>
              ) : (
                <div className="space-y-2">
                  {selectedApp.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-700" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{doc.documentType}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{doc.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {doc.status}
                        </span>
                        <a
                          href={`/api/v1/admin/applications/${selectedApp.id}/documents/${doc.id}/stream`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-xs text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Close
              </button>
>>>>>>> origin/backend-merge
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD

      {/* ── Modals ── */}
      {showAddModal && <AppModal mode="add" onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editApp && <AppModal mode="edit" app={editApp} onClose={() => setEditApp(null)} onSave={handleEdit} />}
      {deleteApp && <DeleteModal app={deleteApp} onClose={() => setDeleteApp(null)} onConfirm={() => handleDelete(deleteApp.id)} />}
=======
>>>>>>> origin/backend-merge
    </div>
  );
}
