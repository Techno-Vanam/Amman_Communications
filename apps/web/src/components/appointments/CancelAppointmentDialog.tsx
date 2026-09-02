import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Appointment } from '../../lib/api/appointments';

interface CancelAppointmentDialogProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (appointmentId: string) => Promise<void>;
  isCancelling: boolean;
}

export const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  isOpen,
  appointment,
  onClose,
  onConfirm,
  isCancelling,
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          disabled={isCancelling}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cancel Appointment?</h3>
            <p className="text-xs text-gray-500">{appointment.appointmentNumber}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to cancel your appointment for{' '}
          <strong className="text-gray-900">{appointment.service?.name || 'Consultation Service'}</strong> on{' '}
          <span className="font-semibold text-gray-900">
            {new Date(appointment.preferredDate || appointment.appointmentDate || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            at {appointment.preferredTime || '10:00 AM'}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Keep Appointment
          </button>
          <button
            type="button"
            onClick={() => onConfirm(appointment.id)}
            disabled={isCancelling}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Yes, Cancel Appointment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
