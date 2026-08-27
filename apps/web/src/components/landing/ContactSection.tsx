import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Shield } from 'lucide-react';
import { ServiceSelector } from './ServiceSelector';

export const ContactSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', serviceNeeded: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Your name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.serviceNeeded) {
      newErrors.serviceNeeded = 'Please select a registration or service type.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-slate-50/50 border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            <span>Direct Desk & Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-600 tracking-tight">
            Get in Touch with Amman Communications
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Have questions about property documentation or a pending application? Reach out to our advisory desk.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            {/* Card 1: Phone Desk */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft flex items-start gap-4 hover:border-brand-300 transition-colors flex-1">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Phone & Helpline</h4>
                <p className="text-sm font-semibold text-brand-700">+91 98765 43210 / +91 44 2345 6789</p>
                <p className="text-xs text-slate-500">Mon - Sat: 9:30 AM – 6:30 PM IST</p>
              </div>
            </div>

            {/* Card 2: Email */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft flex items-start gap-4 hover:border-brand-300 transition-colors flex-1">
              <div className="w-12 h-12 rounded-xl bg-accent-skySoft text-accent-sky flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Email Consultation Desk</h4>
                <p className="text-sm font-semibold text-brand-700">support@ammancommunications.com</p>
                <p className="text-xs text-slate-500">Response within 4 business hours</p>
              </div>
            </div>

            {/* Card 3: Address & Office */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft flex items-start gap-4 hover:border-brand-300 transition-colors flex-1">
              <div className="w-12 h-12 rounded-xl bg-accent-amberSoft text-accent-amber flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Consultation Hub</h4>
                <p className="text-xs sm:text-sm text-slate-700">
                  Amman Communications Hub,<br />
                  Main Commercial Road, Prime Business District,<br />
                  Chennai, Tamil Nadu - 600001
                </p>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-600" />
                <span className="text-xs font-semibold text-brand-900">Weekly Operating Desk</span>
              </div>
              <span className="text-xs font-bold bg-white text-brand-700 border border-brand-200 px-3 py-1 rounded-full">
                Open 6 Days
              </span>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Send an Advisory Message</h3>
              <p className="text-sm text-slate-600 mb-6">
                Fill in your contact details below and our documentation specialists will respond promptly.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 bg-brand-50 border border-brand-100 rounded-2xl text-center space-y-4 animate-fade-in my-auto">
                <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto" />
                <h4 className="text-xl font-bold text-slate-900">Message Delivered!</h4>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Thank you for contacting Amman Communications regarding <strong className="text-brand-700">{form.serviceNeeded}</strong>. A consultant will reach out to you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', phone: '', email: '', serviceNeeded: '' });
                    setErrors({});
                  }}
                  className="mt-2 text-xs font-bold text-brand-700 hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-5" noValidate>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        className={`w-full px-4 py-3 bg-slate-50 border ${
                          errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'
                        } rounded-xl text-sm text-slate-800 focus:ring-2 focus:bg-white focus:outline-none transition-all`}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                    </div>

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
                          value={form.phone}
                          onChange={(e) => {
                            setForm({ ...form, phone: e.target.value });
                            if (errors.phone) setErrors({ ...errors, phone: '' });
                          }}
                          className="w-full px-3.5 py-3 bg-transparent text-slate-800 text-sm focus:outline-none"
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full px-4 py-3 bg-slate-50 border ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'
                      } rounded-xl text-sm text-slate-800 focus:ring-2 focus:bg-white focus:outline-none transition-all`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                  </div>

                  {/* Service / Registration Selection UI */}
                  <ServiceSelector
                    selectedService={form.serviceNeeded}
                    onSelectService={(service) => {
                      setForm({ ...form, serviceNeeded: service });
                      if (errors.serviceNeeded) setErrors({ ...errors, serviceNeeded: '' });
                    }}
                    error={errors.serviceNeeded}
                    required
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-6">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 py-1">
                    <Shield className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Confidentiality assured</span>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

