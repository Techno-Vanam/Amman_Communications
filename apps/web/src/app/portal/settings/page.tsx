'use client';

import React, { useState } from 'react';
import {
  Bell,
  Shield,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import CustomSelect from '@/components/ui/CustomSelect';

import { changePasswordAction } from '@/app/portal/actions';

export default function SettingsPage() {
  const { showToast } = useNotifications();
  const [saved, setSaved] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  // Security Form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification Preferences
  const [notificationsForm, setNotificationsForm] = useState({
    emailAlerts: true,
    smsAlerts: fontSmsDefault(true),
    whatsappAlerts: true,
    weeklyDigest: false
  });

  // Portal Preferences
  const [portalForm, setPortalForm] = useState({
    language: 'English',
    timezone: 'Asia/Kolkata (IST +5:30)',
    autoLogout: '30 minutes'
  });

  function fontSmsDefault(val: boolean) {
    return val;
  }

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!securityForm.currentPassword) {
      showToast('Validation Error', 'Please enter your current password.');
      return;
    }
    if (!securityForm.newPassword || securityForm.newPassword.length < 8) {
      showToast('Validation Error', 'New password must be at least 8 characters long.');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast('Validation Error', 'New password and confirmation do not match.');
      return;
    }

    setLoadingSecurity(true);
    const res = await changePasswordAction({
      currentPassword: securityForm.currentPassword,
      newPassword: securityForm.newPassword,
      confirmNewPassword: securityForm.confirmPassword,
    });
    setLoadingSecurity(false);

    if (res.error) {
      showToast('Password Update Failed', res.error);
      return;
    }

    setSaved(true);
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    showToast('Password Changed!', 'Your login password has been updated in the database.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    showToast('Portal Preferences Saved!', 'Your notification and language preferences have been updated.');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6 font-sans pb-12">
      {/* Save Toast Notification */}
      {saved && (
        <div className="bg-[#e6f4ea] border border-[#a8d5b9] text-[#137333] p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#137333]" />
          <span>Settings updated successfully!</span>
        </div>
      )}

      {/* SECTION 1: Account Security & Password */}
      <form onSubmit={handleSaveSecurity} className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1c3a63]" />
            <h2 className="text-lg font-bold text-gray-900">Security &amp; Password</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Update your login password to keep your account secure.
          </p>
          <div className="mt-4 border-b border-gray-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={securityForm.currentPassword}
              onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={securityForm.newPassword}
              onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={securityForm.confirmPassword}
              onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loadingSecurity}
            className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{loadingSecurity ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </div>
      </form>

      {/* SECTION 2: Notification & Portal System Preferences */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1c3a63]" />
            <h2 className="text-lg font-bold text-gray-900">Notification Alerts &amp; Portal Preferences</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Control which notification channels stay active and set language defaults.
          </p>
          <div className="mt-4 border-b border-gray-100" />
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900">Email Notifications</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Receive application receipts &amp; status emails.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsForm.emailAlerts}
                onChange={(e) => setNotificationsForm({ ...notificationsForm, emailAlerts: e.target.checked })}
                className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900">SMS Reminders</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Receive appointment reminders via SMS.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsForm.smsAlerts}
                onChange={(e) => setNotificationsForm({ ...notificationsForm, smsAlerts: e.target.checked })}
                className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900">WhatsApp Alerts</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Receive direct status updates on WhatsApp.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsForm.whatsappAlerts}
                onChange={(e) => setNotificationsForm({ ...notificationsForm, whatsappAlerts: e.target.checked })}
                className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900">Weekly Activity Summary</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Receive a weekly digest report of active requests.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsForm.weeklyDigest}
                onChange={(e) => setNotificationsForm({ ...notificationsForm, weeklyDigest: e.target.checked })}
                className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700">Preferred Portal Language</label>
              <CustomSelect
                value={portalForm.language}
                onChange={(val) => setPortalForm({ ...portalForm, language: val })}
                options={[
                  { value: 'English', label: 'English' },
                  { value: 'Tamil', label: 'Tamil (தமிழ்)' },
                  { value: 'Hindi', label: 'Hindi (हिंदी)' }
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700">Timezone</label>
              <input
                type="text"
                disabled
                value={portalForm.timezone}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-500 bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700">Auto Logout Inactivity</label>
              <CustomSelect
                value={portalForm.autoLogout}
                onChange={(val) => setPortalForm({ ...portalForm, autoLogout: val })}
                options={['15 minutes', '30 minutes', '1 hour']}
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
