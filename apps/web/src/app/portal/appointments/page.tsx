'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarPlus,
  Phone,
  MessageSquare,
  Building
} from 'lucide-react';

interface AppointmentItem {
  id: string;
  originalDateTime: string;
  newDateTime: string;
  serviceType: string;
  consultationType: 'Office Visit' | 'Phone Consultation' | 'WhatsApp Consultation';
  status: 'Rescheduled' | 'Cancelled' | 'Completed' | 'Pending' | 'Confirmed';
  reasonAdminNote: string;
  adminNote?: string;
  location?: string;
}

const APPOINTMENTS_DATA: AppointmentItem[] = [
  {
    id: 'APT-2026-081',
    originalDateTime: '25 May 2026 02:00 PM',
    newDateTime: '27 May 2026 11:00 AM',
    serviceType: 'Property Registration',
    consultationType: 'Office Visit',
    status: 'Rescheduled',
    reasonAdminNote: 'Admin unavailable at the requested time.',
    adminNote: 'We apologize for the inconvenience. Our senior verification officer will meet you on 27 May.',
    location: 'Main Branch - Amman Comm HQ'
  },
  {
    id: 'APT-2026-074',
    originalDateTime: '20 May 2026 11:00 AM',
    newDateTime: '-',
    serviceType: 'Passport Renewal',
    consultationType: 'Office Visit',
    status: 'Cancelled',
    reasonAdminNote: 'Cancelled by customer',
    adminNote: 'Appointment cancelled per customer request on 19 May.',
    location: 'West Regional Hub'
  },
  {
    id: 'APT-2026-062',
    originalDateTime: '22 May 2026 03:00 PM',
    newDateTime: '-',
    serviceType: 'Driving License',
    consultationType: 'Phone Consultation',
    status: 'Completed',
    reasonAdminNote: '-',
    adminNote: 'Phone consultation completed successfully. Verification code sent via SMS.',
  },
  {
    id: 'APT-2026-059',
    originalDateTime: '30 May 2026 10:30 AM',
    newDateTime: '-',
    serviceType: 'PAN Card',
    consultationType: 'WhatsApp Consultation',
    status: 'Pending',
    reasonAdminNote: '-',
    adminNote: 'Awaiting officer assignment.',
  },
  {
    id: 'APT-2026-090',
    originalDateTime: '28 Aug 2026 02:00 PM',
    newDateTime: '-',
    serviceType: 'EC / Patta / Chitta',
    consultationType: 'Office Visit',
    status: 'Confirmed',
    reasonAdminNote: 'Appointment confirmed',
    adminNote: 'Please carry original property deeds and ID proof.',
    location: 'Main Branch - Amman Comm HQ'
  }
];

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled'>('All');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(APPOINTMENTS_DATA[0]);

  const filteredAppointments = APPOINTMENTS_DATA.filter((item) => {
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

  const getConsultationIcon = (type: AppointmentItem['consultationType']) => {
    switch (type) {
      case 'Office Visit':
        return <Building className="w-3.5 h-3.5 text-gray-500" />;
      case 'Phone Consultation':
        return <Phone className="w-3.5 h-3.5 text-gray-500" />;
      case 'WhatsApp Consultation':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
    }
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
            View all your appointments
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
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No appointments found in this category.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const isSelected = selectedAppointment?.id === apt.id;

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
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className={`
                            px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all
                            ${isSelected
                              ? 'bg-[#12372A] text-white border-[#12372A]'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Appointment Details Section (Matching Screenshot) */}
        {selectedAppointment && (
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              {selectedAppointment.status === 'Rescheduled'
                ? 'Rescheduled Appointment Details'
                : `${selectedAppointment.status} Appointment Details`}
            </h2>

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
    </div>
  );
}
