import React from 'react';
import Link from 'next/link';
import { CustomerProfile } from '../../lib/api/appointments';
import { User, Mail, MapPin, Info, FileText } from 'lucide-react';

interface CustomerInfoFieldsProps {
  profile: CustomerProfile | null;
  address: string;
  onAddressChange: (address: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isLoadingProfile?: boolean;
}

export const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  profile,
  address,
  onAddressChange,
  notes,
  onNotesChange,
  isLoadingProfile = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Customer Information
        </label>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Name & Email auto-filled from profile
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-100 items-start">
        {/* Full Name */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
            Full Name
          </span>
          <div className="flex items-center gap-2 text-slate-800 text-sm font-medium py-1.5">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{isLoadingProfile ? 'Loading...' : profile?.name || 'N/A'}</span>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
            Email Address
          </span>
          <div className="flex items-center gap-2 text-slate-800 text-sm font-medium truncate py-1.5">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{isLoadingProfile ? 'Loading...' : profile?.email || 'N/A'}</span>
          </div>
        </div>

        {/* Editable Address Input */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
            Address
          </span>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Building 45, King Hussein St, Amman"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 font-medium outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Need to update your personal details? Manage your profile in{' '}
        <Link href="/customer/profile" className="text-blue-600 font-medium hover:underline">
          Profile Settings
        </Link>
      </p>

      {/* Additional Notes */}
      <div className="space-y-1.5 pt-2">
        <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Additional Notes (Optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Any specific requests, document background, or instructions for our advisor..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 outline-none transition-all resize-y"
        />
      </div>
    </div>
  );
};
