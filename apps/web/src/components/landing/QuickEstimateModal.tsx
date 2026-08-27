import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Calculator, FileText } from 'lucide-react';
import { ServiceItem, EstimateFormData } from '../../types/landing';

interface QuickEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceItem | null;
}

export const QuickEstimateModal: React.FC<QuickEstimateModalProps> = ({
  isOpen,
  onClose,
  initialService
}) => {
  const [formData, setFormData] = useState<EstimateFormData>({
    serviceType: 'Property Registration Assistance',
    urgency: 'Standard (3-5 days)',
    documentCount: '1 - 5 Documents',
    applicantType: 'Individual',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialService) {
      setFormData((prev) => ({ ...prev, serviceType: initialService.title }));
    }
  }, [initialService]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-brand-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white border border-white/20 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Request Service & Consultation
              </h3>
              <p className="text-xs text-brand-100">
                Get an estimated timeline and document checklist
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-2xl font-extrabold text-slate-900">
                  Inquiry Submitted Successfully!
                </h4>
                <p className="text-slate-600 text-sm">
                  Thank you, <strong className="text-slate-800">{formData.name || 'Applicant'}</strong>. Our consultant will review your request for{' '}
                  <span className="text-brand-700 font-semibold">{formData.serviceType}</span> and contact you shortly at{' '}
                  <span className="font-medium text-slate-800">{formData.phone || 'your phone number'}</span>.
                </p>
              </div>

              {/* Reference Box */}
              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 text-left max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-900 border-b border-brand-200/80 pb-2">
                  <span>Reference ID: AC-REG-2026-{Math.floor(1000 + Math.random() * 9000)}</span>
                  <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-[11px]">Priority Desk</span>
                </div>
                <div className="text-xs text-brand-800 space-y-1">
                  <p>• Processing Window: <strong>{formData.urgency}</strong></p>
                  <p>• Assigned Desk: Amman Communications Central Desk</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Required Service
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option>Property Registration Assistance</option>
                  <option>Document Verification Consultancy</option>
                  <option>Online Portal Application Processing</option>
                  <option>Certificates & Attestation Support</option>
                  <option>1-on-1 Document Consultation</option>
                  <option>Business & Commercial Registration</option>
                </select>
              </div>

              {/* Grid 2 Column for options */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Target Processing Window
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all"
                  >
                    <option>Standard (3-5 days)</option>
                    <option>Express (24-48 hrs)</option>
                    <option>Immediate Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Applicant Category
                  </label>
                  <select
                    value={formData.applicantType}
                    onChange={(e) => setFormData({ ...formData, applicantType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all"
                  >
                    <option>Individual</option>
                    <option>Commercial / Business</option>
                    <option>Legal Representative</option>
                  </select>
                </div>
              </div>

              {/* Applicant Contact Details */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  Your Contact Information
                </h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Phone Number *"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe your document or registration requirement (optional)..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>Transparent fee structure</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Submit Inquiry</span>
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

