'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronDown
} from 'lucide-react';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';
import { UserProvider, useUser } from '@/context/UserContext';

const MAIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { name: 'Book Appointment', href: '/portal/book-appointment', icon: CalendarPlus },
  { name: 'My Appointments', href: '/portal/appointments', icon: Calendar },
  { name: 'My Applications', href: '/portal/applications', icon: FileText },
  { name: 'Document Upload', href: '/portal/documents', icon: Upload },
  { name: 'Payments & Receipts', href: '/portal/payments', icon: CreditCard },
];

function SidebarNavContent({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const { logoutUser } = useUser();

  // Distinguish Profile vs Settings pages so ONLY ONE gets highlighted
  const isProfileActive = pathname === '/portal/profile';
  const isSettingsActive = pathname === '/portal/settings';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white text-gray-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shadow-xl md:shadow-xs border border-gray-100 rounded-3xl md:m-4 md:mr-0 md:h-[calc(100vh-2rem)] md:sticky md:top-4 overflow-hidden
      `}
    >
      {/* Scrollable Top Area: Brand & Navigation */}
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
          <nav aria-label="Customer portal main navigation" className="space-y-1.5">
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
                    flex items-center justify-between px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 group
                    ${isActive
                      ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-semibold'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
                        ${isActive
                          ? 'bg-[#12372A] text-white shadow-xs'
                          : 'bg-transparent text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-800'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{item.name}</span>
                  </div>
                  {badgeValue && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white shadow-2xs mr-1">
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
      <div className="p-4 border-t border-gray-100 bg-white space-y-1.5 shrink-0 rounded-b-3xl">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Account &amp; Preferences</p>
        
        {/* Profile Link */}
        <Link
          href="/portal/profile"
          onClick={() => setMobileMenuOpen(false)}
          className={`
            flex items-center space-x-3 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 group
            ${isProfileActive
              ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold shadow-2xs'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
              ${isProfileActive
                ? 'bg-[#12372A] text-white shadow-xs'
                : 'bg-transparent text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-800'
              }
            `}
          >
            <User className="w-4 h-4" />
          </div>
          <span>Profile</span>
        </Link>

        {/* Settings Link */}
        <Link
          href="/portal/settings"
          onClick={() => setMobileMenuOpen(false)}
          className={`
            flex items-center space-x-3 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 group
            ${isSettingsActive
              ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold shadow-2xs'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
              ${isSettingsActive
                ? 'bg-[#12372A] text-white shadow-xs'
                : 'bg-transparent text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-800'
              }
            `}
          >
            <Settings className="w-4 h-4" />
          </div>
          <span>Settings</span>
        </Link>

        {/* Log Out Button */}
        <div className="pt-2 border-t border-gray-100 mt-1">
          <Link
            href="/login"
            onClick={logoutUser}
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

function PortalSidebarContent(props: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  return (
    <Suspense fallback={<aside className="w-72 bg-white rounded-3xl m-4 border border-gray-100" />}>
      <SidebarNavContent {...props} />
    </Suspense>
  );
}

function PortalTopHeader() {
  const { unreadCount } = useNotifications();
  const { user } = useUser();

  return (
    <header className="bg-transparent pb-6 flex items-center justify-end">
      {/* Right User Controls: Notification Bell & Profile Badge */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <Link
          href="/portal/notifications"
          className="w-12 h-12 rounded-full bg-white border border-gray-200/90 flex items-center justify-center text-gray-600 hover:text-[#12372A] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs relative"
          title="Notifications"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-500 text-white text-[11px] font-extrabold flex items-center justify-center shadow-xs border-2 border-white leading-none shrink-0">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Pill Badge */}
        <Link
          href="/portal/profile"
          className="flex items-center gap-3.5 bg-white border border-gray-200/90 rounded-full pl-3 pr-6 py-2 shadow-xs hover:bg-[#f0f7f2] hover:border-[#a8d5b9] hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#12372A] text-[#a8d5b9] font-bold text-sm flex items-center justify-center border border-[#a8d5b9]/30 shadow-2xs shrink-0">
            {user.initials}
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <p className="text-sm font-extrabold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">View Profile</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
        </Link>
      </div>
    </header>
  );
}

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <UserProvider>
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
    </UserProvider>
  );
}