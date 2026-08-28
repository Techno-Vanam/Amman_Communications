'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { loginAction } from '../../app/login/actions';
import { registerAction } from '../../app/register/actions';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
}

export default function AuthPage({ initialMode }: AuthPageProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const isSignUp = currentMode === 'signup';

  const switchMode = (mode: 'login' | 'signup') => {
    setError(null);
    setCurrentMode(mode);
    window.history.pushState({}, '', mode === 'signup' ? '/register' : '/login');
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const emailOrUser = loginEmail.trim();
    if (!emailOrUser) {
      setError('Email address is required');
      return;
    }
    if (!loginPassword) {
      setError('Password is required');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', emailOrUser);
      formData.append('password', loginPassword);

      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success && result.redirectTo) {
        try {
          localStorage.setItem('user_email', emailOrUser);
          const derivedName = emailOrUser.split('@')[0].replace('.', ' ');
          const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
          localStorage.setItem(
            'amman_user_profile',
            JSON.stringify({
              name: formattedName,
              email: emailOrUser,
              phone: '+91 ',
              address: '',
              handle: `@${emailOrUser.split('@')[0]}`,
              initials: formattedName.charAt(0).toUpperCase(),
            })
          );
        } catch (err) {
          console.error('LocalStorage save error:', err);
        }
        window.location.href = result.redirectTo;
      }
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || regName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!regPassword || regPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', regName.trim());
      formData.append('email', regEmail.trim());
      formData.append('password', regPassword);

      const result = await registerAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success && result.redirectTo) {
        try {
          localStorage.setItem('user_email', regEmail.trim());
          localStorage.setItem(
            'amman_user_profile',
            JSON.stringify({
              name: regName.trim(),
              email: regEmail.trim(),
              phone: regMobile || '+91 ',
              address: '',
              handle: `@${regEmail.trim().split('@')[0]}`,
              initials: regName.trim().charAt(0).toUpperCase(),
            })
          );
        } catch (err) {
          console.error('LocalStorage save error:', err);
        }
        window.location.href = result.redirectTo;
      }
    });
  };

  const brandingPanel = (
    <div className="lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-[#062117] p-8 sm:p-12 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden self-stretch w-full min-h-[400px]">
      {/* Subtle Ambient Lighting */}
      <div className="absolute -top-[10%] -right-[10%] w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

      {/* Header Branding */}
      <div className="relative z-10 flex items-center gap-3 mb-5 lg:mb-0">
        <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-extrabold text-xl tracking-tight text-white leading-none">
            AMMAN
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-brand-200 uppercase leading-tight mt-0.5">
            Communications
          </span>
        </div>
      </div>

      {/* Central Visual Card */}
      <div className="relative z-10 my-5 lg:my-auto max-w-lg bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Unified Client & Admin Portal</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
          {isSignUp ? (
            <>
              Start your journey with <span className="text-brand-200">us today.</span>
            </>
          ) : (
            <>
              Manage everything in <span className="text-brand-200">one place.</span>
            </>
          )}
        </h2>
        <p className="text-white/85 text-sm sm:text-base leading-relaxed">
          {isSignUp
            ? 'Join Amman Communications to access our secure portal, submit document verification requests, and track your application progress with full transparency.'
            : 'Welcome back to Amman Communications. Access your portal dashboard to track property registrations, document audits, and advisory requests seamlessly.'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-xs text-white/60 pt-4 flex items-center justify-between">
        <span>© {new Date().getFullYear()} Amman Communications.</span>
        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> 256-Bit SSL Encrypted</span>
      </div>
    </div>
  );

  const formPanel = (
    <div className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white self-stretch w-full overflow-y-auto">
      {/* Back to Home Header */}
      <div className={`w-full flex items-center mb-4 ${isSignUp ? 'justify-start' : 'justify-end'}`}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-brand-600" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isSignUp ? 'Create an Account' : 'Sign In'}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            {isSignUp
              ? 'Fill in your details below to register with Amman Communications'
              : 'Welcome back! Enter your details below to access your account'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {isSignUp ? (
          /* Sign Up Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/60 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-0 text-slate-900 text-sm font-medium transition-colors"
                disabled={isPending}
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/60 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-0 text-slate-900 text-sm font-medium transition-colors"
                disabled={isPending}
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label htmlFor="reg-mobile" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mobile Number (Optional)
              </label>
              <input
                id="reg-mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/60 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-0 text-slate-900 text-sm font-medium transition-colors"
                disabled={isPending}
              />
            </div>

            {/* Password with Eye Icon */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="At least 8 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-slate-50/60 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-0 text-slate-900 text-sm font-medium transition-colors"
                  disabled={isPending}
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
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60 hover:scale-[1.01]"
            >
              {isPending ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-brand-700 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Sign In Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/60 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-0 text-slate-900 text-sm font-medium transition-colors"
                disabled={isPending}
              />
            </div>

            {/* Password Field with Eye Icon */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setError('Please contact your administrator at support@ammancomm.in to reset credentials.');
                  }}
                  className="text-xs text-brand-600 font-semibold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-slate-50/60 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-0 text-slate-900 text-sm font-medium transition-colors"
                  disabled={isPending}
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
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60 hover:scale-[1.01]"
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-brand-700 font-bold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </div>
          </form>
        )}
      </div>

      <div />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 overflow-y-auto">
      {/* MAIN AUTHENTICATION CONTAINER: FULL 50/50 SPLIT */}
      <div className="w-full max-w-[1400px] min-h-[640px] lg:max-h-[850px] bg-white rounded-[2.5rem] border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col lg:flex-row items-stretch my-auto">
        {isSignUp ? (
          <>
            {formPanel}
            {brandingPanel}
          </>
        ) : (
          <>
            {brandingPanel}
            {formPanel}
          </>
        )}
      </div>
    </div>
  );
}
