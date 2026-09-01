'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';
import { resetPassword } from '../../lib/passwordReset';

interface ResetPasswordProps {
  email: string;
  resetToken: string;
  onPasswordReset: () => void;
}

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const validatePasswordRequirements = (password: string): PasswordRequirements => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

const allRequirementsMet = (requirements: PasswordRequirements): boolean => {
  return Object.values(requirements).every((req) => req === true);
};

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  email,
  resetToken,
  onPasswordReset,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requirements = validatePasswordRequirements(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDoNotMatch =
    password && confirmPassword && password !== confirmPassword;
  const isFormValid =
    allRequirementsMet(requirements) && passwordsMatch && !isLoading;

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError('Please ensure all password requirements are met and passwords match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email, resetToken, password);

      if (!result.success) {
        setError(result.error || 'Failed to reset password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success - proceed to success screen
      onPasswordReset();
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred. Please try again later.');
      setIsLoading(false);
    }
  };

  const RequirementItem: React.FC<{
    met: boolean;
    text: string;
  }> = ({ met, text }) => (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
      )}
      <span className={`text-xs ${met ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto my-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create a new password
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Choose a strong password to keep your account secure.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="new-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="new-password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Enter your new password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 pr-10 bg-slate-50/60 border rounded-xl focus:bg-white focus:outline-none focus:ring-0 text-slate-900 text-sm font-medium transition-colors disabled:opacity-60 ${
                password && !allRequirementsMet(requirements)
                  ? 'border-amber-300 focus:border-amber-400'
                  : password && allRequirementsMet(requirements)
                    ? 'border-emerald-300 focus:border-emerald-400'
                    : 'border-slate-300 focus:border-brand-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Requirements */}
          {password && (
            <div className="space-y-1.5 p-3 bg-slate-50/60 border border-slate-200 rounded-lg">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Your password should contain:
              </p>
              <div className="space-y-1.5">
                <RequirementItem met={requirements.length} text="At least 8 characters" />
                <RequirementItem
                  met={requirements.uppercase}
                  text="One uppercase letter (A-Z)"
                />
                <RequirementItem
                  met={requirements.lowercase}
                  text="One lowercase letter (a-z)"
                />
                <RequirementItem met={requirements.number} text="One number (0-9)" />
                <RequirementItem
                  met={requirements.special}
                  text="One special character (!@#$%^&*)"
                />
              </div>

              {/* Password Strength Meter */}
              {(() => {
                const metCount = Object.values(requirements).filter(Boolean).length;
                const strengthLabel =
                  metCount <= 1 ? 'Weak' : metCount <= 2 ? 'Fair' : metCount <= 4 ? 'Good' : 'Strong';
                const strengthColor =
                  metCount <= 1
                    ? 'bg-red-500'
                    : metCount <= 2
                      ? 'bg-amber-500'
                      : metCount <= 4
                        ? 'bg-brand-500'
                        : 'bg-emerald-500';
                const strengthTextColor =
                  metCount <= 1
                    ? 'text-red-600'
                    : metCount <= 2
                      ? 'text-amber-600'
                      : metCount <= 4
                        ? 'text-brand-600'
                        : 'text-emerald-600';
                const strengthWidth = `${(metCount / 5) * 100}%`;

                return (
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Password strength</span>
                      <span className={`text-xs font-bold ${strengthTextColor}`}>{strengthLabel}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} rounded-full transition-all duration-300 ease-out`}
                        style={{ width: strengthWidth }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 pr-10 bg-slate-50/60 border rounded-xl focus:bg-white focus:outline-none focus:ring-0 text-slate-900 text-sm font-medium transition-colors disabled:opacity-60 ${
                confirmPassword && passwordsDoNotMatch
                  ? 'border-red-300 focus:border-red-400'
                  : confirmPassword && passwordsMatch
                    ? 'border-emerald-300 focus:border-emerald-400'
                    : 'border-slate-300 focus:border-brand-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Mismatch Error */}
          {passwordsDoNotMatch && (
            <p className="text-xs text-red-600 font-medium">Passwords do not match</p>
          )}

          {/* Passwords Match Success */}
          {passwordsMatch && (
            <p className="text-xs text-emerald-600 font-medium">Passwords match ✓</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};
