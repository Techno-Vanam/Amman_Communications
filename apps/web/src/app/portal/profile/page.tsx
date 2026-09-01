'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Smartphone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useUser } from '@/context/UserContext';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import { fetchProfileAction, updateProfileAction } from '@/app/portal/actions';

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useNotifications();
  const { user, updateUser } = useUser();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user.name || '',
    mobileNumber: user.phone || '+91 ',
    emailAddress: user.email || '',
    residentialAddress: user.address || '',
    dob: user.dob || '',
    aadhaarNumber: user.aadhaarNumber || '',
    panNumber: user.panNumber || '',
    occupation: user.occupation || '',
    altPhone: user.altPhone || '+91 ',
    emergencyContact: user.emergencyContact || ''
  });

  // Sync state if user changes
  useEffect(() => {
    setProfileData({
      fullName: user.name || '',
      mobileNumber: user.phone || '+91 ',
      emailAddress: user.email || '',
      residentialAddress: user.address || '',
      dob: user.dob || '',
      aadhaarNumber: user.aadhaarNumber || '',
      panNumber: user.panNumber || '',
      occupation: user.occupation || '',
      altPhone: user.altPhone || '+91 ',
      emergencyContact: user.emergencyContact || ''
    });
  }, [user]);

  // Load profile from database on mount
  useEffect(() => {
    async function loadProfile() {
      const dbProfile = await fetchProfileAction();
      if (dbProfile) {
        updateUser({
          name: dbProfile.name,
          email: dbProfile.email,
          phone: dbProfile.phone || dbProfile.contactNumber || '+91 ',
          address: dbProfile.address || '',
          dob: dbProfile.dob || '',
          aadhaarNumber: dbProfile.aadhaarNumber || '',
          panNumber: dbProfile.panNumber || '',
          occupation: dbProfile.occupation || '',
          altPhone: dbProfile.altPhone || '+91 ',
          emergencyContact: dbProfile.emergencyContact || '',
          isProfileCompleted: dbProfile.isProfileCompleted ?? false
        });
        setProfileData({
          fullName: dbProfile.name || '',
          mobileNumber: dbProfile.phone || dbProfile.contactNumber || '+91 ',
          emailAddress: dbProfile.email || '',
          residentialAddress: dbProfile.address || '',
          dob: dbProfile.dob || '',
          aadhaarNumber: dbProfile.aadhaarNumber || '',
          panNumber: dbProfile.panNumber || '',
          occupation: dbProfile.occupation || '',
          altPhone: dbProfile.altPhone || '+91 ',
          emergencyContact: dbProfile.emergencyContact || ''
        });
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validations for mandatory fields
    if (!profileData.fullName.trim()) {
      showToast('Validation Error', 'Full Name is mandatory.');
      return;
    }
    const cleanMobile = profileData.mobileNumber.replace('+91', '').trim();
    if (!cleanMobile) {
      showToast('Validation Error', 'Mobile Phone Number is mandatory.');
      return;
    }
    if (!profileData.emailAddress.trim()) {
      showToast('Validation Error', 'Email Address is mandatory.');
      return;
    }
    if (!profileData.residentialAddress.trim()) {
      showToast('Validation Error', 'Residential Address is mandatory.');
      return;
    }
    if (!profileData.aadhaarNumber.trim()) {
      showToast('Validation Error', 'Aadhaar Number is mandatory.');
      return;
    }
    if (!profileData.emergencyContact.trim()) {
      showToast('Validation Error', 'Emergency Contact Person is mandatory.');
      return;
    }
    const cleanAltPhone = profileData.altPhone.replace('+91', '').trim();
    if (!cleanAltPhone) {
      showToast('Validation Error', 'Alternate Phone Number is mandatory.');
      return;
    }

    setSaving(true);
    const wasIncomplete = !user.isProfileCompleted;
    
    // Save to PostgreSQL database
    const res = await updateProfileAction({
      name: profileData.fullName,
      email: profileData.emailAddress,
      contactNumber: profileData.mobileNumber,
      address: profileData.residentialAddress,
      dob: profileData.dob,
      aadhaarNumber: profileData.aadhaarNumber,
      panNumber: profileData.panNumber,
      occupation: profileData.occupation,
      altPhone: profileData.altPhone,
      emergencyContact: profileData.emergencyContact,
      isProfileCompleted: true
    });
    setSaving(false);

    if (res.error) {
      showToast('Error', res.error);
      return;
    }

    // Save to context
    updateUser({
      name: profileData.fullName,
      email: profileData.emailAddress,
      phone: profileData.mobileNumber,
      address: profileData.residentialAddress,
      dob: profileData.dob,
      aadhaarNumber: profileData.aadhaarNumber,
      panNumber: profileData.panNumber,
      occupation: profileData.occupation,
      altPhone: profileData.altPhone,
      emergencyContact: profileData.emergencyContact,
      isProfileCompleted: true
    });

    setSaved(true);

    if (wasIncomplete) {
      showToast('Profile Setup Complete!', 'Your profile has been saved to the database. Unlocking full portal access...');
      setTimeout(() => {
        router.push('/portal/dashboard');
      }, 1200);
    } else {
      showToast('Profile Saved!', 'Your personal profile information has been updated in the database.');
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6 font-sans pb-12">
      {/* First-time Profile Setup Onboarding Banner */}
      {!user.isProfileCompleted && (
        <div className="max-w-4xl mx-auto w-full bg-gradient-to-r from-[#12372A] to-[#1f5c46] text-white p-5 md:p-6 rounded-3xl shadow-md flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#a8d5b9]" />
          </div>
          <div>
            <h3 className="font-extrabold text-base md:text-lg tracking-tight">
              Welcome to Amman Communications! Complete Your Profile Setup
            </h3>
            <p className="mt-1 text-xs md:text-sm text-[#d1e7dd] leading-relaxed">
              Please enter and save your official contact information, address, Aadhaar number, and emergency contact details below to complete registration and unlock all portal services.
            </p>
          </div>
        </div>
      )}

      {/* Save Toast Notification */}
      {saved && (
        <div className="max-w-4xl mx-auto w-full bg-[#e6f4ea] border border-[#a8d5b9] text-[#137333] p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#137333]" />
          <span>Profile changes saved to database successfully!</span>
        </div>
      )}

      {/* Centered Personal Information Form Card */}
      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 md:p-10 shadow-2xs space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1c3a63] flex items-center justify-center border border-blue-100 shadow-xs">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter and update your official personal information and contact credentials.
                </p>
              </div>
            </div>
            <div className="mt-5 border-b border-gray-100" />
          </div>

          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Mobile Phone Number *</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={profileData.mobileNumber}
                    onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={profileData.emailAddress}
                    onChange={(e) => setProfileData({ ...profileData, emailAddress: e.target.value })}
                    placeholder="your.email@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Date of Birth</label>
                <CustomDatePicker
                  value={profileData.dob}
                  onChange={(val) => setProfileData({ ...profileData, dob: val })}
                  disableFuture
                />
              </div>
            </div>

            {/* Residential Address */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700">Residential Address *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={profileData.residentialAddress}
                  onChange={(e) => setProfileData({ ...profileData, residentialAddress: e.target.value })}
                  placeholder="Enter house no, street, city & pincode"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                  required
                />
              </div>
            </div>

            {/* Government ID References */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 mb-3">Government Identity References</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Aadhaar Number - Mandatory */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Aadhaar Number *</label>
                  <input
                    type="text"
                    value={profileData.aadhaarNumber}
                    onChange={(e) => setProfileData({ ...profileData, aadhaarNumber: e.target.value })}
                    placeholder="Enter 12-digit Aadhaar number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    required
                  />
                </div>

                {/* PAN Card Number - Optional */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">
                    PAN Card Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.panNumber}
                    onChange={(e) => setProfileData({ ...profileData, panNumber: e.target.value })}
                    placeholder="Enter 10-char PAN (e.g. ABCDE1234F)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Details: Left side = Person Name, Right side = Phone Number */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 mb-3">Emergency Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left side: Emergency Contact Person Name (Mandatory) */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Emergency Contact Person *</label>
                  <input
                    type="text"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    placeholder="Name & relation (e.g. Bala - Brother)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    required
                  />
                </div>

                {/* Right side: Alternate Phone Number (Mandatory) */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Alternate Phone Number *</label>
                  <input
                    type="tel"
                    value={profileData.altPhone}
                    onChange={(e) => setProfileData({ ...profileData, altPhone: e.target.value })}
                    placeholder="+91 9874563210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving to Database...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
