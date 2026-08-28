'use client';

import { useState, useTransition } from 'react';
import { loginAction } from './actions';
import Link from 'next/link';

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const emailVal = formData.get('email') as string;

    startTransition(async () => {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success && result.redirectTo) {
        if (emailVal) {
          try {
            localStorage.setItem('user_email', emailVal);
            const derivedName = emailVal.split('@')[0].replace('.', ' ');
            const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
            localStorage.setItem('amman_user_profile', JSON.stringify({
              name: formattedName,
              email: emailVal,
              phone: '+91 ',
              address: '',
              handle: `@${emailVal.split('@')[0]}`,
              initials: formattedName.charAt(0).toUpperCase()
            }));
          } catch (e) {
            console.error('LocalStorage save error:', e);
          }
        }
        window.location.href = result.redirectTo;
      }
    });
  };

  return (
    <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit} noValidate>
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to your account to continue</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-300 rounded-xl text-red-800 text-sm font-medium" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-shrink-0 text-red-500">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM12 7v6M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-800">Email address</label>
        <div className="relative flex items-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="absolute left-3 text-gray-400 pointer-events-none">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            placeholder="name@example.com"
            disabled={isPending}
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <label htmlFor="password" className="text-sm font-medium text-gray-800">Password</label>
        </div>
        <div className="relative flex items-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="absolute left-3 text-gray-400 pointer-events-none">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className="w-full pl-10 pr-10 py-2.5 text-base border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            placeholder="••••••••"
            disabled={isPending}
            suppressHydrationWarning
          />
          <button
            type="button"
            className="absolute right-2 flex items-center justify-center p-1 text-gray-400 rounded-md hover:text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isPending}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="flex items-center justify-center w-full py-3 px-6 mt-2 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={isPending}
      >
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="text-center mt-2">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-700 font-semibold hover:underline">Create account</Link>
        </p>
      </div>
    </form>
  );
}
