'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Home,
  Car,
  CreditCard,
  Fingerprint,
  FileText,
  Scale,
  MoreHorizontal,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Upload,
  FileCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  Building,
  Info,
  Trash2,
  Video,
  Globe
} from 'lucide-react';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomSelect from '@/components/ui/CustomSelect';

const SERVICES = [
  { id: 'passport', name: 'Passport Renewal', icon: BookOpen },
  { id: 'property', name: 'Property Registration', icon: Home },
  { id: 'dl', name: 'Driving License', icon: Car },
  { id: 'pan', name: 'PAN Card', icon: CreditCard },
  { id: 'aadhaar', name: 'Aadhaar Update', icon: Fingerprint },
  { id: 'ec_patta', name: 'EC / Patta / Chitta', icon: FileText },
  { id: 'legal', name: 'Legal & Affidavit', icon: Scale },
  { id: 'other', name: 'Other Services', icon: MoreHorizontal },
];

const STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Documents (Optional)' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Success' },
];

import { useNotifications } from '@/context/NotificationContext';
import { useUser, getUserStorageKey } from '@/context/UserContext';

export default function BookAppointmentPage() {
  const { showToast } = useNotifications();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('property');

  // Form State
  const [details, setDetails] = useState({
    mainMode: 'Office Visit' as 'Office Visit' | 'Online Consultation',
    onlineSubMode: 'Phone Call' as 'Phone Call' | 'WhatsApp' | 'Video Call',
    videoPlatform: 'Google Meet' as 'Google Meet' | 'Zoom' | 'Microsoft Teams',
    whatsappNumber: user.phone || '+91 ',
    phoneCallNumber: user.phone || '+91 ',
    whatsappOption: 'WhatsApp Voice Call' as 'WhatsApp Voice Call' | 'WhatsApp Video Call' | 'WhatsApp Text Chat',
    date: '2026-08-28',
    timeSlot: '10:30 AM',
    location: 'Main Branch - Amman Comm HQ',
    applicantName: user.name,
    applicantEmail: user.email,
    applicantPhone: user.phone || '+91 ',
    address: user.address,
    description: ''
  });

  React.useEffect(() => {
    setDetails((prev) => ({
      ...prev,
      applicantName: user.name,
      applicantEmail: user.email,
      applicantPhone: user.phone || '+91 ',
      address: user.address,
      whatsappNumber: user.phone || prev.whatsappNumber || '+91 ',
      phoneCallNumber: user.phone || prev.phoneCallNumber || '+91 '
    }));
  }, [user]);

  const getFormattedConsultationType = () => {
    if (details.mainMode === 'Office Visit') {
      return 'Office Visit';
    }
    if (details.onlineSubMode === 'Phone Call') {
      return `Online Consultation (Phone Call - ${details.phoneCallNumber})`;
    }
    if (details.onlineSubMode === 'WhatsApp') {
      return `Online Consultation (WhatsApp - ${details.whatsappNumber})`;
    }
    return `Online Consultation (Video Call via ${details.videoPlatform})`;
  };

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const serviceObj = SERVICES.find((s) => s.id === selectedService) || SERVICES[1];

  const handleNext = () => {
    if (currentStep === 4) {
      const aptId = `APT-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newApt = {
        id: aptId,
        originalDateTime: `${details.date} ${details.timeSlot}`,
        newDateTime: '-',
        serviceType: serviceObj.name,
        consultationType: getFormattedConsultationType(),
        status: 'Confirmed' as const,
        reasonAdminNote: 'Booking Confirmed',
        adminNote: 'Your appointment has been scheduled. Officer assigned.',
        location: details.location
      };
      try {
        const storageKey = getUserStorageKey(user.email, 'amman_user_appointments');
        const saved = localStorage.getItem(storageKey);
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem(storageKey, JSON.stringify([newApt, ...existing]));
      } catch (e) {
        console.error('Error saving appointment:', e);
      }
      showToast('Appointment Booked Successfully!', `Reference ID: ${aptId} has been scheduled.`);
    }
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles([...uploadedFiles, e.target.files[0].name]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8 font-sans pb-12">
      {/* 5-Step Stepper Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 overflow-hidden">
        <div className="flex items-center justify-between max-w-5xl mx-auto relative px-5">
          {/* Background Track Line (Center of Step 1 to Center of Step 5) */}
          <div className="absolute top-[18px] left-[40px] right-[40px] h-1 bg-gray-200 z-0 rounded-full" />

          {/* Animated Active Progress Line */}
          <div
            className="absolute top-[18px] left-[40px] h-1 bg-gradient-to-r from-[#12372A] via-[#1b4d3a] to-[#2d6a4f] z-0 rounded-full transition-all duration-700 ease-in-out shadow-sm"
            style={{
              width: `calc((100% - 80px) * ${ (currentStep - 1) / (STEPS.length - 1) })`
            }}
          />

          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = step.id < currentStep;

            return (
              <div
                key={step.id}
                onClick={() => isClickable && setCurrentStep(step.id)}
                className={`relative z-10 flex flex-col items-center group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all duration-300 transform
                    ${isCompleted || isCurrent
                      ? 'bg-[#12372A] text-white border-2 border-[#12372A] shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-300 shadow-xs'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-[#a8d5b9] stroke-[3]" />
                  ) : (
                    <span className={`font-extrabold ${isCurrent || isCompleted ? 'text-white' : 'text-gray-800'}`}>
                      {step.id}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs transition-all duration-300 tracking-wide whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#12372A] font-bold scale-105'
                      : isCompleted
                      ? 'text-gray-800 font-semibold'
                      : 'text-gray-600 font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-8">
        {/* STEP 1: Select Service */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 1: Select Service</h2>
              <p className="text-xs text-gray-500 mt-1">
                Choose the primary service you require an appointment for.
              </p>
            </div>

            {/* 8 Grid Service Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SERVICES.map((srv) => {
                const Icon = srv.icon;
                const isSelected = selectedService === srv.id;

                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedService(srv.id)}
                    className={`
                      p-6 rounded-2xl border text-center flex flex-col items-center justify-center space-y-3 transition-all duration-200 group relative
                      ${isSelected
                        ? 'border-[#12372A] bg-[#f0f7f2] ring-2 ring-[#12372A]/20 shadow-sm'
                        : 'border-gray-200 hover:border-[#12372A]/50 bg-white hover:bg-gray-50/50'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#12372A] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#a8d5b9]" />
                      </div>
                    )}
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                        ${isSelected
                          ? 'bg-[#12372A] text-white'
                          : 'bg-blue-50 text-blue-600 group-hover:bg-[#12372A]/10 group-hover:text-[#12372A]'
                        }
                      `}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#12372A]' : 'text-gray-800'}`}>
                      {srv.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 2: Appointment Details</h2>
              <p className="text-xs text-gray-500 mt-1">
                Selected Service: <strong className="text-[#12372A]">{serviceObj.name}</strong>. Choose consultation type and schedule.
              </p>
            </div>

            {/* Top Level: Main Consultation Type Options (Office Visit vs Online Consultation) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Select Consultation Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Office Visit */}
                <button
                  type="button"
                  onClick={() => setDetails({ ...details, mainMode: 'Office Visit' })}
                  className={`p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all duration-200 ${
                    details.mainMode === 'Office Visit'
                      ? 'border-[#12372A] bg-[#f0f7f2] ring-2 ring-[#12372A]/20 shadow-sm'
                      : 'border-gray-300 hover:border-[#12372A] bg-white shadow-2xs'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    details.mainMode === 'Office Visit' ? 'bg-[#12372A] text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">Office Visit</p>
                      {details.mainMode === 'Office Visit' && (
                        <span className="w-4 h-4 rounded-full bg-[#12372A] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">In-person session at our physical branch location.</p>
                  </div>
                </button>

                {/* Option 2: Online Consultation */}
                <button
                  type="button"
                  onClick={() => setDetails({ ...details, mainMode: 'Online Consultation' })}
                  className={`p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all duration-200 ${
                    details.mainMode === 'Online Consultation'
                      ? 'border-[#12372A] bg-[#f0f7f2] ring-2 ring-[#12372A]/20 shadow-sm'
                      : 'border-gray-300 hover:border-[#12372A] bg-white shadow-2xs'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    details.mainMode === 'Online Consultation' ? 'bg-[#12372A] text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">Online Consultation</p>
                      {details.mainMode === 'Online Consultation' && (
                        <span className="w-4 h-4 rounded-full bg-[#12372A] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Remote session via Phone, WhatsApp, or Video Call.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Sub Options when Online Consultation is selected */}
            {details.mainMode === 'Online Consultation' && (
              <div className="p-5 bg-[#f8faf9] border-2 border-emerald-200 rounded-2xl space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#12372A]">
                    Select Online Consultation Method
                  </label>
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    3 Channels Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Phone Option */}
                  <button
                    type="button"
                    onClick={() => setDetails({ ...details, onlineSubMode: 'Phone Call' })}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center text-center space-y-2 transition-all ${
                      details.onlineSubMode === 'Phone Call'
                        ? 'border-[#12372A] bg-white ring-2 ring-[#12372A]/30 shadow-sm'
                        : 'border-gray-300 hover:border-[#12372A] bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      details.onlineSubMode === 'Phone Call' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Phone Call</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Voice Call with Officer</p>
                    </div>
                  </button>

                  {/* WhatsApp Option */}
                  <button
                    type="button"
                    onClick={() => setDetails({ ...details, onlineSubMode: 'WhatsApp' })}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center text-center space-y-2 transition-all ${
                      details.onlineSubMode === 'WhatsApp'
                        ? 'border-[#12372A] bg-white ring-2 ring-[#12372A]/30 shadow-sm'
                        : 'border-gray-300 hover:border-[#12372A] bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      details.onlineSubMode === 'WhatsApp' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">WhatsApp</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">WhatsApp Call / Chat</p>
                    </div>
                  </button>

                  {/* Video Call Option */}
                  <button
                    type="button"
                    onClick={() => setDetails({ ...details, onlineSubMode: 'Video Call' })}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center text-center space-y-2 transition-all ${
                      details.onlineSubMode === 'Video Call'
                        ? 'border-[#12372A] bg-white ring-2 ring-[#12372A]/30 shadow-sm'
                        : 'border-gray-300 hover:border-[#12372A] bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      details.onlineSubMode === 'Video Call' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'
                    }`}>
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Video Call</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Google Meet / Zoom</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* DYNAMIC FIELDS based on mainMode & onlineSubMode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Date */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Preferred Date</label>
                <CustomDatePicker
                  value={details.date}
                  onChange={(val) => setDetails({ ...details, date: val })}
                  disablePast
                />
              </div>

              {/* Time Slot */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Time Slot</label>
                <CustomSelect
                  value={details.timeSlot}
                  onChange={(val) => setDetails({ ...details, timeSlot: val })}
                  options={[
                    { value: '09:30 AM', label: '09:30 AM - 10:15 AM' },
                    { value: '10:30 AM', label: '10:30 AM - 11:15 AM' },
                    { value: '02:00 PM', label: '02:00 PM - 02:45 PM' },
                    { value: '04:00 PM', label: '04:00 PM - 04:45 PM' }
                  ]}
                />
              </div>

              {/* DYNAMIC CASE 1: Office Visit Location Selector */}
              {details.mainMode === 'Office Visit' && (
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Select Branch Office</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setDetails({ ...details, location: 'Main Branch - Amman Comm HQ' })}
                      className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                        details.location.includes('Main')
                          ? 'border-[#12372A] bg-[#f0f7f2]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MapPin className="w-5 h-5 text-[#12372A] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Main Branch - Amman Comm HQ</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Central District, Tower No. 42</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setDetails({ ...details, location: 'West Regional Office' })}
                      className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                        details.location.includes('West')
                          ? 'border-[#12372A] bg-[#f0f7f2]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MapPin className="w-5 h-5 text-[#12372A] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">West Regional Office</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">West Zone Plaza, Suite 104</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC CASE 2: Online Consultation -> Phone Call Fields */}
              {details.mainMode === 'Online Consultation' && details.onlineSubMode === 'Phone Call' && (
                <div className="md:col-span-2 space-y-4 p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-900">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold">Phone Consultation Setup</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">Call Receiver Phone Number</label>
                      <input
                        type="text"
                        value={details.phoneCallNumber}
                        onChange={(e) => setDetails({ ...details, phoneCallNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">Preferred Call Type</label>
                      <CustomSelect
                        value="Direct Voice Call"
                        onChange={() => {}}
                        options={['Direct Voice Call', 'IVR Callback Confirmation']}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-blue-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Our officer will call your provided phone number directly at the scheduled time slot.
                  </p>
                </div>
              )}

              {/* DYNAMIC CASE 3: Online Consultation -> WhatsApp Fields */}
              {details.mainMode === 'Online Consultation' && details.onlineSubMode === 'WhatsApp' && (
                <div className="md:col-span-2 space-y-4 p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">WhatsApp Consultation Setup</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">WhatsApp Contact Number</label>
                      <input
                        type="text"
                        value={details.whatsappNumber}
                        onChange={(e) => setDetails({ ...details, whatsappNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">WhatsApp Mode Preference</label>
                      <CustomSelect
                        value={details.whatsappOption}
                        onChange={(val) => setDetails({ ...details, whatsappOption: val as 'WhatsApp Voice Call' | 'WhatsApp Video Call' | 'WhatsApp Text Chat' })}
                        options={['WhatsApp Voice Call', 'WhatsApp Video Call', 'WhatsApp Text Chat']}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    A WhatsApp message and connection link will be sent to this number 10 minutes prior to appointment.
                  </p>
                </div>
              )}

              {/* DYNAMIC CASE 4: Online Consultation -> Video Call Fields */}
              {details.mainMode === 'Online Consultation' && details.onlineSubMode === 'Video Call' && (
                <div className="md:col-span-2 space-y-4 p-4 bg-purple-50/60 border border-purple-200/80 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-900">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold">Video Call Consultation Setup</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">Preferred Video Platform</label>
                      <CustomSelect
                        value={details.videoPlatform}
                        onChange={(val) => setDetails({ ...details, videoPlatform: val as 'Google Meet' | 'Zoom' | 'Microsoft Teams' })}
                        options={[
                          { value: 'Google Meet', label: 'Google Meet (Recommended)' },
                          { value: 'Zoom', label: 'Zoom Meeting' },
                          { value: 'Microsoft Teams', label: 'Microsoft Teams' }
                        ]}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">Email for Video Link Invite</label>
                      <input
                        type="email"
                        value={details.applicantEmail}
                        onChange={(e) => setDetails({ ...details, applicantEmail: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-purple-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    A secure {details.videoPlatform} link will be generated and emailed to {details.applicantEmail} before the appointment.
                  </p>
                </div>
              )}

              {/* Applicant Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Applicant Full Name</label>
                <input
                  type="text"
                  value={details.applicantName}
                  onChange={(e) => setDetails({ ...details, applicantName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-sm text-gray-800"
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Primary Mobile Phone</label>
                <input
                  type="text"
                  value={details.applicantPhone}
                  onChange={(e) => setDetails({ ...details, applicantPhone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-sm text-gray-800"
                />
              </div>

              {/* Full Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Residential / Contact Address</label>
                <input
                  type="text"
                  value={details.address}
                  onChange={(e) => setDetails({ ...details, address: e.target.value })}
                  placeholder="Enter full street address, city & pincode"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-sm text-gray-800"
                />
              </div>

              {/* Description / Additional Notes (Optional) */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Description / Purpose of Appointment
                  </label>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                    Optional
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={details.description}
                  onChange={(e) => setDetails({ ...details, description: e.target.value })}
                  placeholder="Add any specific requests, details, or context for your officer..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-sm text-gray-800 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Documents */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Step 3: Upload Documents</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Optional
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Attach verification files for <strong className="text-[#12372A]">{serviceObj.name}</strong> if available.
              </p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Document upload is completely optional!</span>
                <p className="text-[11px] text-blue-700/90 mt-0.5">
                  You can schedule your appointment without uploading files now. If required, you can present physical copies at the appointment or upload them later.
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-[#f8faf9] hover:border-[#12372A] transition-colors">
              <Upload className="w-10 h-10 text-[#12372A] mx-auto mb-3" />
              <p className="text-xs font-bold text-gray-800">Drag &amp; Drop supporting documents here (Optional)</p>
              <p className="text-[11px] text-gray-500 mt-1">Accepted formats: PDF, PNG, JPG up to 10MB</p>
              <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#12372A] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#1a4a38] transition-colors">
                <span>Select Files</span>
                <input type="file" onChange={handleSimulateFileUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Attached Documents ({uploadedFiles.length})
                </h3>
                {uploadedFiles.length > 0 && (
                  <span className="text-[11px] font-medium text-gray-500">
                    Click the remove icon if you wish to detach a file
                  </span>
                )}
              </div>

              {uploadedFiles.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-center text-xs text-gray-500">
                  No documents attached. You can click <strong className="text-gray-700">Next</strong> to continue booking your appointment without uploading.
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="w-4 h-4 text-[#12372A]" />
                        <span className="font-semibold text-gray-800">{file}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#12372A] bg-[#d8ebdd] px-2 py-0.5 rounded-full">Attached</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 4: Review Booking Summary</h2>
              <p className="text-xs text-gray-500 mt-1">
                Please double check all information before confirming your appointment.
              </p>
            </div>

            <div className="bg-[#f0f7f2] border border-[#a8d5b9] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Selected Service</span>
                <span className="text-sm font-bold text-[#12372A]">{serviceObj.name}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Consultation Category</span>
                <span className="text-sm font-bold text-gray-900">{details.mainMode}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Consultation Details</span>
                <span className="text-sm font-bold text-gray-900">{getFormattedConsultationType()}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Date &amp; Time Slot</span>
                <span className="text-sm font-bold text-gray-900">{details.date} ({details.timeSlot})</span>
              </div>

              {details.mainMode === 'Office Visit' && (
                <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                  <span className="text-xs text-gray-600 font-medium">Branch Location</span>
                  <span className="text-sm font-bold text-gray-900">{details.location}</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Applicant Details</span>
                <span className="text-sm font-bold text-gray-900">{details.applicantName} ({details.applicantPhone})</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Contact Address</span>
                <span className="text-sm font-bold text-gray-900 truncate max-w-xs">{details.address || 'Not provided'}</span>
              </div>

              <div className="flex items-start justify-between pb-3 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium shrink-0 pt-0.5">Description / Purpose</span>
                <span className="text-xs font-semibold text-gray-900 text-right max-w-xs">{details.description || 'None (Optional)'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Uploaded Attachments</span>
                {uploadedFiles.length > 0 ? (
                  <span className="text-sm font-bold text-gray-900">{uploadedFiles.length} file(s) attached</span>
                ) : (
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                    None (Optional - bring physical copies or upload later)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Success */}
        {currentStep === 5 && (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 bg-[#f0f7f2] border border-[#a8d5b9] text-[#12372A] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Appointment Scheduled Successfully!</h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Your reference ID is <strong className="text-[#12372A] font-mono">APT-2026-9042</strong>. A confirmation email and SMS notification have been sent to <strong className="text-gray-900">{details.applicantEmail}</strong>.
            </p>

            <div className="pt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/portal/appointments"
                className="px-6 py-3 bg-[#12372A] hover:bg-[#1a4a38] text-white text-xs font-bold rounded-xl transition-colors shadow-md"
              >
                View My Appointments
              </Link>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedService('property');
                }}
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        )}

        {/* Bottom Action Controls */}
        {currentStep < 5 && (
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-xs rounded-full hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <Link
                href="/portal/dashboard"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-xs rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            )}

            <button
              onClick={handleNext}
              className="px-8 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-full transition-all shadow-sm flex items-center gap-2"
            >
              <span>
                {currentStep === 4
                  ? 'Confirm Appointment'
                  : currentStep === 3 && uploadedFiles.length === 0
                  ? 'Skip / Next'
                  : 'Next'}
              </span>
              <ChevronRight className="w-4 h-4 text-[#a8d5b9]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
