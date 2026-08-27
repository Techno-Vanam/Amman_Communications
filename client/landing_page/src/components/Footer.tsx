import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16">
        {/* 12-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Overview - Spans 4 Columns */}
          <div className="md:col-span-12 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white leading-none">
                  AMMAN
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-brand-400 uppercase leading-tight">
                  Communications
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Professional documentation, property registration assistance, application processing, and consultation services. Dedicated to providing error-free pre-audit checks and transparent service delivery.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {['Twitter / X', 'LinkedIn', 'Facebook', 'WhatsApp'].map((platform) => (
                <a
                  key={platform}
                  href="#contact"
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-brand-600 hover:text-white text-xs text-slate-300 border border-slate-700/60 transition-colors"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Navigation - Spans 2 Columns */}
          <div className="md:col-span-4 lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#hero" className="hover:text-brand-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-400 transition-colors">Services</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-brand-400 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#why-choose-us" className="hover:text-brand-400 transition-colors">Why Choose Us</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-400 transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-brand-400 transition-colors">Contact Support</a>
              </li>
            </ul>
          </div>

          {/* Services - Spans 3 Columns */}
          <div className="md:col-span-4 lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">
              Our Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" className="hover:text-brand-400 transition-colors">Property Registration</a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-400 transition-colors">Document Verification</a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-400 transition-colors">Online Portal Applications</a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-400 transition-colors">Certificates & Attestation</a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-400 transition-colors">Deed Drafting Consultancy</a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-400 transition-colors">Business Registration</a>
              </li>
            </ul>
          </div>

          {/* Contact Info - Spans 3 Columns */}
          <div className="md:col-span-4 lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">
              Direct Contact
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Prime Commercial District, Chennai, TN - 600001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@ammancommunications.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Amman Communications. All rights reserved. Professional Documentation Consultancy Platform.</p>

          <div className="flex items-center gap-6">
            <a href="#faq" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#faq" className="hover:text-white transition-colors">Terms of Consultancy</a>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
