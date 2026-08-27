import React from 'react';
import { Appointment } from '../../lib/api/appointments';
import { StatusBadge } from './StatusBadge';
import { Calendar, Clock, MapPin, Video, Eye, XCircle } from 'lucide-react';
import { RescheduledDetailsPanel } from './RescheduledDetailsPanel';

interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
  onCancelClick: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onViewDetails,
  onCancelClick,
}) => {
  const formatDate = (dStr: string) => {
    return new Date(dStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isCancellable =
    (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') &&
    new Date(appointment.preferredDate) >= new Date();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card space-y-3">
      {/* Header with Reference & Status */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-slate-400">
          {appointment.appointmentNumber}
        </span>
        <StatusBadge status={appointment.status} />
      </div>

      {/* Service Name */}
      <h3 className="font-semibold text-slate-900 text-base leading-tight">
        {appointment.service.name}
      </h3>

      {/* Rescheduled details if applicable */}
      {appointment.status === 'RESCHEDULED' && (
        <RescheduledDetailsPanel appointment={appointment} compact />
      )}

      {/* Date & Time */}
      <div className="flex items-center gap-3 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <div className="flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{formatDate(appointment.preferredDate.toString())}</span>
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{appointment.preferredTime}</span>
        </div>
      </div>

      {/* Consultation Type / Branch */}
      <div className="flex items-center gap-2 text-xs text-slate-600">
        {appointment.appointmentType === 'OFFICE_VISIT' ? (
          <>
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">
              Office Visit — <strong>{appointment.office?.name || 'Branch Office'}</strong>
            </span>
          </>
        ) : (
          <>
            <Video className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Online Consultation — <strong>{appointment.consultationMode}</strong>
            </span>
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2 flex flex-col gap-2">
        <button
          onClick={() => onViewDetails(appointment)}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>

        {isCancellable && (
          <button
            onClick={() => onCancelClick(appointment)}
            className="w-full py-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Appointment</span>
          </button>
        )}
      </div>
    </div>
  );
};
