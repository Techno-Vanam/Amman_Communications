'use client';

import React, { useEffect, useState } from 'react';
import { adminApiRequest } from '@/lib/api';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  HelpCircle,
  Loader2,
  Mail,
  Receipt,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';

interface BusinessProfileData {
  id: string | null;
  businessName: string;
  registrationNumber: string;
  officeAddress: string;
  primaryPhone: string;
  supportEmail: string;
  logoUrl: string | null;
}

interface FormErrors {
  businessName?: string;
  officeAddress?: string;
  primaryPhone?: string;
  supportEmail?: string;
}

export default function BusinessProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);

  const [profile, setProfile] = useState<BusinessProfileData>({
    id: null,
    businessName: '',
    registrationNumber: '',
    officeAddress: '',
    primaryPhone: '',
    supportEmail: '',
    logoUrl: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch business profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await adminApiRequest('/api/v1/admin/settings/business-profile');
        if (!res.success) {
          throw new Error(res.message || 'Failed to load business profile.');
        }
        const data = res.data;
        setProfile({
          id: data.id || null,
          businessName: data.businessName || '',
          registrationNumber: data.registrationNumber || '',
          officeAddress: data.officeAddress || '',
          primaryPhone: data.primaryPhone || '',
          supportEmail: data.supportEmail || '',
          logoUrl: data.logoUrl || null,
        });
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'An error occurred loading business profile.');
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!profile.businessName.trim()) {
      newErrors.businessName = 'Business Name is required';
    } else if (profile.businessName.trim().length < 2) {
      newErrors.businessName = 'Business Name must be at least 2 characters';
    }

    if (!profile.officeAddress.trim()) {
      newErrors.officeAddress = 'Office Address is required';
    } else if (profile.officeAddress.trim().length < 5) {
      newErrors.officeAddress = 'Office Address must be at least 5 characters';
    }

    const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
    if (!profile.primaryPhone.trim()) {
      newErrors.primaryPhone = 'Primary Phone is required';
    } else if (!phoneRegex.test(profile.primaryPhone.trim())) {
      newErrors.primaryPhone = 'Please enter a valid phone number (e.g. +91 9876543210)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.supportEmail.trim()) {
      newErrors.supportEmail = 'Support Email is required';
    } else if (!emailRegex.test(profile.supportEmail.trim())) {
      newErrors.supportEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const res = await adminApiRequest('/api/v1/admin/settings/business-profile', {
        method: 'PATCH',
        body: JSON.stringify({
          businessName: profile.businessName.trim(),
          registrationNumber: profile.registrationNumber.trim() || undefined,
          officeAddress: profile.officeAddress.trim(),
          primaryPhone: profile.primaryPhone.trim(),
          supportEmail: profile.supportEmail.trim().toLowerCase(),
        }),
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to update business profile');
      }

      const updated = res.data;
      setProfile((prev) => ({
        ...prev,
        ...updated,
      }));
      setSuccessMessage('Business profile updated successfully.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccessMessage(null);
    setErrorMessage(null);

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Invalid file type. Please upload a PNG, JPG, JPEG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum limit of 5MB.');
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await adminApiRequest('/api/v1/admin/settings/business-profile/logo', {
        method: 'POST',
        // Omit Content-Type to let the browser set it to multipart/form-data with boundary
        headers: { 'Content-Type': undefined as any },
        body: formData,
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to upload logo');
      }

      const updated = res.data;
      setProfile((prev) => ({
        ...prev,
        logoUrl: updated.logoUrl,
      }));
      setSuccessMessage('Business logo uploaded successfully.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Logo upload failed.');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleLogoRemove = async () => {
    if (!profile.logoUrl) return;

    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      setDeletingLogo(true);
      const res = await adminApiRequest('/api/v1/admin/settings/business-profile/logo', {
        method: 'DELETE',
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to remove logo');
      }

      setProfile((prev) => ({
        ...prev,
        logoUrl: null,
      }));
      setSuccessMessage('Business logo removed.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to remove logo.');
    } finally {
      setDeletingLogo(false);
    }
  };

  // Phase navigation tabs definition
  const settingsTabs = [
    { name: 'Business Profile', id: 'business-profile', active: true, icon: Building },
    { name: 'Working Hours', id: 'working-hours', active: false, icon: Clock },
    { name: 'Service Charges', id: 'service-charges', active: false, icon: Receipt },
    { name: 'Document Types', id: 'document-types', active: false, icon: FileText },
    { name: 'Application Statuses', id: 'application-statuses', active: false, icon: FileCheck },
    { name: 'Notification Templates', id: 'notification-templates', active: false, icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Manage business profile and system configurations.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto pb-px scrollbar-none">
        <nav className="flex gap-2 min-w-max">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={!tab.active}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  tab.active
                    ? 'bg-emerald-900 text-white shadow-sm'
                    : 'text-gray-400 bg-gray-100/70 cursor-not-allowed opacity-75'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {!tab.active && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Status Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form: Basic Information */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Official organization details displayed across communications and invoices.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="businessName"
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                    placeholder="e.g. Amman Communications"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.businessName
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-emerald-600 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-xs text-red-600 mt-1">{errors.businessName}</p>
                )}
              </div>

              {/* Registration Number */}
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Registration Number <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="registrationNumber"
                  type="text"
                  value={profile.registrationNumber}
                  onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                  placeholder="e.g. AC-2023-894"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Office Address */}
              <div>
                <label htmlFor="officeAddress" className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Office Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="officeAddress"
                    rows={3}
                    value={profile.officeAddress}
                    onChange={(e) => setProfile({ ...profile, officeAddress: e.target.value })}
                    placeholder="Enter complete office address..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.officeAddress
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-emerald-600 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {errors.officeAddress && (
                  <p className="text-xs text-red-600 mt-1">{errors.officeAddress}</p>
                )}
              </div>

              {/* Two Column Grid for Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Phone */}
                <div>
                  <label htmlFor="primaryPhone" className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Primary Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="primaryPhone"
                      type="text"
                      value={profile.primaryPhone}
                      onChange={(e) => setProfile({ ...profile, primaryPhone: e.target.value })}
                      placeholder="+91 9876543210"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.primaryPhone
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-emerald-600 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {errors.primaryPhone && (
                    <p className="text-xs text-red-600 mt-1">{errors.primaryPhone}</p>
                  )}
                </div>

                {/* Support Email */}
                <div>
                  <label htmlFor="supportEmail" className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Support Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="supportEmail"
                      type="email"
                      value={profile.supportEmail}
                      onChange={(e) => setProfile({ ...profile, supportEmail: e.target.value })}
                      placeholder="support@example.com"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.supportEmail
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-emerald-600 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {errors.supportEmail && (
                    <p className="text-xs text-red-600 mt-1">{errors.supportEmail}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold rounded-xl shadow-sm text-sm transition-all disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-emerald-200" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Area: Business Logo */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6 flex flex-col">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Business Logo</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Official logo displayed on portal branding and reports.
              </p>
            </div>

            {/* Logo Preview Container */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 text-center min-h-[200px]">
              {profile.logoUrl ? (
                <div className="space-y-3">
                  <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden bg-white p-2 border border-gray-200 shadow-sm flex items-center justify-center">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003'}${profile.logoUrl}`}
                      alt="Business Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="inline-block text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Active Logo
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Building className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">No logo uploaded</p>
                  <p className="text-xs text-gray-400">Upload a high resolution logo</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <label
                htmlFor="logo-upload-input"
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-sm ${
                  uploadingLogo ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {uploadingLogo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Uploading Logo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-emerald-200" />
                    <span>{profile.logoUrl ? 'Replace Logo' : 'Upload New'}</span>
                  </>
                )}
                <input
                  id="logo-upload-input"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {profile.logoUrl && (
                <button
                  type="button"
                  onClick={handleLogoRemove}
                  disabled={deletingLogo}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-sm transition-all border border-red-200 disabled:opacity-50"
                >
                  {deletingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Remove Logo</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Guidelines */}
            <div className="p-3.5 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Upload Guidelines</span>
              </div>
              <p>Formats: PNG, JPG, WebP</p>
              <p>Max file size: 5 MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
