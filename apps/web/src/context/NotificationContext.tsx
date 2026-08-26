'use client';

import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  actionText: string;
  actionUrl: string;
  read: boolean;
  iconType: 'calendar-dark' | 'calendar-light' | 'document-red' | 'info-gray' | 'check-blue';
}

interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Appointment Confirmed',
    message: 'Your appointment on 22 May 2026 is confirmed.',
    time: '1 min ago',
    actionText: 'View',
    actionUrl: '/portal/appointments',
    read: false,
    iconType: 'calendar-dark'
  },
  {
    id: 'n2',
    title: 'Appointment Rescheduled',
    message: 'Your appointment on 25 May 2026 is rescheduled.',
    time: '2 hours ago',
    actionText: 'View',
    actionUrl: '/portal/appointments',
    read: false,
    iconType: 'calendar-light'
  },
  {
    id: 'n3',
    title: 'Documents Re-upload Required',
    message: 'EC Certificate image is blurred. Please re-upload.',
    time: '1 day ago',
    actionText: 'View',
    actionUrl: '/portal/documents',
    read: true,
    iconType: 'document-red'
  },
  {
    id: 'n4',
    title: 'Application Status Updated',
    message: 'Application AMC-2026-000001 status changed to "Verification".',
    time: '2 days ago',
    actionText: 'View',
    actionUrl: '/portal/applications',
    read: true,
    iconType: 'info-gray'
  },
  {
    id: 'n5',
    title: 'Payment Successful',
    message: 'Payment of ₹ 1,200 received for AMC-2026-000002.',
    time: '3 days ago',
    actionText: 'View Receipt',
    actionUrl: '/portal/payments',
    read: true,
    iconType: 'check-blue'
  }
];

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  loadMore: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, title, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Marked as Read', 'All notifications are now marked as read.');
  };

  const loadMore = () => {
    const moreItems: NotificationItem[] = [
      {
        id: `n-${Date.now()}-1`,
        title: 'Passbook Verification Approved',
        message: 'Your bank passbook details have been verified successfully.',
        time: '4 days ago',
        actionText: 'View Details',
        actionUrl: '/portal/documents',
        read: true,
        iconType: 'check-blue'
      },
      {
        id: `n-${Date.now()}-2`,
        title: 'New Service Request Submitted',
        message: 'Your Patta Transfer application was registered under AMC-2026-000008.',
        time: '5 days ago',
        actionText: 'View',
        actionUrl: '/portal/applications',
        read: true,
        iconType: 'info-gray'
      }
    ];
    setNotifications((prev) => [...prev, ...moreItems]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, loadMore, showToast }}
    >
      {children}

      {/* Floating Success Toast Notification Pop-up */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-md w-full bg-[#12372A] text-white p-4 rounded-2xl shadow-2xl border border-[#a8d5b9]/40 flex items-start justify-between gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#a8d5b9]/20 text-[#a8d5b9] flex items-center justify-center shrink-0 border border-[#a8d5b9]/30">
              <CheckCircle2 className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{toast.title}</h4>
              {toast.message && <p className="text-xs text-[#a8d5b9] mt-0.5">{toast.message}</p>}
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 text-white/60 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
