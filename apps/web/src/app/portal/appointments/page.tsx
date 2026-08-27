'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Clock,
  AlertTriangle,
  RotateCcw,
  Search
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useUser, getUserStorageKey } from '@/context/UserContext';

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

const APPOINTMENTS_DATA: AppointmentItem[] = [];

export default function AppointmentsPage() {
  const { showToast } = useNotifications();
  const { user } = useUser();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);

  // Modals state
  const [rescheduleModalItem, setRescheduleModalItem] = useState<AppointmentItem | null>(null);
  const [cancelModalItem, setCancelModalItem] = useState<AppointmentItem | null>(null);

  // Form state for Reschedule Modal
  const [rescheduleDate, setRescheduleDate] = useState('2026-09-01');
  const [rescheduleTime, setRescheduleTime] = useState('10:30 AM');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Form state for Cancel Modal
  const [cancelReason, setCancelReason] = useState('Schedule conflict / Change of plans');

  React.useEffect(() => {
    try {
      const storageKey = getUserStorageKey(user.email, 'amman_user_appointments');
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: AppointmentItem[] = JSON.parse(saved);
        setAppointments(parsed);
        if (parsed.length > 0) {
          setSelectedAppointment(parsed[0]);
        } else {
          setSelectedAppointment(null);
        }
      } else {
        setAppointments([]);
        setSelectedAppointment(null);
      }
    } catch (e) {
      console.error('Error loading appointments:', e);
      setAppointments([]);
      setSelectedAppointment(null);
    }
  }, [user.email]);

  const saveAppointmentsToStorage = (updated: AppointmentItem[]) => {
    try {
      const storageKey = getUserStorageKey(user.email, 'amman_user_appointments');
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving appointments:', e);
    }
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalItem) return;

    const newDateTimeStr = `${rescheduleDate} ${rescheduleTime}`;
    const updated = appointments.map((apt) =>
      apt.id === rescheduleModalItem.id
        ? {
            ...apt,
            status: 'Rescheduled' as const,
            newDateTime: newDateTimeStr,
            reasonAdminNote: rescheduleReason || 'Rescheduled by customer',
            adminNote: `Customer requested rescheduling to ${newDateTimeStr}.`
          }
        : apt
    );

    setAppointments(updated);
    saveAppointmentsToStorage(updated);

    if (selectedAppointment?.id === rescheduleModalItem.id) {
      setSelectedAppointment({
        ...rescheduleModalItem,
        status: 'Rescheduled',
        newDateTime: newDateTimeStr,
        reasonAdminNote: rescheduleReason || 'Rescheduled by customer'
      });
    }

    showToast('Appointment Rescheduled Successfully!', `Updated to ${newDateTimeStr}.`);
    setRescheduleModalItem(null);
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalItem) return;

    const updated = appointments.map((apt) =>
      apt.id === cancelModalItem.id
        ? {
            ...apt,
            status: 'Cancelled' as const,
            reasonAdminNote: cancelReason || 'Cancelled by customer',
            adminNote: 'Appointment cancelled by customer request.'
          }
        : apt
    );

    setAppointments(updated);
    saveAppointmentsToStorage(updated);

    if (selectedAppointment?.id === cancelModalItem.id) {
      setSelectedAppointment({
        ...cancelModalItem,
        status: 'Cancelled',
        reasonAdminNote: cancelReason || 'Cancelled by customer'
      });
    }

    showToast('Appointment Cancelled', `Appointment ${cancelModalItem.id} has been cancelled.`);
    setCancelModalItem(null);
  };

  const filteredAppointments = appointments.filter((item) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Upcoming'
        ? item.status === 'Confirmed' || item.status === 'Pending'
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
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          My Appointments
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          View, reschedule, or cancel your scheduled appointments.
        </p>
      </div>

      {/* Filter Tabs & Search Bar & Book Appointment Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Capsule Filter Tabs (All, Upcoming, Completed, Cancelled, Rescheduled) */}
        <div className="bg-gray-100/90 p-1.5 rounded-full inline-flex items-center gap-1 border border-gray-200/60 overflow-x-auto max-w-full shrink-0">
          {(['All', 'Upcoming', 'Completed', 'Cancelled', 'Rescheduled'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-xs font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 font-semibold'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar Input */}
          <div className="relative flex-1 md:w-64">
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
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-full transition-all shadow-md shrink-0"
          >
            <CalendarPlus className="w-4 h-4 text-[#a8d5b9]" />
            <span>+ Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* Main Table Card (All Required Columns Present Below) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 md:p-8 space-y-6">

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                <th className="py-3.5 px-4">Date &amp; Time<br /><span className="text-[10px] text-gray-400 normal-case">(Original)</span></th>
                <th className="py-3.5 px-4">New Date &amp; Time</th>
                <th className="py-3.5 px-4">Service Type</th>
                <th className="py-3.5 px-4">Consultation<br />Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Reason / Admin Note</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                    No appointments found in this category.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const isSelected = selectedAppointment?.id === apt.id;
                  const canModify = apt.status !== 'Cancelled' && apt.status !== 'Completed';

                  return (
                    <tr
                      key={apt.id}
                      className={`hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-[#f0f7f2]/60' : ''}`}
                    >
                      <td className="py-4 px-4 font-medium text-gray-900 leading-tight">
                        {apt.originalDateTime}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        {apt.newDateTime}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#12372A]">
                        {apt.serviceType}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                          {getConsultationIcon(apt.consultationType)}
                          <span>{apt.consultationType}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full ${getStatusBadgeClass(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-[200px] truncate text-gray-500" title={apt.reasonAdminNote}>
                        {apt.reasonAdminNote}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Details Icon Button */}
                          <button
                            onClick={() => setSelectedAppointment(apt)}
                            className={`p-2 rounded-xl border transition-all shadow-2xs ${
                              isSelected
                                ? 'bg-[#12372A] text-white border-[#12372A]'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl transition-all shadow-2xs"
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
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all shadow-2xs"
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
                })
              )}
            </tbody>
          </table>
        </div>

      {/* MODAL 0: View Appointment Details Centered Popup */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
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

              <div className="space-y-2 px-1">
                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Original Date &amp; Time</span>
                  <span className="font-bold text-gray-900">{selectedAppointment.originalDateTime}</span>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">New Date &amp; Time</span>
                  <span className="font-extrabold text-gray-900">{selectedAppointment.newDateTime || '-'}</span>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Consultation Type</span>
                  <span className="font-semibold text-gray-900">{selectedAppointment.consultationType}</span>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Reason</span>
                  <span className="font-semibold text-gray-800">{selectedAppointment.reasonAdminNote || '-'}</span>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Admin Note</span>
                  <span className="font-semibold text-gray-800">{selectedAppointment.adminNote || 'None'}</span>
                </div>

                {selectedAppointment.location && (
                  <div className="flex items-start justify-between py-1.5">
                    <span className="text-gray-500 font-medium">Office Location</span>
                    <span className="font-bold text-[#12372A]">{selectedAppointment.location}</span>
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
        </div>
      )}
      </div>

      {/* MODAL 1: Reschedule Appointment */}
      {rescheduleModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
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
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">New Time Slot *</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Cancel Appointment */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
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
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Schedule conflict / Change of plans">Schedule conflict / Change of plans</option>
                  <option value="No longer required">No longer required</option>
                  <option value="Booked another time slot">Booked another time slot</option>
                  <option value="Incorrect service selected">Incorrect service selected</option>
                </select>
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
        </div>
      )}
    </div>
  );
}
