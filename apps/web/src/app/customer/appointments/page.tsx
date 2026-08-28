'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/lib/auth-context';

interface AppointmentItem {
  id: string;
  appointmentNumber: string;
  appointmentType: string;
  status: string;
  preferredDate: string;
  preferredTime: string;
  contactNumber: string;
  service?: {
    name: string;
    description?: string;
  };
  office?: {
    name: string;
    address: string;
  };
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { ready, user } = useAuth();

  useEffect(() => {
    if (!ready || !user || user.role !== 'CUSTOMER') return;

    const fetchAppointments = async () => {
      try {
        const data = await apiClient<AppointmentItem[]>(`/api/v1/customer/appointments?status=${filter}`);
        setAppointments(data);
      } catch (err) {
        console.error('Failed to fetch appointments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filter, ready, user]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Appointments</h2>
          <p className="text-sm text-slate-500">Track and manage your scheduled consultations</p>
        </div>

        <Link
          href="/customer/appointments/book"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-500">
        {['ALL', 'UPCOMING', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 transition-colors ${
              filter === tab ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-base font-bold text-slate-800">No appointments found</h3>
          <p className="mt-1 text-sm text-slate-500">You don&apos;t have any appointments matching this filter.</p>
          <div className="mt-6">
            <Link
              href="/customer/appointments/book"
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              Book Appointment Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{apt.appointmentNumber}</span>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadgeClass(
                      apt.status
                    )}`}
                  >
                    {apt.status}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-blue-700">{apt.service?.name || 'General Consultation'}</h4>
                <p className="text-xs text-slate-500">
                  {apt.appointmentType === 'OFFICE_VISIT' ? '📍 Office Visit' : '💻 Online Consultation'} •{' '}
                  {new Date(apt.preferredDate).toLocaleDateString()} at {apt.preferredTime}
                </p>
              </div>

              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">{apt.contactNumber}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
