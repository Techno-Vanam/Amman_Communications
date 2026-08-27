import React from 'react';
import { BENEFITS_DATA } from '../data/landingData';
import { Lock, Eye, SearchCheck, UserCheck, FileCheck, Clock, Shield } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const getBenefitIconInfo = (iconName: string) => {
    switch (iconName) {
      case 'Lock':
        return { icon: <Lock className="w-6 h-6" />, bg: 'bg-accent-skySoft', text: 'text-accent-sky' };
      case 'Eye':
        return { icon: <Eye className="w-6 h-6" />, bg: 'bg-accent-violetSoft', text: 'text-accent-violet' };
      case 'Activity':
        return { icon: <SearchCheck className="w-6 h-6" />, bg: 'bg-accent-amberSoft', text: 'text-accent-amber' };
      case 'UserCheck':
        return { icon: <UserCheck className="w-6 h-6" />, bg: 'bg-brand-50', text: 'text-brand-600' };
      case 'Sparkles':
        return { icon: <FileCheck className="w-6 h-6" />, bg: 'bg-accent-roseSoft', text: 'text-accent-rose' };
      case 'Clock':
        return { icon: <Clock className="w-6 h-6" />, bg: 'bg-brand-50', text: 'text-brand-700' };
      default:
        return { icon: <Shield className="w-6 h-6" />, bg: 'bg-brand-50', text: 'text-brand-600' };
    }
  };

  return (
    <section id="why-choose-us" className="py-20 md:py-28 bg-slate-50/60 border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            <span>Why Amman Communications</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-700 tracking-tight">
            Built for Transparency, Speed & Peace of Mind
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            We bridge the gap between complex regulatory requirements and smooth, error-free execution.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {BENEFITS_DATA.map((benefit) => {
            const iconInfo = getBenefitIconInfo(benefit.iconName);
            return (
              <div
                key={benefit.id}
                className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Header inside Card */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${iconInfo.bg} ${iconInfo.text} flex items-center justify-center transition-colors`}>
                      {iconInfo.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {benefit.highlightText}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Bottom Line */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-brand-700">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>Standardized Service Commitment</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
