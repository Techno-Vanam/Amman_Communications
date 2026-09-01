import React from 'react';
import { CheckCircle2, Star, Shield, Calendar, ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenAppointmentModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAppointmentModal }) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen min-h-[100dvh] flex flex-col justify-center items-center pt-24 pb-12 sm:pt-28 sm:pb-16 overflow-hidden bg-white"
    >
      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-brand-50/80 via-accent-skySoft/30 to-brand-100/40 blur-3xl rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-brand-100/50 blur-3xl rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent-skySoft/40 blur-3xl rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20 w-full flex-grow flex items-center justify-center">
        <div className="text-center space-y-5 sm:space-y-7 max-w-4xl mx-auto my-auto w-full">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-brand-50/90 border border-brand-100 text-brand-700 text-[11px] sm:text-sm font-semibold shadow-xs max-w-full">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shrink-0" />
            <span className="truncate">Official Documentation &amp; Registration Consultancy</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brand-700 tracking-tight leading-[1.15] sm:leading-[1.12]">
            Streamlined Property Registration &amp; Document Verification
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Amman Communications delivers professional advisory, pre-audit verification, deed drafting, and online filing to streamline your registration workflows with 100% precision.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenAppointmentModal}
              className="w-full sm:w-auto px-7 py-3.5 h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base shadow-sm hover:shadow-brand-glow transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="#services"
              className="w-full sm:w-auto px-7 py-3.5 h-12 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200/90 shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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
