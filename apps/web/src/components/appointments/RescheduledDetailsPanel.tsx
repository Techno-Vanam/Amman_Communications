import React from 'react';
import { Appointment } from '../../lib/api/appointments';

interface RescheduledDetailsPanelProps {
  appointment: Appointment;
  compact?: boolean;
}

export const RescheduledDetailsPanel: React.FC<RescheduledDetailsPanelProps> = ({
  appointment,
  compact = false,
}) => {
  if (appointment.status !== 'RESCHEDULED' && !appointment.originalDate) {
    return null;
  }

  const formatDate = (dStr?: string) => {
    if (!dStr) return 'N/A';
    return new Date(dStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm space-y-3 ${compact ? 'my-2' : 'my-4'}`}>
      <h4 className="font-bold text-slate-900 text-sm">Rescheduled Appointment Details</h4>

      <div className="space-y-2 text-xs md:text-sm">
        <div className="flex gap-2">
          <span className="text-slate-500 font-medium w-36 shrink-0">Original Date & Time</span>
          <span className="text-slate-900 font-medium">
            : {formatDate(appointment.originalDate?.toString())}, {appointment.originalTime || '—'}
          </span>
        </div>

        <div className="flex gap-2">
          <span className="text-slate-500 font-medium w-36 shrink-0">New Date & Time</span>
          <span className="text-slate-900 font-semibold">
            : {formatDate(appointment.preferredDate.toString())}, {appointment.preferredTime}
          </span>
        </div>

        {appointment.rescheduleReason && (
          <div className="flex gap-2">
            <span className="text-slate-500 font-medium w-36 shrink-0">Reason</span>
            <span className="text-slate-900 font-medium">: {appointment.rescheduleReason}</span>
          </div>
        )}

        {appointment.adminNote && (
          <div className="flex gap-2">
            <span className="text-slate-500 font-medium w-36 shrink-0">Note from Admin</span>
            <span className="text-slate-900 font-medium">: {appointment.adminNote}</span>
          </div>
        )}
      </div>
    </div>
  );
};
