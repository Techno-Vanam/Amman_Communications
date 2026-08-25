import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Mail,
  Download,
  History,
} from 'lucide-react';
import { Appointment } from '../../lib/api/appointments';
import { StatusBadge } from './StatusBadge';
import { RescheduledDetailsPanel } from './RescheduledDetailsPanel';

interface ViewDetailsModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onCancelClick?: (appointment: Appointment) => void;
}

export const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onCancelClick,
}) => {
  if (!isOpen || !appointment) return null;

  const formatDate = (dStr: string) => {
    return new Date(dStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCancellable =
    (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') &&
    new Date(appointment.preferredDate) >= new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 font-semibold">
                {appointment.appointmentNumber}
              </span>
              <StatusBadge status={appointment.status} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{appointment.service.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-6 pr-1 grow">
          {/* Rescheduled Details Panel if applicable */}
          {appointment.status === 'RESCHEDULED' && (
            <RescheduledDetailsPanel appointment={appointment} />
          )}

          {/* Key Appointment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Appointment Type
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {appointment.appointmentType === 'OFFICE_VISIT'
                  ? 'Office Visit'
                  : 'Online Consultation'}
              </p>
              {appointment.appointmentType === 'OFFICE_VISIT' && appointment.office && (
                <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {appointment.office.name} — {appointment.office.address}
                  </span>
                </div>
              )}
              {appointment.appointmentType === 'ONLINE_CONSULTATION' && (
                <p className="text-xs text-slate-600 mt-1">
                  Mode: <strong className="font-semibold">{appointment.consultationMode}</strong>
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Date & Time
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{formatDate(appointment.preferredDate.toString())}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Slot: {appointment.preferredTime}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{appointment.name}</span>
              </div>
              {appointment.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{appointment.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{appointment.contactNumber}</span>
              </div>
              {appointment.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{appointment.address}</span>
                </div>
              )}
            </div>
            {appointment.notes && (
              <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-900">Notes: </span>
                <span className="text-slate-700">{appointment.notes}</span>
              </div>
            )}
          </div>

          {/* Supporting Documents */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Supporting Documents ({appointment.documents?.length ?? 0})
            </h3>
            {appointment.documents && appointment.documents.length > 0 ? (
              <div className="space-y-2">
                {appointment.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                        {doc.fileType || 'PDF'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{doc.fileName}</p>
                        <p className="text-[10px] text-slate-400">
                          {(doc.fileSize / 1024).toFixed(1)} KB · Uploaded{' '}
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>View</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded text-center">
                No supporting documents attached to this appointment.
              </p>
            )}
          </div>

          {/* Status Timeline History */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span>Status History</span>
            </h3>
            {appointment.statusHistory && appointment.statusHistory.length > 0 ? (
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
                {appointment.statusHistory.map((hist, idx) => (
                  <div key={hist.id || idx} className="relative">
                    <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{hist.status}</span>
                      <span className="text-slate-400">
                        {new Date(hist.changedAt).toLocaleString()}
                      </span>
                    </div>
                    {hist.remarks && (
                      <p className="text-xs text-slate-600 mt-0.5">{hist.remarks}</p>
                    )}
                    <p className="text-[10px] text-slate-400">Changed by: {hist.changedBy}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No history records available.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          {isCancellable && onCancelClick && (
            <button
              onClick={() => {
                onClose();
                onCancelClick(appointment);
              }}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Cancel Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
