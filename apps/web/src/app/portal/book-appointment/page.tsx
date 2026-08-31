'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Globe,
  X,
  Search
} from 'lucide-react';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomSelect from '@/components/ui/CustomSelect';
import { useNotifications } from '@/context/NotificationContext';
import { useUser, getUserStorageKey } from '@/context/UserContext';

const SERVICES = [
  { id: 'passport', name: 'Passport Renewal', icon: BookOpen },
  { id: 'property', name: 'Property Registration', icon: Home },
  { id: 'dl', name: 'Driving License', icon: Car },
  { id: 'pan', name: 'PAN Card', icon: CreditCard },
  { id: 'aadhaar', name: 'Aadhaar Update', icon: Fingerprint },
  { id: 'ec_patta', name: 'EC / Patta / Chitta', icon: FileText },
  { id: 'legal', name: 'Legal & Affidavit', icon: Scale },
  { id: 'other', name: 'See More', icon: MoreHorizontal },
];

const ADDITIONAL_SERVICES = [
  { id: 'voter', name: 'Voter ID Application & Correction', category: 'Identity & Electoral', icon: BookOpen },
  { id: 'gst', name: 'GST Registration & Filing', category: 'Tax & Business', icon: CreditCard },
  { id: 'msme', name: 'MSME / Udyam Registration', category: 'Business License', icon: Home },
  { id: 'income_cert', name: 'Income & Community Certificate', category: 'Revenue Records', icon: FileText },
  { id: 'patta_transfer', name: 'Patta Transfer & Land Records', category: 'Land Records', icon: Home },
  { id: 'fssai', name: 'FSSAI Food License Registration', category: 'Food & Safety', icon: CheckCircle2 },
  { id: 'rto_transfer', name: 'RTO Vehicle Ownership Transfer', category: 'Transport & RTO', icon: Car },
  { id: 'legal_heir', name: 'Legal Heir Certificate', category: 'Legal & Family', icon: Scale },
  { id: 'ration_card', name: 'Smart Ration Card Services', category: 'Government Benefits', icon: Fingerprint },
  { id: 'trade_license', name: 'Commercial Trade License', category: 'Municipal Business', icon: Building },
  { id: 'encumbrance', name: 'Encumbrance Certificate (EC)', category: 'Land & Revenue', icon: FileText },
  { id: 'telecom_survey', name: 'Dedicated Fiber Leased Line Survey', category: 'Telecom Services', icon: Globe },
];

const STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Documents (Optional)' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Success' },
];

