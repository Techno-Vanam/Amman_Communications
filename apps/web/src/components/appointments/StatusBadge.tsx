import React from 'react';
import { AppointmentStatus } from '../../lib/api/appointments';

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'PENDING':
        return 'bg-[#FEF3E2] text-[#B45309] border-[#B45309]/20';
      case 'CONFIRMED':
        return 'bg-[#E0F2FE] text-[#075985] border-[#075985]/20';
      case 'COMPLETED':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]/20';
      case 'CANCELLED':
        return 'bg-[#FEE2E2] text-[#B91C1C] border-[#B91C1C]/20';
      case 'RESCHEDULED':
        return 'bg-[#FCE7F3] text-[#BE185D] border-[#BE185D]/20';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatLabel = (st: string) => {
    return st.charAt(0) + st.slice(1).toLowerCase();
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      {formatLabel(status)}
    </span>
  );
};
