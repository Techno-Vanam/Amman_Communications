'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarPlus,
  Phone,
  MessageSquare,
  Building,
  Video,
  Calendar as CalendarIcon,
  X,
  XCircle,
  Eye,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useUser } from '@/context/UserContext';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomTimePicker from '@/components/ui/CustomTimePicker';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomTabDropdown from '@/components/ui/CustomTabDropdown';
import { fetchAppointmentsAction, cancelAppointmentAction, rescheduleAppointmentAction } from '@/app/portal/actions';

interface AppointmentItem {
  id: string;
  originalDateTime: string;
  newDateTime: string;
  serviceType: string;
  consultationType: string;
  status: 'Rescheduled' | 'Cancelled' | 'Completed' | 'Pending' | 'Confirmed';
  reasonAdminNote: string;
  adminNote?: string;
  location?: string;
}

function mapBackendAppointment(apt: any): AppointmentItem {
  const serviceType = apt.service?.name || 'Broadband Setup';
  
  const hasBeenRescheduled = !!apt.rescheduledFrom || apt.status === 'RESCHEDULED';

  const origDateObj = new Date(apt.rescheduledFrom || apt.appointmentDate || apt.preferredDate);
  const formattedOrigDate = isNaN(origDateObj.getTime()) 
    ? '' 
    : origDateObj.toISOString().split('T')[0];
  const timeStr = apt.preferredTime || '10:30 AM';

<<<<<<< HEAD
  let newDateStr = '-';
  if (hasBeenRescheduled) {
    const newDateObj = new Date(apt.appointmentDate || apt.preferredDate);
    const formattedNewDate = isNaN(newDateObj.getTime())
      ? ''
      : newDateObj.toISOString().split('T')[0];
    if (formattedNewDate) {
      newDateStr = `${formattedNewDate} ${timeStr}`;
    }
  }
  
  let consultationType = 'Office Visit';
  if (apt.appointmentType === 'ONLINE_CONSULTATION' || apt.mode === 'ONLINE') {
    const channel = apt.consultationMode || 'PHONE';
    consultationType = `Online Consultation (${channel.charAt(0) + channel.slice(1).toLowerCase()})`;
  } else if (apt.office?.name) {
    consultationType = `Office Visit (${apt.office.name})`;
  }

  let status: 'Pending' | 'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled' = 'Confirmed';
  if (apt.status === 'PENDING') status = 'Pending';
  else if (apt.status === 'CONFIRMED') status = 'Confirmed';
  else if (apt.status === 'RESCHEDULED') status = 'Rescheduled';
  else if (apt.status === 'COMPLETED') status = 'Completed';
  else if (apt.status === 'CANCELLED') status = 'Cancelled';

  return {
    id: apt.id,
    originalDateTime: formattedOrigDate ? `${formattedOrigDate} ${timeStr}` : timeStr,
    newDateTime: newDateStr,
    serviceType,
    consultationType,
    status,
    reasonAdminNote: apt.rescheduleReason || apt.notes || 'No description',
    adminNote: apt.notes || 'Your appointment is active.',
    location: apt.office?.name || 'Online'
  };
}

