import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'blue' | 'rose' | 'violet' | 'indigo' | 'amber' | 'teal' | 'orange';
  iconBg?: string;
  iconColor?: string;
  iconBorder?: string;
  badgeBg?: string;
}

const VARIANTS: Record<string, { iconBg: string; iconColor: string; iconBorder: string; badgeBg: string }> = {
  emerald: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    iconBorder: 'border-emerald-100',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
  },
  blue: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconBorder: 'border-blue-100',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200/60',
  },
  rose: {
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    iconBorder: 'border-rose-100',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/60',
  },
  violet: {
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    iconBorder: 'border-violet-100',
    badgeBg: 'bg-violet-50 text-violet-800 border-violet-200/60',
  },
  indigo: {
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    iconBorder: 'border-indigo-100',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200/60',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBorder: 'border-amber-100',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/60',
  },
  teal: {
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-700',
    iconBorder: 'border-teal-100',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200/60',
  },
  orange: {
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    iconBorder: 'border-orange-100',
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-200/60',
  },
};

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  variant = 'emerald',
  iconBg,
  iconColor,
  iconBorder,
  badgeBg,
}: StatCardProps) {
  const conf = VARIANTS[variant] || VARIANTS.emerald;
  const finalIconBg = iconBg || conf.iconBg;
  const finalIconColor = iconColor || conf.iconColor;
  const finalIconBorder = iconBorder || conf.iconBorder;
  const finalBadgeBg = badgeBg || conf.badgeBg;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-full ${finalIconBg} ${finalIconColor} border ${finalIconBorder} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold text-gray-500 tracking-wide leading-tight truncate">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl font-extrabold text-[#0e2a47] tracking-tight">{value}</p>
      <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${finalBadgeBg} self-start`}>
        {sub}
      </span>
    </div>
  );
}
