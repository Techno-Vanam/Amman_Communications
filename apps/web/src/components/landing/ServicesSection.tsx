import React, { useState } from 'react';
import { SERVICES_DATA } from '../../data/landingData';
import { ServiceItem } from '../../types/landing';
import {
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  Award,
  UserCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Registration', 'Verification', 'Applications', 'Certificates', 'Consultation'];

  const filteredServices = selectedCategory === 'All'
    ? SERVICES_DATA
    : SERVICES_DATA.filter((s) => s.category === selectedCategory);

  const getServiceIconInfo = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return { icon: <Building2 className="w-6 h-6" />, bg: 'bg-accent-roseSoft', text: 'text-accent-rose' };
      case 'ShieldCheck':
        return { icon: <ShieldCheck className="w-6 h-6" />, bg: 'bg-brand-50', text: 'text-brand-600' };
      case 'FileSpreadsheet':
        return { icon: <FileSpreadsheet className="w-6 h-6" />, bg: 'bg-accent-skySoft', text: 'text-accent-sky' };
      case 'Award':
        return { icon: <Award className="w-6 h-6" />, bg: 'bg-accent-amberSoft', text: 'text-accent-amber' };
      case 'UserCheck':
        return { icon: <UserCheck className="w-6 h-6" />, bg: 'bg-accent-violetSoft', text: 'text-accent-violet' };
      case 'Briefcase':
        return { icon: <Briefcase className="w-6 h-6" />, bg: 'bg-brand-50', text: 'text-brand-700' };
      default:
        return { icon: <Building2 className="w-6 h-6" />, bg: 'bg-brand-50', text: 'text-brand-600' };
    }
  };

  return (
    <section id="services" className="py-20 md:py-28 bg-slate-50/50 border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            <span>Specialized Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-700 tracking-tight">
            Professional Documentation & Consultancy Services
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            From pre-registration document audits to formal application filing, we deliver clarity and reliability.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {SERVICES_DATA.map((service) => {
            const iconInfo = getServiceIconInfo(service.iconName);
            return (
              <div
                key={service.id}
                className="group relative bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-brand-300 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Header inside Card */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-xl ${iconInfo.bg} ${iconInfo.text} flex items-center justify-center transition-all duration-300 shadow-xs`}>
                      {iconInfo.icon}
                    </div>
                    {service.badge && (
                      <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100 text-xs font-bold tracking-wide">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Category */}
                  <span className="text-xs font-bold text-brand-600 tracking-wider uppercase mb-1 block">
                    {service.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                    {service.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                    {service.shortDesc}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                    {service.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer Action */}
                <div className="border-t border-slate-100 pt-4 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>{service.processingTime}</span>
                  </div>
                  <button
                    onClick={() => onSelectService(service)}
                    className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 group/btn"
                  >
                    <span>Request Service</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform text-brand-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

