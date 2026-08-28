'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  X,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  fetchAdminAppointments,
  fetchAdminAppointmentStats,
  updateAdminAppointmentStatus,
  deleteAdminAppointment
} from './actions';

interface AppointmentStats {
  total: number;
  pending: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

interface Appointment {
  id: string;
  appointmentNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: { name: string };
  appointmentDate: string;
  preferredTime: string | null;
  status: string;
  mode: string;
  appointmentType: string;
  consultationMode: string | null;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [statsRes, appointmentsRes] = await Promise.all([
      fetchAdminAppointmentStats(),
      fetchAdminAppointments(search, selectedStatus, selectedTimeframe)
    ]);

    if (statsRes.error) setError(statsRes.error);
    else if (statsRes.stats) setStats(statsRes.stats);

    if (appointmentsRes.error) setError(appointmentsRes.error);
    else if (appointmentsRes.data) setAppointments(appointmentsRes.data);

    setLoading(false);
  }, [search, selectedStatus, selectedTimeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change this appointment's status to ${newStatus}?`)) return;
    
    setLoading(true);
    const res = await updateAdminAppointmentStatus(id, newStatus);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(`Appointment status updated to ${newStatus}.`);
      await loadData();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment?')) return;
    
    setLoading(true);
    const res = await deleteAdminAppointment(id);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage('Appointment deleted successfully.');
      await loadData();
    }
    setLoading(false);
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointments Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer appointments, update statuses, and reschedule bookings.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error & Success States */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium">Error</h3>
            <p className="text-sm mt-1 opacity-90">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-xs font-medium text-yellow-600 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Upcoming</p>
            <p className="text-2xl font-bold text-blue-700">{stats.upcoming}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-700">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 md:w-40 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="flex-1 md:w-40 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-3" />
                    <p>Loading appointments...</p>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-900">No appointments found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {apt.appointmentNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{apt.customerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{apt.customerEmail}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{apt.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {apt.service?.name || 'Unknown Service'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium tracking-tight">
                          {(apt.appointmentType || apt.mode || 'OFFICE_VISIT').replace('_', ' ')}
                        </span>
                        {apt.consultationMode && (
                          <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium tracking-tight">
                            {apt.consultationMode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{apt.preferredTime || 'TBD'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : apt.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : apt.status === 'PENDING'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : apt.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <select
                        onChange={(e) => handleUpdateStatus(apt.id, e.target.value)}
                        value={apt.status}
                        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="NO_SHOW">No Show</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Appointment"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
