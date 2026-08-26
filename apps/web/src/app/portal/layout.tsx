'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarPlus,
  Calendar,
  FileText,
  Upload,
  CreditCard,
  Bell,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Search,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';

const MAIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { name: 'Book Appointment', href: '/portal/book-appointment', icon: CalendarPlus },
  { name: 'My Appointments', href: '/portal/appointments', icon: Calendar },
  { name: 'My Applications', href: '/portal/applications', icon: FileText },
  { name: 'Document Upload', href: '/portal/documents', icon: Upload },
  { name: 'Payments & Receipts', href: '/portal/payments', icon: CreditCard },
  { name: 'Notifications', href: '/portal/notifications', icon: Bell },
];

function SidebarNavContent({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') : null;
  const { unreadCount } = useNotifications();

  // Distinguish Profile vs Settings tabs so ONLY ONE gets highlighted
  const isProfileActive = pathname === '/portal/settings' && currentTab !== 'Preferences';
  const isSettingsActive = pathname === '/portal/settings' && currentTab === 'Preferences';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white text-gray-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shadow-xl md:shadow-xs border border-gray-100 rounded-3xl md:m-4 md:mr-0 md:h-[calc(100vh-2rem)] md:sticky md:top-4 overflow-hidden
      `}
    >
      {/* Scrollable Top Area: Brand & Main Navigation */}
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-[#12372A] text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-[#a8d5b9]" />
          </div>
          <div>
            <Link href="/portal/dashboard" className="text-lg font-bold tracking-tight text-[#12372A] hover:opacity-80 transition-opacity block leading-tight">
              Amman Comm
            </Link>
            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-0.5">
              Services Management
            </p>
          </div>
        </div>

        {/* Main Nav Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Main Menu</p>
          <nav aria-label="Customer portal main navigation" className="space-y-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href));
              const badgeValue = item.name === 'Notifications' && unreadCount > 0 ? String(unreadCount) : null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group
                    ${isActive
                      ? 'bg-[#f0f7f2] text-[#12372A] font-bold shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-[#12372A]' : 'text-gray-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {badgeValue && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white shadow-2xs">
                      {badgeValue}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Fixed Footer Section: Profile, Settings & Log Out */}
      <div className="p-4 border-t border-gray-100 bg-white space-y-1 shrink-0 rounded-b-3xl">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Account &amp; Preferences</p>
        
        {/* Profile Link */}
        <Link
          href="/portal/settings?tab=Profile"
          onClick={() => setMobileMenuOpen(false)}
          className={`
            flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group
            ${isProfileActive
              ? 'bg-[#f0f7f2] text-[#12372A] font-bold shadow-2xs'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <User className={`w-4 h-4 transition-transform group-hover:scale-110 ${isProfileActive ? 'text-[#12372A]' : 'text-gray-400'}`} />
          <span>Profile</span>
        </Link>

        {/* Settings Link */}
        <Link
          href="/portal/settings?tab=Preferences"
          onClick={() => setMobileMenuOpen(false)}
          className={`
            flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group
            ${isSettingsActive
              ? 'bg-[#f0f7f2] text-[#12372A] font-bold shadow-2xs'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <Settings className={`w-4 h-4 transition-transform group-hover:scale-110 ${isSettingsActive ? 'text-[#12372A]' : 'text-gray-400'}`} />
          <span>Settings</span>
        </Link>

        {/* Log Out Button */}
        <div className="pt-2 border-t border-gray-100 mt-1">
          <Link
            href="/login"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-rose-600 transition-colors" />
            <span>Log out</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

function PortalSidebarContent(props: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  return (
    <Suspense fallback={<aside className="w-72 bg-white rounded-3xl m-4 border border-gray-100" />}>
      <SidebarNavContent {...props} />
    </Suspense>
  );
}

function PortalTopHeader() {
  const { unreadCount } = useNotifications();

  return (
    <header className="bg-transparent pb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Sleek Pill Search Bar */}
      <div className="relative w-full md:w-80">
        <div className="flex items-center gap-2.5 bg-white border border-gray-200/80 rounded-full px-4 py-2.5 shadow-2xs text-xs text-gray-400 focus-within:border-[#12372A] focus-within:ring-2 focus-within:ring-[#12372A]/10 transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search services, applications..."
            className="w-full bg-transparent text-gray-800 focus:outline-none text-xs font-medium placeholder:text-gray-400"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-md border border-gray-200 shrink-0">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right User Controls */}
      <div className="flex items-center space-x-3 self-end md:self-auto">
        {/* Support Chat Icon Button */}
        <Link
          href="/portal/settings?tab=Preferences"
          className="w-9 h-9 rounded-full bg-white border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-[#12372A] hover:bg-gray-50 transition-all shadow-2xs"
          title="Support Chat"
        >
          <MessageSquare className="w-4 h-4" />
        </Link>

        {/* Notification Bell */}
        <Link
          href="/portal/notifications"
          className="w-9 h-9 rounded-full bg-white border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-[#12372A] hover:bg-gray-50 transition-all shadow-2xs relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Pill Badge */}
        <Link
          href="/portal/settings?tab=Profile"
          className="flex items-center gap-3 bg-white border border-gray-200/80 rounded-full pl-2 pr-4 py-1.5 shadow-2xs hover:border-[#12372A] transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-[#12372A] text-[#a8d5b9] font-bold text-xs flex items-center justify-center border border-[#a8d5b9]/30">
            JD
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <p className="text-xs font-bold text-gray-900">John Doe</p>
            <p className="text-[10px] text-gray-400 font-medium">@john_doe</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </Link>
      </div>
    </header>
  );
}

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#f4f6f8] text-gray-900 flex flex-col md:flex-row font-sans">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between bg-[#12372A] px-4 py-3 text-white sticky top-0 z-50 border-b border-[#1f4e3c]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#a8d5b9]/20 flex items-center justify-center border border-[#a8d5b9]/40 text-[#a8d5b9]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-none">Amman Comm</span>
              <span className="text-[10px] text-[#a8d5b9] font-medium tracking-wide">SERVICES MANAGEMENT</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#a8d5b9] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <PortalSidebarContent mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <PortalTopHeader />
          {children}
        </main>

        {/* Backdrop for Mobile */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          />
        )}
      </div>
    </NotificationProvider>
  );
}