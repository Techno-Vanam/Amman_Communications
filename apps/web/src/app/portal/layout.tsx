'use client';

import React, { useState } from 'react';
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
  Menu,
  X,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { name: 'Book Appointment', href: '/portal/book-appointment', icon: CalendarPlus },
  { name: 'My Appointments', href: '/portal/appointments', icon: Calendar },
  { name: 'My Applications', href: '/portal/applications', icon: FileText },
  { name: 'Document Upload', href: '/portal/documents', icon: Upload },
  { name: 'Payments & Receipts', href: '/portal/payments', icon: CreditCard },
  { name: 'Notifications', href: '/portal/notifications', icon: Bell },
  { name: 'Profile Settings', href: '/portal/settings', icon: Settings },
];

function PortalSidebarContent({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#12372A] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shadow-xl md:shadow-none border-r border-[#1a4a38]
      `}
    >
      <div className="p-6">
        {/* Logo & Header */}
        <div className="hidden md:flex items-center space-x-3 mb-8 pb-6 border-b border-[#1f4e3c]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2e8a60] to-[#12372A] flex items-center justify-center border border-[#a8d5b9]/40 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-[#a8d5b9]" />
          </div>
          <div>
            <Link href="/portal/dashboard" className="text-xl font-bold tracking-tight text-white hover:text-[#a8d5b9] transition-colors block">
              Amman Comm
            </Link>
            <p className="text-[11px] font-semibold tracking-wider text-[#a8d5b9] uppercase mt-0.5">
              Customer Portal
            </p>
          </div>
        </div>

        {/* Nav List */}
        <nav aria-label="Customer portal navigation" className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href));
            const badgeValue = item.name === 'Notifications' && unreadCount > 0 ? String(unreadCount) : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-white text-[#12372A] shadow-md font-semibold font-sans'
                    : 'text-white/80 hover:bg-[#1a4a38] hover:text-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-[#12372A]' : 'text-[#a8d5b9]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {badgeValue && (
                  <span
                    className={`
                      text-[11px] px-2 py-0.5 rounded-full font-bold transition-all
                      ${isActive
                        ? 'bg-[#12372A] text-white'
                        : 'bg-[#a8d5b9] text-[#12372A]'
                      }
                    `}
                  >
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-[#1f4e3c] bg-[#0f2d1e]">
        <div className="flex items-center justify-between p-2 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#a8d5b9]/20 text-[#a8d5b9] flex items-center justify-center font-bold border border-[#a8d5b9]/30">
              JD
            </div>
            <div className="truncate max-w-[120px]">
              <p className="text-xs font-semibold text-white truncate">John Doe</p>
              <p className="text-[11px] text-[#a8d5b9] truncate">john@example.com</p>
            </div>
          </div>
          <Link
            href="/login"
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#f8faf9] text-gray-900 flex flex-col md:flex-row font-sans">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between bg-[#12372A] px-4 py-3 text-white sticky top-0 z-50 border-b border-[#1f4e3c]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#a8d5b9]/20 flex items-center justify-center border border-[#a8d5b9]/40 text-[#a8d5b9]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-none">Amman Comm</span>
              <span className="text-[10px] text-[#a8d5b9] font-medium tracking-wide">CUSTOMER PORTAL</span>
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
        <main className="min-w-0 flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
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