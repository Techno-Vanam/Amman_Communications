'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  fetchAppointments,
  cancelAppointment,
  Appointment,
} from '../../../lib/api/appointments';
import { AppointmentTabs, TabKey } from '../../../components/appointments/AppointmentTabs';
import { AppointmentTable } from '../../../components/appointments/AppointmentTable';
import { AppointmentCard } from '../../../components/appointments/AppointmentCard';
import { ViewDetailsModal } from '../../../components/appointments/ViewDetailsModal';
import { CancelAppointmentDialog } from '../../../components/appointments/CancelAppointmentDialog';
import {
  Plus,
  AlertCircle,
  RefreshCw,
  CalendarX,
} from 'lucide-react';

export default function MyAppointmentsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // Fetch appointments with status filter
  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['appointments', activeTab],
    queryFn: () => fetchAppointments(activeTab),
  });

  // Calculate counts for tabs from all appointments query
  const { data: allAppointments = [] } = useQuery({
    queryKey: ['appointments', 'ALL'],
    queryFn: () => fetchAppointments('ALL'),
  });

  const counts: Partial<Record<TabKey, number>> = {
    ALL: allAppointments.length,
    UPCOMING: allAppointments.filter(
      (a) =>
        (a.status === 'PENDING' || a.status === 'CONFIRMED') &&
        new Date(a.preferredDate) >= new Date()
    ).length,
    RESCHEDULED: allAppointments.filter((a) => a.status === 'RESCHEDULED').length,
    COMPLETED: allAppointments.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: allAppointments.filter((a) => a.status === 'CANCELLED').length,
  };

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsCancelDialogOpen(false);
      setAppointmentToCancel(null);
    },
  });

  const handleOpenViewModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsViewModalOpen(true);
  };

  const handleOpenCancelDialog = (apt: Appointment) => {
    setAppointmentToCancel(apt);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async (id: string) => {
    await cancelMutation.mutateAsync(id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* 3.1 Page Header Card */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-slate-900">My Appointments</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              Customer Portal
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            View, track, and manage your booked office visits and online consultations.
          </p>
        </div>

        <Link
          href="/portal/appointments/book"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* 3.2 Tabs Row */}
      <AppointmentTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      {/* ERROR STATE */}
      {isError && (
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-3 shadow-card">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Unable to load appointments</h3>
            <p className="text-xs text-slate-500 mt-1">
              {(error as Error)?.message || 'A network error occurred while fetching your appointments.'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* LOADING SKELETON STATE */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-200 rounded w-1/5" />
              <div className="h-4 bg-slate-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !isError && appointments.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
            <CalendarX className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'ALL'
                ? "You haven't booked any appointments yet. Get started by booking a service."
                : `There are currently no appointments under the "${activeTab.toLowerCase()}" filter.`}
            </p>
          </div>
          <Link
            href="/portal/appointments/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>
        </div>
      )}

      {/* CONTENT: DESKTOP TABLE & MOBILE CARDS */}
      {!isLoading && !isError && appointments.length > 0 && (
        <>
          {/* Desktop Table (≥ 768px) */}
          <div className="hidden md:block">
            <AppointmentTable
              appointments={appointments}
              onViewDetails={handleOpenViewModal}
              onCancelClick={handleOpenCancelDialog}
            />
          </div>

          {/* Mobile Stacked Cards (< 768px) */}
          <div className="block md:hidden space-y-4">
            {appointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onViewDetails={handleOpenViewModal}
                onCancelClick={handleOpenCancelDialog}
              />
            ))}
          </div>
        </>
      )}

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={isViewModalOpen}
        appointment={selectedAppointment}
        onClose={() => setIsViewModalOpen(false)}
        onCancelClick={handleOpenCancelDialog}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        appointment={appointmentToCancel}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        isCancelling={cancelMutation.isPending}
      />
    </div>
  );
}
