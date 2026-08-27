import React from 'react';
import { ConsultationMode } from '../../lib/api/appointments';
import { Video, Phone, MessageSquare, AlertCircle, ChevronDown } from 'lucide-react';

interface OnlineConsultationFieldsProps {
  consultationMode: ConsultationMode;
  preferredDate: string;
  preferredTime: string;
  contactNumber: string;
  onModeChange: (mode: ConsultationMode) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onContactChange: (num: string) => void;
  errors: {
    consultationMode?: string;
    preferredDate?: string;
    preferredTime?: string;
    contactNumber?: string;
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

export const OnlineConsultationFields: React.FC<OnlineConsultationFieldsProps> = ({
  consultationMode,
  preferredDate,
  preferredTime,
  contactNumber,
  onModeChange,
  onDateChange,
  onTimeChange,
  onContactChange,
  errors,
}) => {
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Video className="w-4 h-4 text-blue-500" />
        <span>Online Consultation Details</span>
      </div>

      {/* Mode Selection */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Consultation Channel <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onModeChange('PHONE')}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all ${
              consultationMode === 'PHONE'
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone Call</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('VIDEO')}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all ${
              consultationMode === 'VIDEO'
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Call</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('WHATSAPP')}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all ${
              consultationMode === 'WHATSAPP'
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
        {errors.consultationMode && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.consultationMode}
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

      {/* Contact Number Phone Input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Contact Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            placeholder="+962 79 123 4567"
            value={contactNumber}
            onChange={(e) => onContactChange(e.target.value)}
            className={`w-full pl-10 pr-3.5 py-2.5 bg-white border ${
              errors.contactNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-500'
            } rounded-lg text-sm text-slate-900 font-medium outline-none`}
          />
        </div>
        {errors.contactNumber && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.contactNumber}
          </p>
        )}
      </div>
    </div>
  );
};
