import React from 'react';
import { STATS_DATA } from '../../data/landingData';
import { CheckSquare, ShieldAlert, Building, Headphones, Info } from 'lucide-react';

export const TrustStats: React.FC = () => {
  const getStatIconInfo = (iconName: string) => {
    switch (iconName) {
      case 'CheckSquare':
        return { icon: <CheckSquare className="w-6 h-6 text-brand-600" />, bg: 'bg-brand-50' };
      case 'ShieldAlert':
        return { icon: <ShieldAlert className="w-6 h-6 text-accent-sky" />, bg: 'bg-accent-skySoft' };
      case 'Building':
        return { icon: <Building className="w-6 h-6 text-accent-amber" />, bg: 'bg-accent-amberSoft' };
      case 'Headphones':
        return { icon: <Headphones className="w-6 h-6 text-accent-violet" />, bg: 'bg-accent-violetSoft' };
      default:
        return { icon: <CheckSquare className="w-6 h-6 text-brand-600" />, bg: 'bg-brand-50' };
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white relative border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            <span>Proven Track Record</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-600 tracking-tight">
            Trusted Documentation & Registration Expertise
          </h2>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {STATS_DATA.map((stat, idx) => {
            const iconInfo = getStatIconInfo(stat.iconName);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all text-center sm:text-left flex flex-col justify-between"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl ${iconInfo.bg} flex items-center justify-center mb-4 mx-auto sm:mx-0`}>
                    {iconInfo.icon}
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-heading text-brand-700 tracking-tight mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                    {stat.label}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                  {stat.helperText}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

