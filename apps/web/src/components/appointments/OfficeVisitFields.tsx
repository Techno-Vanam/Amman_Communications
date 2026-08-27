import React from 'react';
import { Office } from '../../lib/api/appointments';
import { MapPin, AlertCircle, ChevronDown } from 'lucide-react';

interface OfficeVisitFieldsProps {
  offices: Office[];
  officeId: string;
  preferredDate: string;
  preferredTime: string;
  onOfficeChange: (id: string) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  errors: {
    officeId?: string;
    preferredDate?: string;
    preferredTime?: string;
  };
}

const AVAILABLE_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

export const OfficeVisitFields: React.FC<OfficeVisitFieldsProps> = ({
  offices,
  officeId,
  preferredDate,
  preferredTime,
  onOfficeChange,
  onDateChange,
  onTimeChange,
  errors,
}) => {
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <MapPin className="w-4 h-4 text-blue-500" />
        <span>Office Visit Details</span>
      </div>

      {/* Office Dropdown */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Office Location <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={officeId}
            onChange={(e) => onOfficeChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-white border ${
              errors.officeId ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-500'
            } rounded-lg text-sm text-slate-900 font-medium appearance-none outline-none pr-10`}
          >
            <option value="">Select branch location...</option>
            {offices.map((off) => (
              <option key={off.id} value={off.id}>
                {off.name} — {off.address}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {errors.officeId && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.officeId}
          </p>
        )}
      </div>

      {/* Preferred Date & Time Slot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preferred Date Picker */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Preferred Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={minDate}
            value={preferredDate}
            onChange={(e) => onDateChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-white border ${
              errors.preferredDate ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-500'
            } rounded-lg text-sm text-slate-900 font-medium outline-none`}
          />
          {errors.preferredDate && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.preferredDate}
            </p>
          )}
        </div>

        {/* Time Slot Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Preferred Time Slot <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={preferredTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-white border ${
                errors.preferredTime ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-500'
              } rounded-lg text-sm text-slate-900 font-medium appearance-none outline-none pr-10`}
            >
              <option value="">Select time slot...</option>
              {AVAILABLE_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {errors.preferredTime && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.preferredTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
