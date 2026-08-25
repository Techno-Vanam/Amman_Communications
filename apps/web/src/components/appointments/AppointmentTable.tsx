import React from 'react';
import { Appointment } from '../../lib/api/appointments';
import { StatusBadge } from './StatusBadge';
import { Eye, XCircle } from 'lucide-react';

interface AppointmentTableProps {
  appointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
  onCancelClick: (appointment: Appointment) => void;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  onViewDetails,
  onCancelClick,
}) => {
  const formatDate = (dStr?: string) => {
    if (!dStr) return '—';
    return new Date(dStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-card">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/60 border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <th className="py-3 px-4">Ref & Service</th>
            <th className="py-3 px-4">Date & Time (Original)</th>
            <th className="py-3 px-4">New Date & Time</th>
            <th className="py-3 px-4">Consultation Type</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Reason / Admin Note</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {appointments.map((apt) => {
            const isRescheduled = apt.status === 'RESCHEDULED' || Boolean(apt.originalDate);
            const isCancellable =
              (apt.status === 'PENDING' || apt.status === 'CONFIRMED') &&
              new Date(apt.preferredDate) >= new Date();

            return (
              <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Ref & Service */}
                <td className="py-4 px-4">
                  <div className="font-mono text-xs text-slate-400 font-medium mb-0.5">
                    {apt.appointmentNumber}
                  </div>
                  <div className="font-semibold text-slate-900 line-clamp-1">{apt.service.name}</div>
                </td>

                {/* Date & Time (Original) */}
                <td className="py-4 px-4 text-slate-800">
                  {isRescheduled && apt.originalDate ? (
                    <div>
                      <div className="font-medium text-slate-800">
                        {formatDate(apt.originalDate.toString())}
                      </div>
                      <div className="text-xs text-slate-500">{apt.originalTime || '—'}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-slate-800">
                        {formatDate(apt.preferredDate.toString())}
                      </div>
                      <div className="text-xs text-slate-500">{apt.preferredTime}</div>
                    </div>
                  )}
                </td>

                {/* New Date & Time */}
                <td className="py-4 px-4">
                  {isRescheduled ? (
                    <div>
                      <div className="font-semibold text-slate-900">{formatDate(apt.preferredDate.toString())}</div>
                      <div className="text-xs text-slate-500">{apt.preferredTime}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">N/A</span>
                  )}
                </td>

                {/* Consultation Type */}
                <td className="py-4 px-4 text-slate-700">
                  <div className="font-semibold text-slate-900">
                    {apt.appointmentType === 'OFFICE_VISIT'
                      ? 'Office Visit'
                      : 'Online Consultation'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {apt.appointmentType === 'OFFICE_VISIT'
                      ? apt.office?.name || 'Branch Office'
                      : apt.consultationMode}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-4 px-4">
                  <StatusBadge status={apt.status} />
                </td>

                {/* Reason / Admin Note */}
                <td className="py-4 px-4 text-xs max-w-xs">
                  {apt.rescheduleReason || apt.adminNote ? (
                    <div className="space-y-0.5">
                      {apt.rescheduleReason && (
                        <p className="text-slate-700 font-medium truncate" title={apt.rescheduleReason}>
                          Reason: {apt.rescheduleReason}
                        </p>
                      )}
                      {apt.adminNote && (
                        <p className="text-slate-500 italic truncate" title={apt.adminNote}>
                          Note: {apt.adminNote}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-300 font-medium">—</span>
                  )}
                </td>

                {/* Action Buttons */}
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDetails(apt)}
                      className="inline-flex items-center gap-1 border border-blue-200 text-blue-600 text-xs font-semibold rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    {isCancellable && (
                      <button
                        onClick={() => onCancelClick(apt)}
                        className="inline-flex items-center gap-1 border border-red-200 text-red-600 text-xs font-semibold rounded-full px-3 py-1.5 hover:bg-red-50 transition-colors"
                        title="Cancel Appointment"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
