import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, UserPlus, Info } from 'lucide-react';

interface LoginPlaceholderProps {
  mode?: 'login' | 'signup';
  onNavigateHome: () => void;
}

export const LoginPlaceholder: React.FC<LoginPlaceholderProps> = ({
  mode = 'login',
  onNavigateHome,
}) => {
  const isSignUp = mode === 'signup';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6 animate-fade-in text-center">
        {/* Header Logo */}
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
          {isSignUp ? <UserPlus className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Route: {isSignUp ? '/signup' : '/login'}</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">
            {isSignUp ? 'Create an Account' : 'Client Login Portal'}
          </h2>
          <p className="text-slate-600 text-sm">
            Amman Communications Authentication Connection
          </p>
        </div>

        {/* Integration Info Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Teammate Integration Endpoint</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            This placeholder page marks the designated route for your teammate's login & authentication module. The landing page buttons seamlessly route here without overwriting backend or authentication logic.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onNavigateHome}
            className="w-full py-3.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Amman Communications Landing Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
