'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Building2,
  Receipt,
  ShieldCheck,
  User,
  Users,
  CheckCircle,
  Wallet,
  PieChart,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Application', href: '/admin/applications', icon: FileText },
  { name: 'Verification', href: '/admin/verification', icon: CheckCircle },
  { name: 'Finance', href: '/admin/finance', icon: Wallet },
  { name: 'Expense', href: '/admin/expenses', icon: Receipt },
  { name: 'Service', href: '/admin/services', icon: Building2 },
  { name: 'Report', href: '/admin/reports', icon: PieChart },
];

function AdminSidebarNavContent({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const isProfileActive = pathname === '/admin/profile';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-72 md:w-60 lg:w-72 bg-white text-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shadow-xl md:shadow-xs border border-gray-100 rounded-3xl md:m-3 lg:m-4 md:mr-0 md:h-[calc(100vh-2rem)] md:shrink-0
      `}
    >
      {/* Fixed Brand Header — not scrollable */}
      <div className="p-6 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#12372A] text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#a8d5b9]" />
          </div>
          <div>
            <Link
              href="/admin"
              className="text-lg font-bold tracking-tight text-[#12372A] hover:opacity-80 transition-opacity block leading-tight"
            >
              Amman Admin
            </Link>
            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-0.5">
              Control Center
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation */}
      <div className="p-5 pt-4 space-y-1 overflow-y-auto flex-1 admin-scrollbar">
        {/* Main Nav Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Main Menu
          </p>
          <nav aria-label="Admin portal main navigation" className="space-y-1.5">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 group
                    ${isActive ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold shadow-2xs' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-semibold'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
                        ${isActive ? 'bg-[#12372A] text-white shadow-xs' : 'bg-transparent text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-800'}
                      `}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Fixed Footer Section: Profile & Log Out only */}
      <div className="p-4 border-t border-gray-100 bg-white space-y-1.5 shrink-0 rounded-b-3xl">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          System &amp; Account
        </p>

        {/* Profile Link */}
        <Link
          href="/admin/profile"
          onClick={() => setMobileMenuOpen(false)}
          className={`
            flex items-center space-x-3 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 group
            ${isProfileActive ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold shadow-2xs' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
          `}
        >
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
              ${isProfileActive ? 'bg-[#12372A] text-white shadow-xs' : 'bg-transparent text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-800'}
            `}
          >
            <User className="w-4 h-4" />
          </div>
          <span>Profile</span>
        </Link>

        {/* Log Out Button */}
        <div className="pt-2 border-t border-gray-100 mt-1">
          <Link
            href="/login"
            className="flex items-center space-x-3 px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-transparent text-gray-400 group-hover:bg-rose-100 group-hover:text-rose-600 flex items-center justify-center shrink-0 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Log out</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

const PATH_METADATA: Record<
  string,
  { title: string; subtext: string; icon: React.ComponentType<{ className?: string }> }
> = {
  '/admin': { title: 'Dashboard', subtext: 'Welcome back, Administrator', icon: LayoutDashboard },
  '/admin/customers': { title: 'Customers', subtext: 'Manage all registered customer accounts', icon: Users },
  '/admin/appointments': { title: 'Appointments', subtext: 'Manage all booked and upcoming appointments', icon: Calendar },
  '/admin/applications': { title: 'Applications', subtext: 'Track and manage all service applications', icon: FileText },
  '/admin/verification': { title: 'Verification', subtext: 'Review and verify customer-submitted documents', icon: ShieldCheck },
  '/admin/finance': { title: 'Finance', subtext: 'Track payments, collections and outstanding balances', icon: Wallet },
  '/admin/expenses': { title: 'Expenses', subtext: 'Track and manage all business expenditures', icon: Receipt },
  '/admin/services': { title: 'Services', subtext: 'Manage the service catalog offered to customers', icon: Building2 },
  '/admin/reports': { title: 'Reports & Analytics', subtext: 'Business performance overview — Aug 2026', icon: PieChart },
  '/admin/profile': { title: 'Admin Profile', subtext: 'Manage company information and branding', icon: User },
};

function AdminTopHeader() {
  const pathname = usePathname();
  const matched = PATH_METADATA[pathname] || {
    title: 'Admin Panel',
    subtext: 'Control Center',
    icon: ShieldCheck,
  };
  const Icon = matched.icon;

  return (
    <header className="bg-transparent pb-4 sm:pb-6 flex items-center justify-between gap-3 border-b border-gray-200/50 mb-4 sm:mb-6 shrink-0 flex-wrap">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#12372A] flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#a8d5b9]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 leading-tight truncate">
            {matched.title}
          </h1>
          <p className="text-[10px] sm:text-[11px] text-gray-500 font-semibold mt-0.5 truncate">
            {matched.subtext}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          suppressHydrationWarning
          className="w-10 h-10 rounded-full bg-white border border-gray-200/90 flex items-center justify-center text-gray-600 hover:text-[#12372A] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs relative shrink-0"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Admin Profile Circle Option */}
        <Link
          href="/admin/profile"
          className="w-10 h-10 rounded-full bg-[#12372A] text-white font-extrabold text-xs flex items-center justify-center border border-[#12372A] shadow-xs hover:bg-[#1a4a38] transition-all shrink-0"
          title="Admin Profile"
        >
          AD
        </Link>
      </div>
    </header>
  );
}

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#f4f6f8] text-gray-900 flex flex-col md:flex-row font-sans max-w-full" suppressHydrationWarning>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-[#12372A] px-4 py-3 text-white sticky top-0 z-50 border-b border-[#1f4e3c]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#a8d5b9]/20 flex items-center justify-center border border-[#a8d5b9]/40 text-[#a8d5b9]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block leading-none">
              Amman Admin
            </span>
            <span className="text-[10px] text-[#a8d5b9] font-medium tracking-wide">
              CONTROL CENTER
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          suppressHydrationWarning
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#a8d5b9] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <Suspense fallback={<aside className="w-72 md:w-60 lg:w-72 max-w-[85vw] bg-white rounded-3xl m-3 lg:m-4 border border-gray-100 shrink-0" />}>
        <AdminSidebarNavContent mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      </Suspense>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 p-3.5 sm:p-4 md:p-5 lg:p-8 h-full overflow-y-auto max-w-full overflow-x-hidden">
        <AdminTopHeader />
        {children}
      </main>

      {/* Backdrop for Mobile */}
      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" />
      )}
    </div>
  );
}
