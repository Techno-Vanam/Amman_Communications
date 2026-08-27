import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  FileText,
  ArrowLeftRight,
  FileCheck2,
  ShieldCheck,
  Award,
  Globe,
  UserCheck,
  HelpCircle,
  ChevronDown,
  Check,
  Briefcase
} from 'lucide-react';

export interface ServiceOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'Property Registration',
    label: 'Property Registration',
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: 'Sale Deed Registration',
    label: 'Sale Deed Registration',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: 'Property Transfer',
    label: 'Property Transfer',
    icon: <ArrowLeftRight className="w-4 h-4" />,
  },
  {
    id: 'Document Registration',
    label: 'Document Registration',
    icon: <FileCheck2 className="w-4 h-4" />,
  },
  {
    id: 'Document Verification',
    label: 'Document Verification',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    id: 'Certificate Services',
    label: 'Certificate Services',
    icon: <Award className="w-4 h-4" />,
  },
  {
    id: 'Online Government Services',
    label: 'Online Government Services',
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: 'Documentation Consultation',
    label: 'Documentation Consultation',
    icon: <UserCheck className="w-4 h-4" />,
  },
  {
    id: 'Other',
    label: 'Other',
    icon: <HelpCircle className="w-4 h-4" />,
  },
];

interface ServiceSelectorProps {
  selectedService: string;
  onSelectService: (service: string) => void;
  error?: string;
  required?: boolean;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedService,
  onSelectService,
  error,
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = SERVICE_OPTIONS.find((opt) => opt.id === selectedService);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        What type of registration or service do you need? {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full px-4 py-3 bg-white border ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : isOpen
              ? 'border-brand-500 ring-2 ring-brand-500/10'
              : 'border-slate-200/90 hover:border-brand-300'
          } rounded-xl text-sm flex items-center justify-between transition-all cursor-pointer outline-none shadow-xs`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {currentOption ? (
              <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                {currentOption.icon}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            )}

            <span
              className={`truncate text-sm ${
                currentOption ? 'font-semibold text-slate-900' : 'text-slate-400 font-normal'
              }`}
            >
              {currentOption ? currentOption.label : 'Select a registration or service'}
            </span>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-600' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className="absolute z-40 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 max-h-72 overflow-y-auto animate-fade-in divide-y divide-slate-50"
          >
            {SERVICE_OPTIONS.map((option) => {
              const isSelected = selectedService === option.id;
              return (
                <div
                  key={option.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectService(option.id);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-50/90 font-bold text-brand-900'
                      : 'hover:bg-brand-50/50 text-slate-700 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {option.icon}
                    </div>
                    <span className="truncate">{option.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-brand-600 shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      )}
    </div>
  );
};
