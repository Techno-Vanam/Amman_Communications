'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Building2,
  Calendar,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Menu,
  Receipt,
  Search,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react';

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, user, clearSession } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  React.useEffect(() => {
    if (ready && !isSigningOut && (!user || user.role !== 'ADMIN')) router.replace('/login?forbidden=true');
  }, [isSigningOut, ready, router, user]);

  if (!ready || !user || user.role !== 'ADMIN') {
    return <div className="min-h-screen bg-gray-50" />;
  }

  const handleLogout = async () => {
    setIsSigningOut(true);
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    clearSession();
    router.replace('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Applications', href: '/admin/applications', icon: FileText },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: User },
    { name: 'Services', href: '/admin/services', icon: Building2 },
    { name: 'Expenses', href: '/admin/expenses', icon: Receipt },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-emerald-950 text-white shadow-md border-b border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-inner">
                <Shield className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="tracking-tight">Amman Admin</span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full text-emerald-200 focus-within:text-white">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search portal..."
                className="w-full bg-emerald-900/60 border border-emerald-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-emerald-900"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl hover:bg-emerald-900 text-sm font-medium transition-colors"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-200 font-bold border border-emerald-700">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline text-white">Admin Account</span>
                <ChevronDown className="w-4 h-4 text-emerald-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-gray-800">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">admin@test.com</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-emerald-700" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="#"
                    onClick={(event) => { event.preventDefault(); void handleLogout(); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4 shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-950'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-emerald-200' : 'text-emerald-700'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative w-64 max-w-xs bg-white h-full p-4 border-r border-gray-200 flex flex-col z-40">
              <nav className="space-y-1 mt-14">
                {navItems.map((item) => {
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-emerald-900 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-950'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-emerald-200' : 'text-emerald-700'
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
