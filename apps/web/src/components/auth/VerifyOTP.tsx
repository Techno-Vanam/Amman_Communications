'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { verifyPasswordResetOTP, resendPasswordResetOTP } from '../../lib/passwordReset';

interface VerifyOTPProps {
  email: string;
  onBack: () => void;
  onVerified: (token: string) => void;
}

export const VerifyOTP: React.FC<VerifyOTPProps> = ({ email, onBack, onVerified }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      e.preventDefault();
    }
    // Handle ArrowLeft
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle ArrowRight
    else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);

    if (digits.length > 0) {
      const newOtp = [...otp];
      digits.forEach((digit, idx) => {
        if (idx < 6) {
          newOtp[idx] = digit;
        }
      });
      setOtp(newOtp);

      // Focus on the last filled input or next empty input
      const nextEmptyIndex = newOtp.findIndex((val) => val === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const otpString = otp.join('');
  const isOtpComplete = otpString.length === 6;

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isOtpComplete) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyPasswordResetOTP(email, otpString);

      if (!result.success) {
        setError(result.error || 'Invalid verification code');
        setIsLoading(false);
        return;
      }

      if (!result.token) {
        setError('Failed to verify code. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success - proceed to reset password
      onVerified(result.token);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('An error occurred. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setResendLoading(true);

    try {
      const result = await resendPasswordResetOTP(email);

      if (result.success) {
        setResendTimer(60); // 60 second cooldown
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.error || 'Failed to resend code');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verify your email</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          We've sent a verification code to <span className="font-medium text-slate-700">{email}</span>.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* OTP Input Form */}
      <form onSubmit={handleVerify} className="space-y-6" noValidate>
        {/* OTP Input Boxes */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Verification Code <span className="text-red-500">*</span>
          </label>
          <div className="flex justify-between gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="\d"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-10 h-12 sm:w-12 sm:h-14 flex-1 text-center text-lg sm:text-2xl font-bold bg-slate-50/60 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:outline-none text-slate-900 transition-colors disabled:opacity-60"
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={isLoading || !isOtpComplete}
          className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      {/* Resend Code Section */}
      <div className="text-center space-y-2">
        <p className="text-xs text-slate-500">Didn't receive the code?</p>
        {resendTimer > 0 ? (
          <p className="text-xs text-slate-600 font-medium">
            Resend code in <span className="text-brand-600 font-bold">{resendTimer}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading}
            className="text-brand-700 font-bold text-xs hover:underline cursor-pointer disabled:opacity-60"
          >
            {resendLoading ? 'Sending...' : 'Resend Code'}
          </button>
        )}
      </div>

      {/* Change Email */}
      <p className="text-center text-xs text-slate-500">
        Wrong email?{' '}
        <button
          type="button"
          onClick={onBack}
          className="text-brand-700 font-bold hover:underline cursor-pointer"
        >
          Go Back
        </button>
      </p>
    </div>
  );
};
