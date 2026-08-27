import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';

interface LoginPlaceholderProps {
  mode?: 'login' | 'signup';
  onNavigateHome: () => void;
}

export const LoginPlaceholder: React.FC<LoginPlaceholderProps> = ({
  mode = 'login',
  onNavigateHome,
}) => {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const isSignUp = currentMode === 'signup';

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim() && !loginMobile.trim()) {
      setError('Email address or Mobile number is required');
      return;
    }
    if (!loginPassword) {
      setError('Password is required');
      return;
    }

    setIsPending(true);

    try {
      const res = await fetch('http://localhost:3003/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, mobile: loginMobile, password: loginPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        const targetRoute = data?.user?.role === 'ADMIN' ? '/admin/dashboard' : '/portal/dashboard';
        window.location.href = targetRoute;
        return;
      } else if (res.status === 401) {
        setError('Invalid credentials');
        setIsPending(false);
        return;
      }
    } catch {
      // Fallback for demo
    }

    setTimeout(() => {
      setIsPending(false);
      window.location.href = '/portal/dashboard';
    }, 600);
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || regName.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!regMobile.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    if (!regPassword || regPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsPending(true);

    try {
      const res = await fetch('http://localhost:3003/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, mobile: regMobile, password: regPassword }),
      });

      if (res.ok) {
        window.location.href = '/portal/dashboard';
        return;
      }
    } catch {
      // Fallback for demo
    }

    setTimeout(() => {
      setIsPending(false);
      window.location.href = '/portal/dashboard';
    }, 600);
  };

  // Reusable Green Image Panel Component
  const GreenImagePanel = () => (
    <div className="lg:w-1/2 bg-brand-700 p-8 sm:p-12 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden rounded-[2rem] shadow-xl min-h-[460px]">
      {/* Ambient Lighting */}
      <div className="absolute -top-[10%] -right-[10%] w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

      {/* Header Branding */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-extrabold text-xl tracking-tight text-white leading-none">
            AMMAN
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-brand-200 uppercase leading-tight">
            Communications
          </span>
        </div>
      </div>

      {/* Central Visual Card */}
      <div className="relative z-10 my-auto max-w-lg bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
          Manage everything in <span className="text-brand-200">one place.</span>
        </h2>
        <p className="text-white/85 text-sm sm:text-base leading-relaxed">
          Welcome back to Amman Communications. Access your portal dashboard to track property registrations, document audits, and advisory requests seamlessly.
        </p>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-xs text-white/60 pt-4">
        © {new Date().getFullYear()} Amman Communications. Official Documentation Consultancy.
      </div>
    </div>
  );

  // Reusable Form Panel Component
  const FormPanel = () => (
    <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-14 bg-white">
      <div className="w-full max-w-lg space-y-8">
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
          /* Sign Up Form - Underline Style Input */
          <form onSubmit={handleRegisterSubmit} className="space-y-6" noValidate>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full py-2 bg-transparent border-b-2 border-slate-300 focus:border-brand-600 text-slate-900 text-base font-medium outline-none transition-colors"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full py-2 bg-transparent border-b-2 border-slate-300 focus:border-brand-600 text-slate-900 text-base font-medium outline-none transition-colors"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
                className="w-full py-2 bg-transparent border-b-2 border-slate-300 focus:border-brand-600 text-slate-900 text-base font-medium outline-none transition-colors"
              />
            </div>

            {/* Password with Eye Icon */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full py-2 pr-10 bg-transparent border-b-2 border-slate-300 focus:border-brand-600 text-slate-900 text-base font-medium outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isPending ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCurrentMode('login');
                  }}
                  className="text-brand-700 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Sign In / Login Form - Underline Style Input */
          <form onSubmit={handleLoginSubmit} className="space-y-6" noValidate>
            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full py-2 bg-transparent border-b-2 border-slate-300 focus:border-brand-600 text-slate-900 text-base font-medium outline-none transition-colors"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={loginMobile}
                onChange={(e) => setLoginMobile(e.target.value)}
                className="w-full py-2 bg-transparent border-b-2 border-slate-300 focus:border-brand-600 text-slate-900 text-base font-medium outline-none transition-colors"
              />
            </div>

            {/* Password Field with Eye Icon + Forgot Password BELOW */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full py-2 pr-10 bg-transparent border-b-2 border-slate-300 focus:border-brand-600 text-slate-900 text-base font-medium outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Forgot Password Positioned BELOW the Password Line */}
              <div className="flex justify-end pt-1">
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-brand-600 font-semibold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCurrentMode('signup');
                  }}
                  className="text-brand-700 font-bold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-10">
      {/* EXPANDED FULL-WIDTH AUTHENTICATION CONTAINER WITH FULL OUTER BORDER */}
      <div className="w-full max-w-[1440px] bg-white rounded-[2.5rem] border border-slate-200/90 shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden">
        {/* Back to Home Button: TOP-LEFT for Sign In (signup), TOP-RIGHT for Login (login) */}
        <div className={`w-full flex items-center mb-4 z-20 ${isSignUp ? 'justify-start' : 'justify-end'}`}>
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-brand-600" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* 50/50 SPLIT CONTAINER */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
          {isSignUp ? (
            /* SIGN IN PAGE: Form on LEFT (50%), Green Image on RIGHT (50%) */
            <>
              <FormPanel />
              <GreenImagePanel />
            </>
          ) : (
            /* LOGIN PAGE: Green Image on LEFT (50%), Form on RIGHT (50%) */
            <>
              <GreenImagePanel />
              <FormPanel />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
