import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = status.toUpperCase();
  let bg = 'bg-gray-100 text-gray-700 border-gray-200';
  
  if (s === 'CONFIRMED') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s === 'PENDING') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s === 'COMPLETED') {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (s === 'CANCELLED') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (s === 'RESCHEDULED') {
    bg = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg}`}>
      {status}
    </span>
  );
};
