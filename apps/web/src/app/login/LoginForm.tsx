'use client';

import { useState, useTransition } from 'react';
import { loginAction } from './actions';
import styles from './LoginForm.module.css';
import Link from 'next/link';

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await loginAction(formData);
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.success && result.redirectTo) {
        // Force a hard refresh on the router to apply new cookies to layout
        window.location.href = result.redirectTo;
      }
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account to continue</p>
      </div>

      {error && (
        <div className={styles.errorAlert} role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.errorIcon}>
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM12 7v6M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label htmlFor="email" className={styles.label}>Email address</label>
        <div className={styles.inputWrap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.inputIcon}>
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={styles.input}
            placeholder="name@example.com"
            disabled={isPending}
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
        </div>
        <div className={styles.inputWrap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.inputIcon}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={styles.input}
            placeholder="••••••••"
            disabled={isPending}
            suppressHydrationWarning
          />
          <button
            type="button"
            className={styles.showHideBtn}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
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

      <button type="submit" className={styles.submitBtn} disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Don't have an account? <Link href="/register" className={styles.footerLink}>Create account</Link>
        </p>
      </div>
    </form>
  );
}
