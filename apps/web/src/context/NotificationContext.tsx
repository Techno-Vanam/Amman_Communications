'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';

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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  loadMore: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

import { useUser, getUserStorageKey } from './UserContext';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  React.useEffect(() => {
    try {
      const storageKey = getUserStorageKey(user.email, 'amman_user_notifications');
      const saved = localStorage.getItem(storageKey);
      setNotifications(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error('Error loading notifications:', e);
      setNotifications([]);
    }
  }, [user.email]);

  const saveNotificationsToStorage = (items: NotificationItem[]) => {
    try {
      const storageKey = getUserStorageKey(user.email, 'amman_user_notifications');
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, title, message, type });

    // Automatically push a real notification item into user's notification list
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      title,
      message: message || title,
      time: 'Just now',
      actionText: 'View Details',
      actionUrl: '/portal/dashboard',
      read: false,
      iconType: type === 'warning' ? 'document-red' : 'check-blue'
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      saveNotificationsToStorage(updated);
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotificationsToStorage(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotificationsToStorage(updated);
      return updated;
    });
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, loadMore, showToast }}
    >
      {children}

      {/* Centered Modal Success Notification Pop-up with Full Dim Overlay */}
      {mounted && toast && createPortal(
        <div
          onClick={() => setToast(null)}
          className="fixed inset-0 z-[999999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] shadow-2xl border border-gray-200/90 ring-1 ring-black/5 max-w-sm w-full p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-200 space-y-4"
          >
            {/* Soft Green Pattern Header Overlay */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#f0f7f2] via-[#f7faf8] to-transparent pointer-events-none" />

            {/* Dismiss X Button */}
            <button
              onClick={() => setToast(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100/80 transition-colors z-20"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Dark Green Checkmark Circle Badge */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-[#12372A] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#12372A]/20 border-4 border-white ring-4 ring-[#f0f7f2] my-2">
              <Check className="w-10 h-10 stroke-[3] text-[#a8d5b9]" />
            </div>

            {/* Content Text (Emoji removed) */}
            <div className="relative z-10 space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {toast.title}
              </h3>
              {toast.message && (
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                  {toast.message}
                </p>
              )}
            </div>

            {/* Action Continue Button */}
            <div className="relative z-10 pt-2">
              <button
                onClick={() => setToast(null)}
                className="w-full py-3 px-6 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#12372A]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>,
        document.body
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
