import React from 'react';
import { Phone, Mail, MapPin, ArrowUp, Twitter, Linkedin, Facebook, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0d2702] text-slate-400 border-t border-slate-800">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16">
        {/* 12-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Overview - Spans 4 Columns */}
          <div className="md:col-span-12 lg:col-span-4 space-y-4">
            <img src="/Logo With Name Png.png" alt="TechnoVanam Communications" className="w-48 h-auto" />

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Professional documentation, property registration assistance, application processing, and consultation services. Dedicated to providing error-free pre-audit checks and transparent service delivery.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {[
                { label: 'Twitter / X', Icon: Twitter },
                { label: 'LinkedIn', Icon: Linkedin },
                { label: 'Facebook', Icon: Facebook },
                { label: 'WhatsApp', Icon: MessageCircle },
              ].map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#contact"
                  aria-label={label}
                  title={label}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-300 border border-slate-700/60 transition-colors flex items-center justify-center"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
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
                <span>Coimbatore, Tamil Nadu</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 90805 10279</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>contact@technovanam.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TechnoVanam Communications. All rights reserved. Professional Documentation Consultancy Platform.</p>

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