export default function BookAppointmentPage() {
  const { showToast } = useNotifications();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('property');
  const [customService, setCustomService] = useState<{ id: string; name: string } | null>(null);
  const [showOtherServicesModal, setShowOtherServicesModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const serviceObj = customService
    ? { id: customService.id, name: customService.name, icon: MoreHorizontal }
    : (SERVICES.find((s) => s.id === selectedService) || SERVICES[1]);

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
    <div className="max-w-7xl w-full mx-auto font-sans flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4">
      {/* 5-Step Stepper Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-3.5 sm:p-4 overflow-hidden shrink-0">
        <div className="relative w-full max-w-5xl mx-auto">
          <div className="relative w-full grid grid-cols-5 py-1">
            {/* Continuous Connecting Line (100% Equal Center-to-Center Spacing) */}
            <div className="absolute top-[12px] sm:top-[18px] left-[10%] right-[10%] h-1 bg-gray-200 z-0 overflow-hidden rounded-full">
              <div
                className="h-full bg-gradient-to-r from-[#12372A] to-[#2d6a4f] rounded-full transition-all duration-500 ease-in-out"
                style={{
                  width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 100))}%`
                }}
              />
            </div>

            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const isClickable = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  onClick={() => isClickable && setCurrentStep(step.id)}
                  className={`relative z-10 flex flex-col items-center text-center px-0.5 group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div
                    className={`
                      w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-[10px] sm:text-sm transition-all duration-300 transform
                      ${isCompleted || isCurrent
                        ? 'bg-[#12372A] text-white border-2 border-[#12372A] shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-300 shadow-xs'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#a8d5b9] stroke-[3]" />
                    ) : (
                      <span className={`font-extrabold ${isCurrent || isCompleted ? 'text-white' : 'text-gray-800'}`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-1 sm:mt-1.5 text-[8px] sm:text-xs transition-all duration-300 tracking-tight text-center leading-tight break-words max-w-full ${
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
      </div>

      {/* Step Content Container - Stretches down to align level with left sidebar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* STEP 1: Select Service */}
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col justify-between py-1 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 1: Select Service</h2>
              <p className="text-xs text-gray-500 mt-1">
                Choose the primary service you require an appointment for.
              </p>
            </div>

            {/* 8 Grid Service Cards - Dynamically scaled for perfectly balanced spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 flex-1 items-stretch py-1">
              {SERVICES.map((srv) => {
                const Icon = srv.icon;
                const isSelected = selectedService === srv.id;

                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      if (srv.id === 'other') {
                        setShowOtherServicesModal(true);
                      } else {
                        setSelectedService(srv.id);
                        setCustomService(null);
                      }
                    }}
                    className={`
                      p-4 sm:p-5 h-full min-h-[100px] sm:min-h-[115px] rounded-2xl border text-center flex flex-col items-center justify-center space-y-2.5 transition-all duration-200 group relative
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
                        w-11 h-11 rounded-xl flex items-center justify-center transition-colors
                        ${isSelected
                          ? 'bg-[#12372A] text-white'
                          : 'bg-blue-50 text-blue-600 group-hover:bg-[#12372A]/10 group-hover:text-[#12372A]'
                        }
                      `}
                    >
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className={`text-xs sm:text-sm font-bold block ${isSelected ? 'text-[#12372A]' : 'text-gray-800'}`}>
                        {srv.name}
                      </span>
                      {srv.id === 'other' && customService && (
                        <span className="text-[10px] font-extrabold text-[#12372A] bg-[#d8ebdd] px-2 py-0.5 rounded-full inline-block truncate max-w-[140px]">
                          {customService.name}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-3.5 sm:space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Step 2: Appointment Details</h2>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                Selected Service: <strong className="text-[#12372A]">{serviceObj.name}</strong>. Choose consultation type and schedule.
              </p>
            </div>

            {/* Top Level: Main Consultation Type Options (Office Visit vs Online Consultation) */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                Select Consultation Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Office Visit */}
                <button
                  type="button"
                  onClick={() => setDetails({ ...details, mainMode: 'Office Visit' })}
                  className={`p-3.5 sm:p-4 rounded-xl border-2 text-left flex items-start gap-3.5 transition-all duration-200 ${
                    details.mainMode === 'Office Visit'
                      ? 'border-[#12372A] bg-[#f0f7f2] ring-2 ring-[#12372A]/20 shadow-sm'
                      : 'border-gray-300 hover:border-[#12372A] bg-white shadow-2xs'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    details.mainMode === 'Office Visit' ? 'bg-[#12372A] text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-bold text-gray-900">Office Visit</p>
                      {details.mainMode === 'Office Visit' && (
                        <span className="w-4 h-4 rounded-full bg-[#12372A] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">In-person session at our physical branch location.</p>
                  </div>
                </button>

                {/* Option 2: Online Consultation */}
                <button
                  type="button"
                  onClick={() => setDetails({ ...details, mainMode: 'Online Consultation' })}
                  className={`p-3.5 sm:p-4 rounded-xl border-2 text-left flex items-start gap-3.5 transition-all duration-200 ${
                    details.mainMode === 'Online Consultation'
                      ? 'border-[#12372A] bg-[#f0f7f2] ring-2 ring-[#12372A]/20 shadow-sm'
                      : 'border-gray-300 hover:border-[#12372A] bg-white shadow-2xs'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    details.mainMode === 'Online Consultation' ? 'bg-[#12372A] text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-bold text-gray-900">Online Consultation</p>
                      {details.mainMode === 'Online Consultation' && (
                        <span className="w-4 h-4 rounded-full bg-[#12372A] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Remote session via Phone, WhatsApp, or Video Call.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Sub Options when Online Consultation is selected */}
            {details.mainMode === 'Online Consultation' && (
              <div className="p-4 bg-[#f8faf9] border-2 border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#12372A]">
                    Select Online Consultation Method
                  </label>
                  <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    3 Channels Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Phone Option */}
                  <button
                    type="button"
                    onClick={() => setDetails({ ...details, onlineSubMode: 'Phone Call' })}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center text-center space-y-1.5 transition-all ${
                      details.onlineSubMode === 'Phone Call'
                        ? 'border-[#12372A] bg-white ring-2 ring-[#12372A]/30 shadow-sm'
                        : 'border-gray-300 hover:border-[#12372A] bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
                    className={`p-3 rounded-xl border-2 flex flex-col items-center text-center space-y-1.5 transition-all ${
                      details.onlineSubMode === 'WhatsApp'
                        ? 'border-[#12372A] bg-white ring-2 ring-[#12372A]/30 shadow-sm'
                        : 'border-gray-300 hover:border-[#12372A] bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
                    className={`p-3 rounded-xl border-2 flex flex-col items-center text-center space-y-1.5 transition-all ${
                      details.onlineSubMode === 'Video Call'
                        ? 'border-[#12372A] bg-white ring-2 ring-[#12372A]/30 shadow-sm'
                        : 'border-gray-300 hover:border-[#12372A] bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preferred Date */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Preferred Date</label>
                <CustomDatePicker
                  value={details.date}
                  onChange={(val) => setDetails({ ...details, date: val })}
                  disablePast
                />
              </div>

              {/* Time Slot */}
              <div className="space-y-1">
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
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Select Branch Office</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setDetails({ ...details, location: 'Main Branch - Amman Comm HQ' })}
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                        details.location.includes('Main')
                          ? 'border-[#12372A] bg-[#f0f7f2]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-[#12372A] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Main Branch - Amman Comm HQ</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Central District, Tower No. 42</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setDetails({ ...details, location: 'West Regional Office' })}
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                        details.location.includes('West')
                          ? 'border-[#12372A] bg-[#f0f7f2]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-[#12372A] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">West Regional Office</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">West Zone Plaza, Suite 104</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Applicant Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Applicant Full Name</label>
                <input
                  type="text"
                  value={details.applicantName}
                  onChange={(e) => setDetails({ ...details, applicantName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-xs text-gray-800"
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Primary Mobile Phone</label>
                <input
                  type="text"
                  value={details.applicantPhone}
                  onChange={(e) => setDetails({ ...details, applicantPhone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-xs text-gray-800"
                />
              </div>

              {/* Full Address */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Residential / Contact Address</label>
                <input
                  type="text"
                  value={details.address}
                  onChange={(e) => setDetails({ ...details, address: e.target.value })}
                  placeholder="Enter full street address, city & pincode"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-xs text-gray-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Documents */}
        {currentStep === 3 && (
          <div className="space-y-4">
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

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Document upload is completely optional!</span>
                <p className="text-[11px] text-blue-700/90 mt-0.5">
                  You can schedule your appointment without uploading files now. If required, you can present physical copies at the appointment or upload them later.
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 sm:p-5 text-center bg-[#f8faf9] hover:border-[#12372A] transition-colors">
              <Upload className="w-8 h-8 text-[#12372A] mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-800">Drag &amp; Drop supporting documents here (Optional)</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Accepted formats: PDF, PNG, JPG up to 10MB</p>
              <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#12372A] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#1a4a38] transition-colors">
                <span>Select Files</span>
                <input type="file" onChange={handleSimulateFileUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Attached Documents ({uploadedFiles.length})
                </h3>
              </div>

              {uploadedFiles.length === 0 ? (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-center text-xs text-gray-500">
                  No documents attached. You can click <strong className="text-gray-700">Next</strong> to continue booking your appointment.
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
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
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 4: Review Booking Summary</h2>
              <p className="text-xs text-gray-500 mt-1">
                Please double check all information before confirming your appointment.
              </p>
            </div>

            <div className="bg-[#f0f7f2] border border-[#a8d5b9] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Selected Service</span>
                <span className="text-sm font-bold text-[#12372A]">{serviceObj.name}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Consultation Category</span>
                <span className="text-sm font-bold text-gray-900">{details.mainMode}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Consultation Details</span>
                <span className="text-sm font-bold text-gray-900">{getFormattedConsultationType()}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Date &amp; Time Slot</span>
                <span className="text-sm font-bold text-gray-900">{details.date} ({details.timeSlot})</span>
              </div>

              {details.mainMode === 'Office Visit' && (
                <div className="flex items-center justify-between pb-2 border-b border-[#a8d5b9]/50">
                  <span className="text-xs text-gray-600 font-medium">Branch Location</span>
                  <span className="text-sm font-bold text-gray-900">{details.location}</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-[#a8d5b9]/50">
                <span className="text-xs text-gray-600 font-medium">Applicant Details</span>
                <span className="text-sm font-bold text-gray-900">{details.applicantName} ({details.applicantPhone})</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Uploaded Attachments</span>
                {uploadedFiles.length > 0 ? (
                  <span className="text-sm font-bold text-gray-900">{uploadedFiles.length} file(s) attached</span>
                ) : (
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                    None (Optional)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Success */}
        {currentStep === 5 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-[#f0f7f2] border border-[#a8d5b9] text-[#12372A] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Appointment Scheduled Successfully!</h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Your reference ID is <strong className="text-[#12372A] font-mono">APT-2026-9042</strong>. A confirmation notification has been sent to <strong className="text-gray-900">{details.applicantEmail}</strong>.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/portal/appointments"
                className="px-5 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white text-xs font-bold rounded-xl transition-colors shadow-md"
              >
                View My Appointments
              </Link>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedService('property');
                  setCustomService(null);
                }}
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        )}

        {/* Bottom Action Controls - Pushed to bottom of stretched container */}
        {currentStep < 5 && (
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between shrink-0">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="px-5 py-2 border border-gray-300 text-gray-700 font-semibold text-xs rounded-full hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <Link
                href="/portal/dashboard"
                className="px-5 py-2 border border-gray-300 text-gray-700 font-semibold text-xs rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            )}

            <button
              onClick={handleNext}
              className="px-7 py-2 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-full transition-all shadow-sm flex items-center gap-2"
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

      {/* ── "SEE MORE" OTHER SERVICES POPUP MODAL ── */}
      {showOtherServicesModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#12372A] text-white flex items-center justify-center font-bold">
                  <MoreHorizontal className="w-5 h-5 text-[#a8d5b9]" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">All Additional Services</h2>
                  <p className="text-[11px] text-gray-400">Select a specialized government or telecom service to proceed with booking.</p>
                </div>
              </div>
              <button
                onClick={() => setShowOtherServicesModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Search additional services (e.g. Voter ID, GST, MSME, FSSAI)..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/20 focus:border-[#12372A]"
                />
              </div>
            </div>

            {/* Services Grid */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADDITIONAL_SERVICES.filter((s) => s.name.toLowerCase().includes(modalSearch.toLowerCase()) || s.category.toLowerCase().includes(modalSearch.toLowerCase())).map((srv) => {
                const Icon = srv.icon;
                const isSelected = customService?.id === srv.id;

                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      setCustomService({ id: srv.id, name: srv.name });
                      setSelectedService('other');
                      setShowOtherServicesModal(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-[#12372A] bg-[#f0f7f2] ring-2 ring-[#12372A]/20 shadow-xs'
                        : 'border-gray-200 hover:border-[#12372A] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#12372A] text-[#a8d5b9]' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 leading-snug">{srv.name}</p>
                      <span className="text-[10px] font-semibold text-gray-400 mt-0.5 block">{srv.category}</span>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#12372A] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button
                onClick={() => setShowOtherServicesModal(false)}
                className="px-5 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
