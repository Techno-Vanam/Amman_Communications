import React from 'react';
import { PROCESS_STEPS } from '../data/landingData';
import { FileText, UploadCloud, FileSignature, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOpenModal?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = () => {
  const getStepIconAndBadge = (iconName: string, stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return {
          icon: <FileText className="w-6 h-6" />,
          bg: 'bg-brand-50',
          text: 'text-brand-600',
          border: 'border-brand-200',
          badgeBg: 'bg-brand-600',
        };
      case 1:
        return {
          icon: <UploadCloud className="w-6 h-6" />,
          bg: 'bg-accent-skySoft',
          text: 'text-accent-sky',
          border: 'border-accent-sky/30',
          badgeBg: 'bg-accent-sky',
        };
      case 2:
        return {
          icon: <FileSignature className="w-6 h-6" />,
          bg: 'bg-accent-amberSoft',
          text: 'text-accent-amber',
          border: 'border-accent-amber/30',
          badgeBg: 'bg-accent-amber',
        };
      case 3:
        return {
          icon: <CheckCircle2 className="w-6 h-6" />,
          bg: 'bg-accent-violetSoft',
          text: 'text-accent-violet',
          border: 'border-accent-violet/30',
          badgeBg: 'bg-accent-violet',
        };
      default:
        return {
          icon: <FileText className="w-6 h-6" />,
          bg: 'bg-brand-50',
          text: 'text-brand-600',
          border: 'border-brand-200',
          badgeBg: 'bg-brand-600',
        };
    }
  };

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-700 tracking-tight">
            How Amman Communications Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            A structured, transparent workflow designed to save you time and eliminate administrative uncertainty.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7 relative">
          {PROCESS_STEPS.map((step, idx) => {
            const style = getStepIconAndBadge(step.iconName, idx);
            return (
              <div
                key={step.stepNumber}
                className="relative bg-white hover:bg-slate-50/80 rounded-2xl p-7 border border-slate-200/80 hover:border-brand-300 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.text} border ${style.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      {style.icon}
                    </div>
                    <span className={`w-8 h-8 rounded-full ${style.badgeBg} text-white font-extrabold text-xs flex items-center justify-center shadow-xs`}>
                      {step.stepNumber}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                    {step.title}
                  </h3>

                  {/* Step Summary */}
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {step.summary}
                  </p>

                  {/* Sub-bullets */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    {step.details.map((detail, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Step Indicator */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-brand-700 font-semibold">
                  <span>Step {idx + 1} of 4</span>
                  <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
