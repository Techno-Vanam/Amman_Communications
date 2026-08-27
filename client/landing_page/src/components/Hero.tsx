import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, FileCheck, Award, Clock, Sparkles, UserPlus, Star, Shield } from 'lucide-react';

interface HeroProps {
  onOpenModal: () => void;
  onNavigateSignUp: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenModal, onNavigateSignUp }) => {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white">
      {/* Subtle Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-50/70 via-accent-skySoft/30 to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-32 right-10 w-64 h-64 bg-brand-100/40 blur-2xl rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column - Headline & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Pill Badge with multi-color accent */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-accent-amber animate-pulse" />
              <span>Official Documentation & Registration Consultancy</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Streamlined Property Registration &{' '}
              <span className="text-gradient-brand">Document Verification</span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Amman Communications delivers professional advisory, pre-audit verification, deed drafting, and online filing to streamline your registration workflows with 100% precision.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenModal}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base shadow-sm hover:shadow-brand-glow transition-all duration-200 flex items-center justify-center gap-2.5 group"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onNavigateSignUp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-base border border-brand-200/80 shadow-xs transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-brand-600" />
                <span>Create Free Account</span>
              </button>

              <a
                href="#services"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-base border border-slate-200/90 shadow-xs transition-all duration-200 text-center flex items-center justify-center gap-1.5"
              >
                <span>Explore Services</span>
              </a>
            </div>

            {/* Feature Bullets / Multi-color Trust Markers */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Transparent Fees</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                <Shield className="w-4 h-4 text-accent-sky shrink-0" />
                <span>Verified Pre-Audit</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-sm font-medium col-span-2 sm:col-span-1">
                <Star className="w-4 h-4 text-accent-amber shrink-0 fill-accent-amber" />
                <span>Express Filing</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Card Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft frame */}
              <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/80 space-y-6">
                {/* Header inside card */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-slate-900 text-base">
                        Verification Desk
                      </h3>
                      <p className="text-xs text-slate-500">Live Application Audit</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                    Active Review
                  </span>
                </div>

                {/* Simulated Steps inside Graphic Card with Multi-color icons */}
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          Deed Pre-Audit
                        </span>
                        <span className="text-[11px] text-brand-700 font-medium">Completed</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Title search & encumbrance checked.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-brand-50/70 border border-brand-100 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-pulse">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                          Stamp Duty Calculation
                        </span>
                        <span className="text-[11px] text-brand-700 font-semibold bg-white px-2 py-0.5 rounded border border-brand-200">
                          In Progress
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">Standardized fee calculation.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3 opacity-80">
                    <div className="w-7 h-7 rounded-full bg-accent-skySoft text-accent-sky flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700 text-xs sm:text-sm">
                          Registrar Slot Booking
                        </span>
                        <span className="text-[11px] text-slate-400">Scheduled</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Token coordination desk.</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Note */}
                <div className="pt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-brand-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    <span>Confidential Data Handling</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-accent-amber" />
                    <span>Fast Turnaround</span>
                  </div>
                </div>
              </div>

              {/* Floating Shield Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white text-slate-900 p-3.5 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-200 hidden sm:flex">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Standardized Verification</div>
                  <div className="text-[11px] text-slate-500">100% Compliant Drafting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
