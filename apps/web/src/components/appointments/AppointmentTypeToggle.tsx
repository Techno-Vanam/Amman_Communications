import React from 'react';
import { AppointmentType } from '../../lib/api/appointments';
import { Building2, Video } from 'lucide-react';

interface AppointmentTypeToggleProps {
  value: AppointmentType;
  onChange: (type: AppointmentType) => void;
}

export const AppointmentTypeToggle: React.FC<AppointmentTypeToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Appointment Type <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Office Visit Card */}
        <button
          type="button"
          onClick={() => onChange('OFFICE_VISIT')}
          className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
            value === 'OFFICE_VISIT'
              ? 'border-blue-500 bg-blue-50/80 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 p-2 ${
              value === 'OFFICE_VISIT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Office Visit</p>
            <p className="text-slate-500 text-xs mt-0.5">In-person consultation at physical branch</p>
          </div>
        </button>

        {/* Online Consultation Card */}
        <button
          type="button"
          onClick={() => onChange('ONLINE_CONSULTATION')}
          className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
            value === 'ONLINE_CONSULTATION'
              ? 'border-blue-500 bg-blue-50/80 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 p-2 ${
              value === 'ONLINE_CONSULTATION' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Video className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Online Consultation</p>
            <p className="text-slate-500 text-xs mt-0.5">Remote call via Phone, Video, or WhatsApp</p>
          </div>
        </button>
      </div>
    </div>
  );
};
