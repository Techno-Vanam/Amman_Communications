'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { requestPasswordReset } from '../../lib/passwordReset';

interface ForgotPasswordProps {
  onBack: () => void;
  onEmailSubmitted: (email: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onEmailSubmitted }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestPasswordReset(email);

      if (!result.success) {
        setError(result.error || 'Failed to process password reset');
        setIsLoading(false);
        return;
      }

      // Show success state and then proceed
      setIsSubmitted(true);
      setTimeout(() => {
        onEmailSubmitted(email);
      }, 1500);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred. Please try again later.');
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto my-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Check your email</h2>
          <p className="text-sm text-slate-600">
            If an account exists with this email address, a verification code has been sent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto my-auto space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sign In</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="reset-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-slate-50/60 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-0 text-slate-900 text-sm font-medium transition-colors disabled:opacity-60"
          />
          {email && !validateEmail(email) && (
            <p className="text-xs text-red-600 font-medium">Please enter a valid email address</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
        >
          {isLoading ? 'Sending Code...' : 'Send Verification Code'}
        </button>
      </form>

      {/* Additional Help */}
      <p className="text-center text-xs text-slate-500">
        Remember your password?{' '}
        <button
          type="button"
          onClick={onBack}
          className="text-brand-700 font-bold hover:underline cursor-pointer"
        >
          Sign In
        </button>
      </p>
    </div>
  );
};
