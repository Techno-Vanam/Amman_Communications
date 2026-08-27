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
  RotateCcw
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

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
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled'>('All');
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
      const saved = localStorage.getItem('amman_user_appointments');
      if (saved) {
        const parsed: AppointmentItem[] = JSON.parse(saved);
        setAppointments(parsed);
        if (parsed.length > 0) {
          setSelectedAppointment(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Error loading appointments:', e);
    }
  }, []);

  const saveAppointmentsToStorage = (updated: AppointmentItem[]) => {
    try {
      localStorage.setItem('amman_user_appointments', JSON.stringify(updated));
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
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return item.status === 'Confirmed' || item.status === 'Pending';
    if (activeTab === 'Completed') return item.status === 'Completed';
    if (activeTab === 'Cancelled') return item.status === 'Cancelled';
    if (activeTab === 'Rescheduled') return item.status === 'Rescheduled';
    return true;
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
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-12">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            My Appointments
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            View, reschedule, or cancel your scheduled appointments.
          </p>
        </div>

        <Link
          href="/portal/book-appointment"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4 text-[#a8d5b9]" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-6">
        {/* Filter Tabs Bar */}
        <div className="border-b border-gray-200 flex items-center space-x-6 overflow-x-auto text-sm font-semibold">
          {(['All', 'Upcoming', 'Completed', 'Cancelled', 'Rescheduled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#12372A] text-[#12372A] font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

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

        {/* Selected Appointment Details Section with Reschedule / Cancel Actions */}
        {selectedAppointment && (
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900">
                {selectedAppointment.status === 'Rescheduled'
                  ? 'Rescheduled Appointment Details'
                  : `${selectedAppointment.status} Appointment Details`}
              </h2>

              {selectedAppointment.status !== 'Cancelled' && selectedAppointment.status !== 'Completed' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRescheduleModalItem(selectedAppointment);
                      setRescheduleReason('');
                    }}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => {
                      setCancelModalItem(selectedAppointment);
                      setCancelReason('Schedule conflict / Change of plans');
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Appointment</span>
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[#f8faf9] border border-gray-200/80 rounded-xl p-5 space-y-2.5 text-xs text-gray-800 font-medium max-w-2xl">
              <div className="flex items-start gap-2">
                <span className="w-36 text-gray-500 font-normal shrink-0">Original Date &amp; Time</span>
                <span className="text-gray-900">: {selectedAppointment.originalDateTime}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-36 text-gray-500 font-normal shrink-0">New Date &amp; Time</span>
                <span className="text-gray-900 font-bold">: {selectedAppointment.newDateTime}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-36 text-gray-500 font-normal shrink-0">Consultation Type</span>
                <span className="text-gray-900">: {selectedAppointment.consultationType}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-36 text-gray-500 font-normal shrink-0">Reason</span>
                <span className="text-gray-900">: {selectedAppointment.reasonAdminNote}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-36 text-gray-500 font-normal shrink-0">Note from Admin</span>
                <span className="text-gray-900 font-semibold">: {selectedAppointment.adminNote || 'None'}</span>
              </div>

              {selectedAppointment.location && (
                <div className="flex items-start gap-2 pt-1 border-t border-gray-200/60">
                  <span className="w-36 text-gray-500 font-normal shrink-0">Office Location</span>
                  <span className="text-[#12372A] font-bold">: {selectedAppointment.location}</span>
                </div>
              )}
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
