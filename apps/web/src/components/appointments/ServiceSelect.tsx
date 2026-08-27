import React from 'react';
import { Service } from '../../lib/api/appointments';
import { Briefcase, AlertCircle, ChevronDown } from 'lucide-react';

interface ServiceSelectProps {
  services: Service[];
  selectedServiceId: string;
  onChange: (serviceId: string) => void;
  error?: string;
  isLoading?: boolean;
}

export const ServiceSelect: React.FC<ServiceSelectProps> = ({
  services,
  selectedServiceId,
  onChange,
  error,
  isLoading = false,
}) => {
  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Service Type <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Briefcase className="w-5 h-5" />
        </div>

        <select
          value={selectedServiceId}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          className={`w-full pl-10 pr-10 py-2.5 bg-white border ${
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          } rounded-lg text-sm text-slate-900 font-medium appearance-none outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
        >
          <option value="">Select a service category...</option>
          {services.map((srv) => (
            <option key={srv.id} value={srv.id}>
              {srv.name}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {selectedService && selectedService.description && (
        <div className="mt-2 text-xs text-slate-600 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 space-y-1">
          <p className="font-semibold text-blue-900">Service Overview</p>
          <p>{selectedService.description}</p>
          {selectedService.estimatedProcessingTime && (
            <p className="font-medium text-blue-800 pt-0.5">
              Estimated Turnaround: {selectedService.estimatedProcessingTime}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
