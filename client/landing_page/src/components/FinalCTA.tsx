import React from 'react';
import { ArrowRight, ShieldCheck, PhoneCall, Sparkles, Star } from 'lucide-react';

interface FinalCTAProps {
  onOpenModal: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenModal }) => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-teal-700 text-white p-8 sm:p-12 md:p-14 overflow-hidden shadow-xl border border-brand-500/20">
          {/* Subtle Background Glow Circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-2xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-sky/20 blur-2xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-white border border-white/20 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-accent-amber animate-pulse" />
              <span>Fast & Professional Service</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Simplify Your Property & Document Workflows?
            </h2>

            <p className="text-base sm:text-lg text-brand-50/90 leading-relaxed font-normal max-w-2xl mx-auto">
              Join thousands of satisfied applicants who rely on Amman Communications for accurate verification, deed drafting, and registration guidance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <button
                onClick={onOpenModal}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-900 hover:bg-brand-50 font-extrabold text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 group"
              >
                <span>Initiate Your Application</span>
                <ArrowRight className="w-5 h-5 text-brand-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#contact"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-base border border-white/20 shadow-xs transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-accent-amber" />
                <span>Speak with a Consultant</span>
              </a>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-brand-100/90">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-sky" />
                <span>100% Data Protection</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-accent-amber fill-accent-amber" />
                <span>Transparent Fee Structure</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Expert Pre-Audit Checks</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
