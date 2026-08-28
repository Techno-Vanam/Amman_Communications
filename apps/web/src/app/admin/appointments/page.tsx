'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  X,
  Edit2,
  RefreshCw,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  CalendarClock,
  Video,
  MapPin,
  Filter,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
type AppointmentMode = 'Online' | 'Offline';
type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Rescheduled';

interface Appointment {
  id: string;
  customer: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  mode: AppointmentMode;
  status: AppointmentStatus;
  notes?: string;
}

// ── Mock data ─────────────────────────────────────────────────
const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'APT-1046', customer: 'Mohammad Ali', email: 'mohd.ali@gmail.com', phone: '+91 88790 34511', service: 'Technical Onsite Survey', date: '2026-08-27', time: '14:30', mode: 'Offline', status: 'Confirmed' },
  { id: 'APT-1045', customer: 'Rachel Vance', email: 'rachel.vance@mail.com', phone: '+91 77823 64120', service: 'Broadband Consultation', date: '2026-08-28', time: '10:00', mode: 'Online', status: 'Pending' },
  { id: 'APT-1044', customer: 'TechCorp LLC', email: 'admin@techcorp.com', phone: '+91 80112 77890', service: 'Enterprise VoIP Setup', date: '2026-08-29', time: '15:00', mode: 'Offline', status: 'Confirmed' },
  { id: 'APT-1043', customer: 'Sarah Jenkins', email: 'sarah.jenkins@email.com', phone: '+91 99001 45678', service: 'Network Assessment', date: '2026-08-30', time: '11:00', mode: 'Online', status: 'Pending' },
  { id: 'APT-1042', customer: 'Ahmad Hassan', email: 'ahmad.hassan@email.com', phone: '+91 98456 12300', service: 'Fiber Installation', date: '2026-08-31', time: '09:00', mode: 'Offline', status: 'Confirmed' },
  { id: 'APT-1041', customer: 'City Retail Group', email: 'cityretail@business.com', phone: '+91 94561 23890', service: 'Security Audit', date: '2026-08-20', time: '13:00', mode: 'Offline', status: 'Completed' },
  { id: 'APT-1040', customer: 'Mohammad Ali', email: 'mohd.ali@gmail.com', phone: '+91 88790 34511', service: 'Cloud Setup', date: '2026-08-18', time: '10:30', mode: 'Online', status: 'Cancelled' },
  { id: 'APT-1039', customer: 'Rachel Vance', email: 'rachel.vance@mail.com', phone: '+91 77823 64120', service: 'VoIP Consultation', date: '2026-08-15', time: '16:00', mode: 'Online', status: 'Rescheduled' },
];

const SERVICES = [
  'Technical Onsite Survey',
  'Broadband Consultation',
  'Enterprise VoIP Setup',
  'Network Assessment',
  'Fiber Installation',
  'Security Audit',
  'Cloud Setup',
  'VoIP Consultation',
  'Managed Network Review',
  'Leased Line Inquiry',
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00',
];

