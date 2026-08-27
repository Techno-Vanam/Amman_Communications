import React from 'react';
import { CheckCircle2, Sparkles, Star, Shield, Calendar, ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenAppointmentModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAppointmentModal }) => {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white">
      {/* Subtle Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-tr from-brand-50/70 via-accent-skySoft/30 to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-32 right-10 w-64 h-64 bg-brand-100/40 blur-2xl rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
        <div className="text-center space-y-6 max-w-5xl mx-auto">
          {/* Top Pill Badge without icon */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs sm:text-sm font-semibold shadow-xs">
            <span>Official Documentation & Registration Consultancy</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-700 tracking-tight leading-[1.15]">
            Streamlined Property Registration & Document Verification
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-normal">
            Amman Communications delivers professional advisory, pre-audit verification, deed drafting, and online filing to streamline your registration workflows with 100% precision.
          </p>

          {/* Action Buttons - Book Appointment on LEFT, Explore Services on RIGHT */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenAppointmentModal}
              className="w-full sm:w-auto px-6 py-3.5 h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base shadow-sm hover:shadow-brand-glow transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="#services"
              className="w-full sm:w-auto px-6 py-3.5 h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-base border border-slate-200/90 shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Services</span>
            </a>
          </div>

          {/* Feature Bullets / Multi-color Trust Markers */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-700 text-sm font-medium max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Transparent Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent-sky shrink-0" />
              <span>Verified Pre-Audit</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-accent-amber shrink-0 fill-accent-amber" />
              <span>Express Filing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