export default function AppointmentsPage() {
  const pathname = usePathname();
  const { showToast } = useNotifications();
  const { user } = useUser();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals state
  const [rescheduleModalItem, setRescheduleModalItem] = useState<AppointmentItem | null>(null);
  const [cancelModalItem, setCancelModalItem] = useState<AppointmentItem | null>(null);

  // Reset all modals whenever pathname changes or component unmounts
  useEffect(() => {
    setSelectedAppointment(null);
    setRescheduleModalItem(null);
    setCancelModalItem(null);
    return () => {
      setSelectedAppointment(null);
      setRescheduleModalItem(null);
      setCancelModalItem(null);
    };
  }, [pathname]);

function getTodayISOString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

  // Form state for Reschedule Modal
  const [rescheduleDate, setRescheduleDate] = useState(getTodayISOString());
  const [rescheduleTime, setRescheduleTime] = useState('10:30 AM');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Form state for Cancel Modal
  const [cancelReason, setCancelReason] = useState('Schedule conflict / Change of plans');

  const loadAppointments = async () => {
    setLoading(true);
    const raw = await fetchAppointmentsAction();
    const mapped = (raw || []).map(mapBackendAppointment);
    setAppointments(mapped);
    setLoading(false);
=======
  const counts: Partial<Record<TabKey, number>> = {
    ALL: allAppointments.length,
    UPCOMING: allAppointments.filter(
      (a) =>
        (a.status === 'PENDING' || a.status === 'CONFIRMED') &&
        new Date(a.preferredDate || a.appointmentDate || Date.now()) >= new Date()
    ).length,
    RESCHEDULED: allAppointments.filter((a) => a.status === 'RESCHEDULED').length,
    COMPLETED: allAppointments.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: allAppointments.filter((a) => a.status === 'CANCELLED').length,
>>>>>>> origin/backend-merge
  };

  useEffect(() => {
    loadAppointments();
    setSelectedAppointment(null);
  }, [user.email]);

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalItem) return;

    setLoading(true);
    const res = await rescheduleAppointmentAction(rescheduleModalItem.id, {
      preferredDate: rescheduleDate,
      preferredTime: rescheduleTime,
      reason: rescheduleReason,
    });
    setLoading(false);

    if (res.error) {
      showToast('Error', res.error);
      return;
    }

    showToast('Success', 'Appointment rescheduled successfully.');
    setRescheduleModalItem(null);
    loadAppointments();
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalItem) return;

    setLoading(true);
    const res = await cancelAppointmentAction(cancelModalItem.id);
    setLoading(false);

    if (res.error) {
      showToast('Error', res.error);
      return;
    }

    showToast('Appointment Cancelled', `Appointment has been cancelled successfully.`);
    setCancelModalItem(null);
    loadAppointments();
  };

  const filteredAppointments = appointments.filter((item) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Upcoming'
        ? item.status === 'Confirmed' || item.status === 'Pending' || item.status === 'Rescheduled'
        : activeTab === 'Completed'
        ? item.status === 'Completed'
        : activeTab === 'Cancelled'
        ? item.status === 'Cancelled'
        : activeTab === 'Rescheduled'
        ? item.status === 'Rescheduled'
        : true;

    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    return (
      item.id.toLowerCase().includes(query) ||
      item.serviceType.toLowerCase().includes(query) ||
      item.consultationType.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.originalDateTime.toLowerCase().includes(query) ||
      (item.newDateTime && item.newDateTime.toLowerCase().includes(query)) ||
      (item.reasonAdminNote && item.reasonAdminNote.toLowerCase().includes(query)) ||
      (item.location && item.location.toLowerCase().includes(query))
    );
  });

  const getStatusBadgeClass = (status: AppointmentItem['status']) => {
    switch (status) {
      case 'Rescheduled':
        return 'bg-[#fdf2f2] text-[#e02424] border border-red-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Confirmed':
        return 'bg-[#d8ebdd] text-[#12372A] border border-[#a8d5b9]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getConsultationIcon = (type: string) => {
    if (type.includes('Video')) {
      return <Video className="w-3.5 h-3.5 text-purple-600" />;
    }
    if (type.includes('WhatsApp')) {
      return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (type.includes('Phone')) {
      return <Phone className="w-3.5 h-3.5 text-blue-600" />;
    }
    return <Building className="w-3.5 h-3.5 text-gray-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
      {/* Filter Tabs & Search Bar & Book Appointment Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Mobile Custom Tab Dropdown (Animated Custom Menu - No "Filter:" text) */}
        <CustomTabDropdown
          value={activeTab}
          options={['All', 'Upcoming', 'Completed', 'Cancelled', 'Rescheduled']}
          onChange={(val) => setActiveTab(val)}
          className="sm:hidden self-start"
        />

        {/* Desktop Capsule Filter Tabs (Visible on sm screens and up) */}
        <div className="hidden sm:inline-flex bg-gray-100/90 p-1.5 rounded-full items-center gap-1 border border-gray-200/60 shrink-0">
          {(['All', 'Upcoming', 'Completed', 'Cancelled', 'Rescheduled'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#12372A] text-white shadow-xs font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 font-semibold'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Bar Input */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search appointments..."
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

          {/* Book Appointment Action Button on Right */}
          <Link
            href="/portal/book-appointment"
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-full transition-all shadow-md shrink-0 ml-auto sm:ml-0"
          >
            <CalendarPlus className="w-4 h-4 text-[#a8d5b9]" />
            <span>+ Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* Responsive Table (Desktop) / Cards (Mobile) Layout */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-500 font-medium shadow-xs">
            No appointments found in this category.
          </div>
        ) : (
          <>
            {/* Desktop Table View (Visible on md screens and larger) */}
            <div className="hidden md:block bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8faf9] border-b border-gray-200/80 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-6">Service / ID</th>
                      <th scope="col" className="py-3.5 px-4">Date &amp; Time</th>
                      <th scope="col" className="py-3.5 px-4">New Date &amp; Time</th>
                      <th scope="col" className="py-3.5 px-4">Consultation</th>
                      <th scope="col" className="py-3.5 px-4">Status</th>
                      <th scope="col" className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filteredAppointments.map((apt) => {
                      const isSelected = selectedAppointment?.id === apt.id;
                      const canModify = apt.status !== 'Cancelled' && apt.status !== 'Completed';

                      return (
                        <tr
                          key={apt.id}
                          className={`transition-colors hover:bg-gray-50/80 ${
                            isSelected ? 'bg-[#f0f7f2]/60 font-semibold' : ''
                          }`}
                        >
                          {/* Service & ID */}
                          <td className="py-4 px-6 align-middle">
                            <div className="font-bold text-gray-900 leading-snug">{apt.serviceType}</div>
                            <div className="text-[11px] text-gray-400 font-medium mt-0.5">ID: {apt.id}</div>
                          </td>

                          {/* Original Date & Time */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className="font-bold text-gray-800">{apt.originalDateTime}</span>
                          </td>

                          {/* New Date & Time */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className="font-bold text-gray-800">{apt.newDateTime || '-'}</span>
                          </td>

                          {/* Consultation Type */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 font-bold text-gray-800">
                              {getConsultationIcon(apt.consultationType)}
                              <span>{apt.consultationType}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-md ${getStatusBadgeClass(apt.status)}`}>
                              {apt.status}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-6 align-middle text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* View Details Icon Button */}
                              <button
                                onClick={() => setSelectedAppointment(apt)}
                                className={`p-2 rounded-xl border transition-all ${
                                  isSelected
                                    ? 'bg-[#12372A] text-white border-[#12372A]'
                                    : 'bg-[#f0f7f2] text-[#12372A] border-[#d8ebdd] hover:bg-[#d8ebdd]'
                                }`}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {canModify && (
                                <>
                                  {/* Reschedule Icon Button */}
                                  <button
                                    onClick={() => {
                                      setRescheduleModalItem(apt);
                                      setRescheduleReason('');
                                    }}
                                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl transition-all"
                                    title="Reschedule Appointment"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>

                                  {/* Cancel Icon Button */}
                                  <button
                                    onClick={() => {
                                      setCancelModalItem(apt);
                                      setCancelReason('Schedule conflict / Change of plans');
                                    }}
                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition-all"
                                    title="Cancel Appointment"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View (Visible only on mobile screens) */}
            <div className="block md:hidden space-y-4">
              {filteredAppointments.map((apt) => {
                const isSelected = selectedAppointment?.id === apt.id;
                const canModify = apt.status !== 'Cancelled' && apt.status !== 'Completed';

                return (
                  <div
                    key={apt.id}
                    className={`bg-white rounded-3xl border border-gray-200/70 p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between gap-4 ${
                      isSelected ? 'ring-2 ring-[#12372A] bg-[#f0f7f2]/10' : ''
                    }`}
                  >
                    {/* Top: Header Info & Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug">{apt.serviceType}</h3>
                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">ID: {apt.id}</p>
                      </div>
                      {/* Action Icon Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* View Details Icon Button */}
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className={`p-2 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-[#12372A] text-white border-[#12372A]'
                              : 'bg-[#f0f7f2] text-[#12372A] border-[#d8ebdd] hover:bg-[#d8ebdd]'
                          }`}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canModify && (
                          <>
                            {/* Reschedule Icon Button */}
                            <button
                              onClick={() => {
                                setRescheduleModalItem(apt);
                                setRescheduleReason('');
                              }}
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl transition-all"
                              title="Reschedule Appointment"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>

                            {/* Cancel Icon Button */}
                            <button
                              onClick={() => {
                                setCancelModalItem(apt);
                                setCancelReason('Schedule conflict / Change of plans');
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition-all"
                              title="Cancel Appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mid: Specific Properties inside nested container */}
                    <div className="bg-[#f8faf9] rounded-2xl p-4 grid grid-cols-2 gap-x-4 gap-y-3.5 border border-gray-100/80 text-xs">
                      <div>
                        <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Date &amp; Time</span>
                        <span className="font-bold text-gray-800 mt-1 block">{apt.originalDateTime}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">New Date &amp; Time</span>
                        <span className="font-bold text-gray-800 mt-1 block">{apt.newDateTime || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Status</span>
                        <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-md mt-1 ${getStatusBadgeClass(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Consultation Type</span>
                        <div className="flex items-center gap-1.5 font-bold text-gray-800 mt-1">
                          {getConsultationIcon(apt.consultationType)}
                          <span>{apt.consultationType}</span>
                        </div>
                      </div>
                      {apt.reasonAdminNote && (
                        <div className="col-span-2 pt-2.5 border-t border-gray-200/50">
                          <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Remarks / Notes</span>
                          <span className="text-gray-600 text-[11px] font-medium block mt-1 leading-relaxed">{apt.reasonAdminNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MODAL 0: View Appointment Details Centered Popup */}
      {mounted && selectedAppointment && createPortal(
        <div
          onClick={() => setSelectedAppointment(null)}
          className="fixed inset-0 z-[999999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-200/90 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#f0f7f2] text-[#12372A] flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5 text-[#12372A]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Appointment Details
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">{selectedAppointment.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3.5 text-xs text-gray-800 font-medium">
              <div className="p-3.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-semibold">Service Type</span>
                  <span className="font-bold text-[#12372A] text-sm">{selectedAppointment.serviceType}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200/50 pt-2">
                  <span className="text-gray-500 font-semibold">Status</span>
                  <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full ${getStatusBadgeClass(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5 px-1">
                <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[160px_1fr] gap-4 py-2.5 border-b border-gray-100 items-start text-left">
                  <span className="text-gray-500 font-semibold text-left">Original Date &amp; Time</span>
                  <span className="font-bold text-gray-900 text-left break-words">{selectedAppointment.originalDateTime}</span>
                </div>

                <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[160px_1fr] gap-4 py-2.5 border-b border-gray-100 items-start text-left">
                  <span className="text-gray-500 font-semibold text-left">New Date &amp; Time</span>
                  <span className="font-extrabold text-gray-900 text-left break-words">{selectedAppointment.newDateTime || '-'}</span>
                </div>

                <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[160px_1fr] gap-4 py-2.5 border-b border-gray-100 items-start text-left">
                  <span className="text-gray-500 font-semibold text-left">Consultation Type</span>
                  <span className="font-bold text-gray-900 text-left break-words">{selectedAppointment.consultationType}</span>
                </div>

                <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[160px_1fr] gap-4 py-2.5 border-b border-gray-100 items-start text-left">
                  <span className="text-gray-500 font-semibold text-left">Reason</span>
                  <span className="font-semibold text-gray-800 text-left leading-relaxed break-words">{selectedAppointment.reasonAdminNote || '-'}</span>
                </div>

                <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[160px_1fr] gap-4 py-2.5 border-b border-gray-100 items-start text-left">
                  <span className="text-gray-500 font-semibold text-left">Admin Note</span>
                  <span className="font-semibold text-gray-800 text-left leading-relaxed break-words">{selectedAppointment.adminNote || 'None'}</span>
                </div>

                {selectedAppointment.location && (
                  <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[160px_1fr] gap-4 py-2.5 items-start text-left">
                    <span className="text-gray-500 font-semibold text-left">Office Location</span>
                    <span className="font-extrabold text-[#12372A] text-left break-words">{selectedAppointment.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              {selectedAppointment.status !== 'Cancelled' && selectedAppointment.status !== 'Completed' ? (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      setRescheduleModalItem(selectedAppointment);
                      setRescheduleReason('');
                      setSelectedAppointment(null);
                    }}
                    className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => {
                      setCancelModalItem(selectedAppointment);
                      setCancelReason('Schedule conflict / Change of plans');
                      setSelectedAppointment(null);
                    }}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-full transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 1: Reschedule Appointment */}
      {mounted && rescheduleModalItem && createPortal(
        <div
          onClick={() => setRescheduleModalItem(null)}
          className="fixed inset-0 z-[999999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200/90 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Reschedule Appointment</h3>
              </div>
              <button
                onClick={() => setRescheduleModalItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <p className="font-bold text-[#12372A]">{rescheduleModalItem.serviceType}</p>
                <p className="text-[11px] text-gray-600">Current Slot: {rescheduleModalItem.originalDateTime}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">New Date *</label>
                  <CustomDatePicker
                    value={rescheduleDate}
                    onChange={setRescheduleDate}
                    required
                    disablePast
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">New Time Slot *</label>
                  <CustomTimePicker
                    value={rescheduleTime}
                    onChange={setRescheduleTime}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Reason for Rescheduling (Optional)</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Personal emergency, schedule conflict"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalItem(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: Cancel Appointment */}
      {mounted && cancelModalItem && createPortal(
        <div
          onClick={() => setCancelModalItem(null)}
          className="fixed inset-0 z-[999999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200/90 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-gray-900">Cancel Appointment</h3>
              </div>
              <button
                onClick={() => setCancelModalItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <p className="font-bold text-rose-900">Are you sure you want to cancel this booking?</p>
                <p className="text-[11px] text-rose-700">{cancelModalItem.serviceType} ({cancelModalItem.originalDateTime})</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Reason for Cancellation</label>
                <CustomSelect
                  value={cancelReason}
                  onChange={setCancelReason}
                  options={[
                    'Schedule conflict / Change of plans',
                    'No longer required',
                    'Booked another time slot',
                    'Incorrect service selected'
                  ]}
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModalItem(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
