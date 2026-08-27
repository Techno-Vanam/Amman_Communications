import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { ServiceSelector } from './ServiceSelector';
import { CalendarPicker } from './CalendarPicker';
import { TimePicker } from './TimePicker';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: '10:30 AM',
    message: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.serviceType) newErrors.serviceType = 'Please select a registration or service type.';
    if (!formData.preferredDate.trim()) {
      newErrors.preferredDate = 'Please select or enter a preferred date';
    } else if (!/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.test(formData.preferredDate.trim())) {
      newErrors.preferredDate = 'Please enter a valid date in DD/MM/YYYY format';
    }

    if (!formData.preferredTime.trim()) {
      newErrors.preferredTime = 'Please select or enter a preferred time';
    } else if (!/^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i.test(formData.preferredTime.trim())) {
      newErrors.preferredTime = 'Please enter a valid time (e.g. 10:30 AM)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in outline-none border-none">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-brand-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white border border-white/20 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Book Consultation Appointment
              </h3>
              <p className="text-xs text-brand-100">
                Schedule a dedicated session with our documentation team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-2xl font-extrabold text-slate-900">
                  Appointment Booked!
                </h4>
                <p className="text-slate-600 text-sm">
                  Thank you, <strong className="text-slate-800">{formData.name}</strong>. Your consultation appointment for{' '}
                  <span className="text-brand-700 font-semibold">{formData.serviceType}</span> is confirmed for{' '}
                  <span className="font-medium text-slate-800">{formData.preferredDate}</span> ({formData.preferredTime}).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 text-left max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-900 border-b border-brand-200/80 pb-2">
                  <span>Booking Reference: AC-APT-{Math.floor(1000 + Math.random() * 9000)}</span>
                  <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-[11px]">Confirmed</span>
                </div>
                <div className="text-xs text-brand-800 space-y-1">
                  <p>• Contact Desk: +91 98765 43210</p>
                  <p>• A confirmation summary has been sent to {formData.email}</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Customer Contact Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`w-full px-4 py-3 bg-slate-50 border ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'
                    } rounded-xl text-slate-800 text-sm focus:ring-2 focus:bg-white focus:outline-none transition-all`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex items-center bg-slate-50 border ${
                      errors.phone ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-200 focus-within:ring-brand-500'
                    } rounded-xl focus-within:ring-2 focus-within:bg-white transition-all overflow-hidden`}>
                      <span className="px-3 py-3 bg-slate-100/90 text-slate-700 font-bold text-xs border-r border-slate-200 shrink-0 flex items-center gap-1 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </span>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        className="w-full px-3.5 py-3 bg-transparent text-slate-800 text-sm focus:outline-none"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full px-4 py-3 bg-slate-50 border ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'
                      } rounded-xl text-slate-800 text-sm focus:ring-2 focus:bg-white focus:outline-none transition-all`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Service / Registration Selection */}
              <ServiceSelector
                selectedService={formData.serviceType}
                onSelectService={(service) => {
                  setFormData({ ...formData, serviceType: service });
                  if (errors.serviceType) setErrors({ ...errors, serviceType: '' });
                }}
                error={errors.serviceType}
                required
              />

              {/* Date & Time Selection */}
              <div className="grid sm:grid-cols-2 gap-4 items-start pt-1">
                <CalendarPicker
                  selectedDate={formData.preferredDate}
                  onSelectDate={(dateStr) => {
                    setFormData({ ...formData, preferredDate: dateStr });
                    if (errors.preferredDate) setErrors({ ...errors, preferredDate: '' });
                  }}
                  error={errors.preferredDate}
                />

                <TimePicker
                  selectedTime={formData.preferredTime}
                  onSelectTime={(timeStr) => {
                    setFormData({ ...formData, preferredTime: timeStr });
                    if (errors.preferredTime) setErrors({ ...errors, preferredTime: '' });
                  }}
                  error={errors.preferredTime}
                />
              </div>

              {/* Message (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Additional Message / Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="Any specific document or property details to share beforehand..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>Confidentiality assured</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

