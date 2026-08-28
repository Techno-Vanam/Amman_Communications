'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

export function CustomerLogoutButton() {
  const handleLogout = () => {
    void fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      type="button"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors"
      title="Sign out of your account"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Logout</span>
    </button>
  );
}
