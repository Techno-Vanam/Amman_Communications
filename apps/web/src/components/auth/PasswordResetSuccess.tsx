'use client';

import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface ResetSuccessProps {
  onContinueToSignIn: () => void;
}

export const ResetSuccess: React.FC<ResetSuccessProps> = ({ onContinueToSignIn }) => {
  return (
    <div className="w-full max-w-md mx-auto my-auto space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Password updated successfully
        </h1>
        <p className="text-sm text-slate-600">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinueToSignIn}
        className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-center gap-2"
      >
        <span>Continue to Sign In</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
