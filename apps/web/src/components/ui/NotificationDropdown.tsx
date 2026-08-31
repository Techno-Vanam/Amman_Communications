'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle, Info, AlertTriangle, X, Check } from 'lucide-react';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  href: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'success',
    title: 'Payment Received',
    message: 'Invoice #INV-492 was successfully paid by Sarah Jenkins.',
    time: 'Just now',
    read: false,
    href: '/admin/finance',
  },
  {
    id: '2',
    type: 'info',
    title: 'New Application',
    message: 'A new broadband application has been submitted for review.',
    time: '2 hours ago',
    read: false,
    href: '/admin/applications',
  },
  {
    id: '3',
    type: 'warning',
    title: 'High Bandwidth Usage',
    message: 'Node Alpha-7 is nearing capacity. Consider re-routing traffic.',
    time: '5 hours ago',
    read: true,
    href: '/admin/reports',
  },
  {
    id: '4',
    type: 'error',
    title: 'Device Offline',
    message: 'Router SN-9284 in Sector 4 has gone offline unexpectedly.',
    time: '1 day ago',
    read: true,
    href: '/admin/services',
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    // Close dropdown then navigate
    setIsOpen(false);
    router.push(notification.href);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'info':    return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':   return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-100';
      case 'info':    return 'bg-blue-50 border-blue-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'error':   return 'bg-rose-50 border-rose-100';
      default:        return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all shadow-xs relative
          ${isOpen
            ? 'bg-[#f0f7f2] border-[#a8d5b9] text-[#12372A]'
            : 'bg-white border-gray-200/90 text-gray-600 hover:text-[#12372A] hover:bg-gray-50 hover:border-gray-300'
          }`}
        title="Notifications"
      >
        <Bell className={`w-4 h-4 sm:w-6 sm:h-6 transition-transform duration-300 ${isOpen ? 'rotate-12' : ''}`} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex h-2.5 w-2.5 sm:h-3 sm:w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-white">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100/50 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-4 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 text-lg tracking-tight">Notifications</h3>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                You have {unreadCount} unread messages
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-[#12372A] hover:text-[#1f4e3c] bg-[#a8d5b9]/20 hover:bg-[#a8d5b9]/40 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-900 font-semibold text-sm">All caught up!</p>
                <p className="text-gray-500 text-xs mt-1">No new notifications right now.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                    className={`group relative flex items-start gap-4 p-4 border-b border-gray-50 last:border-0 transition-all cursor-pointer hover:bg-gray-50/80
                      ${!notification.read ? 'bg-white' : 'bg-gray-50/30 opacity-75'}`}
                  >
                    {/* Unread left-bar indicator */}
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#12372A] rounded-r-md"></div>
                    )}

                    {/* Icon */}
                    <div className={`mt-0.5 shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getBgColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm truncate pr-2 ${!notification.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                          {notification.time}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${!notification.read ? 'text-gray-600' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      {/* Subtle redirect hint */}
                      <p className="text-[10px] font-semibold text-[#12372A]/50 mt-1.5 group-hover:text-[#12372A] transition-colors">
                        Click to view →
                      </p>
                    </div>

                    {/* Delete Button (appears on hover) */}
                    <button
                      onClick={(e) => removeNotification(notification.id, e)}
                      className="absolute right-4 top-4 p-1.5 rounded-full text-gray-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                      title="Dismiss notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-white text-center">
              <button
                onClick={() => { setIsOpen(false); router.push('/admin/reports'); }}
                className="text-xs font-bold text-gray-600 hover:text-[#12372A] transition-colors py-1"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