// ── Helper: format date ───────────────────────────────────────
function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg: Record<AppointmentStatus, { bg: string; icon: React.ReactNode }> = {
    Confirmed: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
    Pending: { bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3 h-3" /> },
    Completed: { bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CheckCircle className="w-3 h-3" /> },
    Cancelled: { bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: <XCircle className="w-3 h-3" /> },
    Rescheduled: { bg: 'bg-violet-100 text-violet-800 border-violet-200', icon: <RefreshCw className="w-3 h-3" /> },
  };
  const { bg, icon } = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${bg}`}>
      {icon}{status}
    </span>
  );
}

// ── Appointment Modal (Add / Edit / Reschedule) ───────────────
function AppointmentModal({
  mode,
  appointment,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit' | 'reschedule';
  appointment?: Appointment;
  onClose: () => void;
  onSave: (data: Partial<Appointment>) => void;
}) {
  const [form, setForm] = useState<Partial<Appointment>>({
    customer: appointment?.customer ?? '',
    email: appointment?.email ?? '',
    phone: appointment?.phone ?? '',
    service: appointment?.service ?? SERVICES[0],
    date: appointment?.date ?? '',
    time: appointment?.time ?? TIME_SLOTS[0],
    mode: appointment?.mode ?? 'Online',
    notes: appointment?.notes ?? '',
    status: appointment?.status ?? 'Confirmed',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customer?.trim()) e.customer = 'Customer name is required';
    if (!form.email?.trim()) e.email = 'Email is required';
    if (!form.phone?.trim()) e.phone = 'Phone is required';
    if (!form.date) e.date = 'Date is required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (mode === 'reschedule') {
      onSave({ ...form, status: 'Rescheduled' });
    } else {
      onSave(form);
    }
    onClose();
  }

  const titleMap = { add: 'New Appointment', edit: 'Edit Appointment', reschedule: 'Reschedule Appointment' };
  const iconMap = { add: <Plus className="w-5 h-5 text-[#a8d5b9]" />, edit: <Edit2 className="w-5 h-5 text-[#a8d5b9]" />, reschedule: <RefreshCw className="w-5 h-5 text-[#a8d5b9]" /> };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center shrink-0">
              {iconMap[mode]}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">{titleMap[mode]}</h2>
              <p className="text-[11px] text-gray-400">
                {mode === 'reschedule' ? 'Choose a new date and time slot' : 'Fill in the appointment details'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {mode !== 'reschedule' && (
            <>
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.customer}
                    onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
                  />
                </div>
                {errors.customer && <p className="text-[10px] text-rose-600 mt-1">{errors.customer}</p>}
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="email@..."
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+91..."
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Service</label>
                <div className="relative">
                  <select
                    value={form.service}
                    onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none"
                  >
                    {SERVICES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Mode */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Mode</label>
                <div className="flex gap-3">
                  {(['Online', 'Offline'] as AppointmentMode[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, mode: m }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${form.mode === m ? 'bg-[#12372A] border-[#12372A] text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {m === 'Online' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {mode === 'reschedule' ? 'New Date' : 'Date'}
              </label>
              <div className="relative">
                <CalendarClock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
                />
              </div>
              {errors.date && <p className="text-[10px] text-rose-600 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {mode === 'reschedule' ? 'New Time Slot' : 'Time Slot'}
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={form.time}
                  onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none"
                >
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{fmtTime(t)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          {mode !== 'reschedule' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Additional instructions or remarks..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all resize-none"
              />
            </div>
          )}

          {/* Status (edit only) */}
          {mode === 'edit' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as AppointmentStatus }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none"
                >
                  {(['Confirmed', 'Pending', 'Completed', 'Cancelled', 'Rescheduled'] as AppointmentStatus[]).map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Reschedule notice */}
          {mode === 'reschedule' && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-50 border border-violet-100">
              <AlertCircle className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
              <p className="text-xs text-violet-700 font-medium">
                The appointment status will be changed to <strong>Rescheduled</strong> and the customer will be notified of the new time.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className={`flex-1 py-2.5 rounded-full text-white text-xs font-bold transition-colors shadow-md ${mode === 'reschedule' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-[#12372A] hover:bg-[#1a4a38]'}`}>
              {mode === 'add' ? 'Book Appointment' : mode === 'reschedule' ? 'Reschedule' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
type FilterType = 'All' | AppointmentStatus;

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editApt, setEditApt] = useState<Appointment | null>(null);
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch =
        a.customer.toLowerCase().includes(search.toLowerCase()) ||
        a.service.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filterStatus === 'All' || a.status === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [appointments, search, filterStatus]);

  function handleAdd(data: Partial<Appointment>) {
    const newId = `APT-${1047 + appointments.length - INITIAL_APPOINTMENTS.length}`;
    setAppointments(prev => [{
      id: newId,
      customer: data.customer ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      service: data.service ?? '',
      date: data.date ?? '',
      time: data.time ?? '09:00',
      mode: (data.mode as AppointmentMode) ?? 'Online',
      status: 'Confirmed',
      notes: data.notes,
    }, ...prev]);
  }

  function handleEdit(data: Partial<Appointment>) {
    if (!editApt) return;
    setAppointments(prev => prev.map(a => a.id === editApt.id ? { ...a, ...data } : a));
  }

  function handleReschedule(data: Partial<Appointment>) {
    if (!rescheduleApt) return;
    setAppointments(prev => prev.map(a => a.id === rescheduleApt.id ? { ...a, date: data.date ?? a.date, time: data.time ?? a.time, status: 'Rescheduled' } : a));
  }

  const statusList: FilterType[] = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled', 'Rescheduled'];
  const counts = Object.fromEntries(statusList.map(s => [s, s === 'All' ? appointments.length : appointments.filter(a => a.status === s).length]));

  const canReschedule = (status: AppointmentStatus) => ['Pending', 'Confirmed', 'Rescheduled'].includes(status);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>

      {/* ── Page Header ── */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#12372A] hover:bg-[#1a4a38] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#a8d5b9]" />
          New Appointment
        </button>
      </div>

      {/* ── Status Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {statusList.filter(s => s !== 'All').map(s => {
          const cfg: Record<string, string> = {
            Confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
            Pending: 'border-amber-200 bg-amber-50 text-amber-800',
            Completed: 'border-blue-200 bg-blue-50 text-blue-800',
            Cancelled: 'border-rose-200 bg-rose-50 text-rose-800',
            Rescheduled: 'border-violet-200 bg-violet-50 text-violet-800',
          };
          return (
            <div
              key={s}
              className={`rounded-2xl border p-3 text-left ${cfg[s]}`}
            >
              <p className="text-xl font-extrabold">{counts[s]}</p>
              <p className="text-[10px] font-semibold mt-0.5 opacity-80 truncate">{s}</p>
            </div>
          );
        })}
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, service, or appointment ID..."
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-xs"
          >
            <Filter className="w-4 h-4 text-gray-500" />
            Status: {filterStatus}
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 py-1.5 overflow-hidden">
              {statusList.map(s => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setShowFilterMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {s} ({counts[s]})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Appointments List ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[640px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
              <div className="col-span-3">Customer</div>
              <div className="col-span-3">Service</div>
              <div className="col-span-2">Date &amp; Time</div>
              <div className="col-span-1 text-center">Mode</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">No appointments found</p>
                <p className="text-xs text-gray-300 mt-1">Try changing your search or filter</p>
              </div>
            ) : (
              filtered.map((a, idx) => (
                <div
                  key={a.id}
                  className={`grid grid-cols-12 px-5 py-3.5 items-center hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Customer */}
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#12372A] to-[#2e8a60] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                      {a.customer.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{a.customer}</p>
                      <p className="text-[9px] text-gray-400 font-medium">{a.id}</p>
                    </div>
                  </div>

                  {/* Service */}
                  <div className="col-span-3 min-w-0 pr-2">
                    <p className="text-xs text-gray-700 font-semibold truncate">{a.service}</p>
                  </div>

                  {/* Date & Time */}
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-gray-900">{fmtDate(a.date)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{fmtTime(a.time)}</p>
                  </div>

                  {/* Mode */}
                  <div className="col-span-1 flex justify-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${a.mode === 'Online' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                      {a.mode === 'Online' ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                      {a.mode}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    <StatusBadge status={a.status} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    {/* Edit */}
                    <button
                      onClick={() => setEditApt(a)}
                      className="w-7 h-7 rounded-full bg-[#f0f7f2] hover:bg-[#12372A] text-[#12372A] hover:text-white flex items-center justify-center transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {/* Reschedule — only shown if status allows */}
                    {canReschedule(a.status) ? (
                      <button
                        onClick={() => setRescheduleApt(a)}
                        className="w-7 h-7 rounded-full bg-violet-50 hover:bg-violet-600 text-violet-600 hover:text-white flex items-center justify-center transition-all"
                        title="Reschedule"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center cursor-not-allowed"
                        title="Cannot reschedule"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400 font-medium">
            Showing {filtered.length} of {appointments.length} appointments
          </p>
          <p className="text-[11px] text-gray-400">Reschedule only available for Confirmed &amp; Pending</p>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AppointmentModal mode="add" onClose={() => setShowAddModal(false)} onSave={handleAdd} />
      )}
      {editApt && (
        <AppointmentModal mode="edit" appointment={editApt} onClose={() => setEditApt(null)} onSave={handleEdit} />
      )}
      {rescheduleApt && (
        <AppointmentModal mode="reschedule" appointment={rescheduleApt} onClose={() => setRescheduleApt(null)} onSave={handleReschedule} />
      )}
    </div>
  );
}
