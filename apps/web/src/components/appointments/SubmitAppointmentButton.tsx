import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

interface SubmitAppointmentButtonProps {
  isDisabled: boolean;
  isSubmitting: boolean;
}

export const SubmitAppointmentButton: React.FC<SubmitAppointmentButtonProps> = ({
  isDisabled,
  isSubmitting,
}) => {
  return (
    <button
      type="submit"
      disabled={isDisabled || isSubmitting}
      className={`w-full rounded-lg py-3 font-semibold flex items-center justify-center gap-2 transition-all ${
        isDisabled || isSubmitting
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
      }`}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing Appointment Request...</span>
        </>
      ) : (
        <>
          <span>Confirm & Book Appointment</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
};
