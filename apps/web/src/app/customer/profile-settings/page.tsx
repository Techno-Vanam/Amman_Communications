'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function ProfileSettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Contact Info state
  const [altContactName, setAltContactName] = useState('');
  const [altPhoneNumber, setAltPhoneNumber] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('EMAIL');

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiRequest('/api/v1/customer/profile');

        if (res.success && res.data) {
          const data = res.data;
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
          if (data.phone) setContactNumber(data.phone); // Assuming phone instead of contactNumber
          if (data.address) setAddress(data.address);
        }
      } catch (err) {
        console.error('Failed to load profile settings', err);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await apiRequest('/api/v1/customer/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, phone: contactNumber, address }),
      });

      if (!res.success) throw new Error(res.message || 'Failed to update personal details');
      setMessage({ type: 'success', text: 'Personal details updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setSaving(true);

    try {
      const res = await apiRequest('/api/v1/customer/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });

      if (!res.success) throw new Error(res.message || 'Password change failed. Please check current password.');
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await apiRequest('/api/v1/customer/contact-info', {
        method: 'PATCH',
        body: JSON.stringify({ altContactName, altPhoneNumber, preferredContactMethod }),
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to update contact info');
      }

      setMessage({ type: 'success', text: 'Contact info updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await apiRequest('/api/v1/customer/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ emailNotifications, smsAlerts, whatsappUpdates }),
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to update preferences');
      }

      setMessage({ type: 'success', text: 'Preferences updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Profile Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
            {name ? name.substring(0, 2).toUpperCase() : 'CU'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{name || 'Customer Account'}</h2>
            <p className="text-sm text-slate-500">{email || 'customer@example.com'}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-500 mb-6 overflow-x-auto">
          {[
            { id: 'details', label: 'Personal Details' },
            { id: 'password', label: 'Change Password' },
            { id: 'contact', label: 'Contact Information' },
            { id: 'preferences', label: 'Preferences' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage(null);
              }}
              className={`pb-3 whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl p-4 text-sm font-medium ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tab 1: Personal Details */}
        {activeTab === 'details' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  placeholder="+962 79XXXXXXX"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  placeholder="Amman, Jordan"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Personal Details'}
            </button>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        )}

        {/* Tab 3: Contact Info */}
        {activeTab === 'contact' && (
          <form onSubmit={handleUpdateContactInfo} className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Alternate Contact Name</label>
              <input
                type="text"
                placeholder="Secondary contact person"
                value={altContactName}
                onChange={(e) => setAltContactName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Alternate Phone Number</label>
              <input
                type="tel"
                placeholder="+962 79XXXXXXX"
                value={altPhoneNumber}
                onChange={(e) => setAltPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Contact Method</label>
              <select
                value={preferredContactMethod}
                onChange={(e) => setPreferredContactMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="EMAIL">Email</option>
                <option value="PHONE">Phone Call</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Contact Info'}
            </button>
          </form>
        )}

        {/* Tab 4: Preferences */}
        {activeTab === 'preferences' && (
          <form onSubmit={handleUpdatePreferences} className="space-y-6 max-w-lg">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-slate-700 font-medium">Receive Email Notifications</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-slate-700 font-medium">Receive SMS Alerts</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-slate-700 font-medium">Receive WhatsApp Updates</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Preferences'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
