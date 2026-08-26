'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  FileText,
  Info,
  CheckCircle2,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { useNotifications, NotificationItem } from '@/context/NotificationContext';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Read'>('All');
  const { notifications, unreadCount, markAsRead, markAllAsRead, loadMore, showToast } = useNotifications();

  // Filtered notifications based on activeTab
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'Unread') return !item.read;
    if (activeTab === 'Read') return item.read;
    return true;
  });

  const renderIcon = (type: NotificationItem['iconType']) => {
    switch (type) {
      case 'calendar-dark':
        return (
          <div className="w-10 h-10 rounded-full bg-[#1c3a63] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 text-white" />
          </div>
        );
      case 'calendar-light':
        return (
          <div className="w-10 h-10 rounded-full bg-[#dce9f7] text-[#1c3a63] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#1c3a63]" />
          </div>
        );
      case 'document-red':
        return (
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-rose-600" />
          </div>
        );
      case 'info-gray':
        return (
          <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
        );
      case 'check-blue':
        return (
          <div className="w-10 h-10 rounded-full bg-[#dce9f7] text-[#1c3a63] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#1c3a63]" />
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 font-sans pb-12">
      {/* Top Title & Mark All as Read */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-sm font-medium text-gray-600 tracking-tight">
          All your notifications and alerts
        </h1>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f0f5fa] border border-[#dce9f7] hover:bg-[#dce9f7] text-[#1c3a63] font-bold text-xs rounded-xl transition-all shadow-2xs self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-[#1c3a63]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {/* Tab Navigation Header (All | Unread | Read) */}
        <div className="px-6 border-b border-gray-200/80 flex items-center space-x-8 text-xs font-semibold">
          {(['All', 'Unread', 'Read'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'border-[#1c3a63] text-[#1c3a63] font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>{tab}</span>
              {tab === 'Unread' && unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="divide-y divide-gray-100">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              No {activeTab.toLowerCase()} notifications found.
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-6 flex items-start justify-between gap-4 transition-all ${
                  !notif.read ? 'bg-[#f4f8fc]/80 border-l-4 border-l-[#1c3a63]' : 'bg-white hover:bg-gray-50/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  {renderIcon(notif.iconType)}

                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {notif.message}
                    </p>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <Link
                        href={notif.actionUrl}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1c3a63] hover:underline"
                      >
                        <span>{notif.actionText}</span>
                      </Link>

                      {/* Individual "Mark as Read" Option for Unread Notifications */}
                      {!notif.read && (
                        <button
                          onClick={() => {
                            markAsRead(notif.id);
                            showToast('Notification Marked as Read!', 'Unread count updated.');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#1c3a63] transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark as Read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-medium text-gray-400 whitespace-nowrap pt-0.5 shrink-0">
                  {notif.time}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        <div className="p-6 border-t border-gray-100 flex justify-center bg-white">
          <button
            onClick={loadMore}
            className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition-all shadow-2xs"
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}
