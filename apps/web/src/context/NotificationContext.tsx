'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, MessageSquare } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time?: string;
  createdAt?: number;
  actionText: string;
  actionUrl: string;
  read: boolean;
  iconType: 'calendar-dark' | 'calendar-light' | 'document-red' | 'info-gray' | 'check-blue';
}

export function formatRelativeTime(createdAt?: number, fallbackTime?: string): string {
  if (!createdAt && !fallbackTime) return 'Just now';

  let timeMs = createdAt;
  if (!timeMs && fallbackTime) {
    const parsed = new Date(fallbackTime).getTime();
    if (!isNaN(parsed)) {
      timeMs = parsed;
    } else {
      return fallbackTime;
    }
  }

  if (!timeMs) return fallbackTime || 'Just now';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timeMs) / 1000));

  if (diffSeconds < 45) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} ${diffYears === 1 ? 'yr' : 'yrs'} ago`;
}

interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning';
  shareUrl?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toast?: ToastMessage | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification?: (id: string) => void;
  clearAllNotifications?: () => void;
  loadMore: () => void;
  showToast: (
    title: string,
    message?: string,
    type?: 'success' | 'info' | 'warning',
    actionText?: string,
    actionUrl?: string,
    shouldCreateNotification?: boolean,
    shareUrl?: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

import { useUser, getUserStorageKey } from './UserContext';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { whatsappAlerts, t } = useLanguage();
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

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      const storageKey = getUserStorageKey(user.email, 'amman_user_notifications');
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getFormattedActualDateTime = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${timeStr}, ${dateStr}`;
  };

  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'info' | 'warning' = 'success',
    actionText: string = 'View Details',
    actionUrl: string = '/portal/dashboard',
    shouldCreateNotification: boolean = false,
    shareUrl?: string
  ) => {
    const id = Date.now().toString();
    setToast({ id, title, message, type, shareUrl });

    if (shouldCreateNotification) {
      // Automatically push a real notification item into user's notification list with actual timestamp & formatted time
      const nowMs = Date.now();
      const newNotif: NotificationItem = {
        id,
        title,
        message: message || '',
        time: getFormattedActualDateTime(),
        createdAt: nowMs,
        actionText,
        actionUrl,
        read: false,
        iconType: type === 'warning' ? 'document-red' : type === 'info' ? 'info-gray' : 'check-blue',
      };
      saveNotifications([newNotif, ...notifications]);
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const loadMore = () => {};

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        loadMore,
        showToast,
      }}
    >
      {children}

      {toast && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center space-y-5 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setToast(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Check Icon */}
            <div className="w-16 h-16 rounded-full bg-[#12372A] mx-auto flex items-center justify-center shadow-lg shadow-[#12372A]/20">
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

            {/* Action Buttons: Share to Admin & Continue */}
            <div className="relative z-10 pt-2 space-y-2.5">
              {whatsappAlerts && (toast.shareUrl || toast.title.toLowerCase().includes('appointment') || (toast.message && (toast.message.includes('APT-') || toast.message.includes('scheduled')))) && (
                <a
                  href={
                    toast.shareUrl ||
                    `https://wa.me/919360645466?text=${encodeURIComponent(
                      `*New Appointment Booked - Amman Communications*\n\n📌 *Details:* ${toast.message || toast.title}\n\nPlease review and confirm this booking. Thank you!`
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>{t('btn.shareWhatsApp')}</span>
                </a>
              )}

              <button
                type="button"
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
