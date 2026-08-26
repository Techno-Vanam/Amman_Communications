'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Info,
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
  CheckCircle2,
  Trash2,
  Download,
  History,
  Clock,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  Eye,
  ShieldCheck,
  UserCheck,
  ArrowLeft,
  X,
  FileCheck
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface ApplicationItem {
  id: string;
  serviceType: string;
  submittedDate: string;
  updatedDate: string;
  addedBy: 'You' | 'Admin';
  status: 'Verification' | 'Documents Received' | 'Processing' | 'Awaiting Approval' | 'Completed';
  stepPhase: number; // 1 to 8
  adminRemarks?: string;
  assignedOfficer?: string;
  estimatedDays?: string;
}

const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'AMC-2026-000001',
    serviceType: 'Patta Transfer & Property Verification',
    submittedDate: '18 May 2026',
    updatedDate: '21 May 2026',
    addedBy: 'You',
    status: 'Verification',
    stepPhase: 3,
    adminRemarks: 'Document Image is blurred. Please re-upload a clearer copy.',
    assignedOfficer: 'Officer Rajesh Kumar',
    estimatedDays: '7 days left'
  },
  {
    id: 'AMC-2026-000002',
    serviceType: 'Property Deed Registration',
    submittedDate: '08 May 2026',
    updatedDate: '15 May 2026',
    addedBy: 'You',
    status: 'Processing',
    stepPhase: 4,
    adminRemarks: 'Documents verified. Stamp duty payment processed successfully.',
    assignedOfficer: 'Officer Piotr Wisni...',
    estimatedDays: '4 days left'
  },
  {
    id: 'AMC-2026-000003',
    serviceType: 'Encumbrance Certificate (EC)',
    submittedDate: '01 May 2026',
    updatedDate: '05 May 2026',
    addedBy: 'You',
    status: 'Documents Received',
    stepPhase: 2,
    adminRemarks: 'Aadhaar copy uploaded. Verification in progress.',
    assignedOfficer: 'Officer Sarah Lee',
    estimatedDays: '12 days left'
  },
  {
    id: 'AMC-2026-000004',
    serviceType: 'Passport Renewal Fast-Track',
    submittedDate: '25 Apr 2026',
    updatedDate: '10 May 2026',
    addedBy: 'Admin',
    status: 'Completed',
    stepPhase: 7,
    adminRemarks: 'Passport dispatched via speed post. Tracking ID: SP904128.',
    assignedOfficer: 'Officer Anna Nowak',
    estimatedDays: 'Completed'
  },
  {
    id: 'AMC-2026-000005',
    serviceType: 'Legal Heirship Certificate',
    submittedDate: '18 Apr 2026',
    updatedDate: '02 May 2026',
    addedBy: 'You',
    status: 'Completed',
    stepPhase: 8,
    adminRemarks: 'Certificate issued successfully and ready for collection.',
    assignedOfficer: 'Officer Anna Nowak',
    estimatedDays: 'Completed'
  }
];

const SERVICES = [
  { id: 'passport', name: 'Passport Services & Renewal', desc: 'New passport issuance, renewal, address change & tatkal booking.', icon: BookOpen, tag: 'Popular' },
  { id: 'property', name: 'Patta Transfer & Property Verification', desc: 'Patta name transfer, legal opinion & encumbrance certificate.', icon: Home, tag: 'Fast Track' },
  { id: 'vehicle', name: 'RTO Vehicle Registration & Clearance', desc: 'Vehicle RC transfer, NOC issuance & fitness certification.', icon: Car, tag: 'Standard' },
  { id: 'pan', name: 'PAN & Aadhaar Updates', desc: 'Name correction, address update, mobile linking & new card creation.', icon: CreditCard, tag: 'Express' },
  { id: 'biometric', name: 'Biometric & Identity Verification', desc: 'In-person physical document verification & fingerprint scan.', icon: Fingerprint, tag: 'In-Person' },
  { id: 'legal', name: 'Legal Documentation & Notary', desc: 'Affidavits, rental agreements, power of attorney & notarization.', icon: Scale, tag: 'Legal' },
];

const WIZARD_STEPS = [
  { id: 1, label: 'Select Service' },
  { id: 2, label: 'Applicant Info' },
  { id: 3, label: 'Upload Documents' },
  { id: 4, label: 'Review & Submit' }
];

const TRACKER_PHASES = [
  { step: 1, title: 'Application Submitted', date: '18 May 2026' },
  { step: 2, title: 'Documents Received', date: '19 May 2026' },
  { step: 3, title: 'Verification', date: '' },
  { step: 4, title: 'Processing', date: '' },
  { step: 5, title: 'Government Submission', date: '' },
  { step: 6, title: 'Awaiting Approval', date: '' },
  { step: 7, title: 'Completed', date: '' },
  { step: 8, title: 'Ready for Collection', date: '' }
];

interface RequiredDocItem {
  id: string;
  name: string;
  required: 'Required' | 'Optional';
  uploadedFile: string;
  uploaded: 'Yes' | 'No';
  status: 'Not Uploaded' | 'Uploaded' | 'Under Review' | 'Approved';
}

const DETAIL_DOCS_DATA: Record<string, RequiredDocItem[]> = {
  'AMC-2026-000001': [
    { id: 'd1', name: 'Aadhaar Card', required: 'Required', uploadedFile: 'Aadhaar.pdf', uploaded: 'Yes', status: 'Under Review' },
    { id: 'd2', name: 'PAN Card', required: 'Required', uploadedFile: 'PAN.jpg', uploaded: 'Yes', status: 'Approved' },
    { id: 'd3', name: 'Passport Photo', required: 'Required', uploadedFile: 'Photo.jpg', uploaded: 'Yes', status: 'Approved' },
    { id: 'd4', name: 'Old Passport (if any)', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'd5', name: 'Any Supporting Document', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
  ]
};

export default function ApplicationsPage() {
  const { showToast } = useNotifications();
  const [applications, setApplications] = useState<ApplicationItem[]>(INITIAL_APPLICATIONS);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Mode: 'list' | 'create' | 'view'
  const [mode, setMode] = useState<'list' | 'create' | 'view'>('list');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('passport');
  const [activeTabFilter, setActiveTabFilter] = useState<'All' | 'Verification' | 'Processing' | 'Completed'>('All');

  // History modal & document view modal toggles
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<RequiredDocItem | null>(null);

  // Wizard Details
  const [details, setDetails] = useState({
    applicantName: 'John Doe',
    applicantPhone: '+91 98765 43210',
    applicantEmail: 'john@example.com',
    refNumber: '',
    remarks: 'Urgent processing requested.'
  });

  const [requiredDocs, setRequiredDocs] = useState<RequiredDocItem[]>([
    { id: 'd1', name: 'Aadhaar Card', required: 'Required', uploadedFile: 'Aadhaar.pdf', uploaded: 'Yes', status: 'Under Review' },
    { id: 'd2', name: 'PAN Card', required: 'Required', uploadedFile: 'PAN.jpg', uploaded: 'Yes', status: 'Approved' },
    { id: 'd3', name: 'Passport Photo', required: 'Required', uploadedFile: 'Photo.jpg', uploaded: 'Yes', status: 'Approved' },
    { id: 'd4', name: 'Old Passport (if any)', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'd5', name: 'Any Supporting Document', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
  ]);

  const serviceObj = SERVICES.find((s) => s.id === selectedService) || SERVICES[0];

  // Filter applications by tab
  const filteredApps = applications.filter((app) => {
    if (activeTabFilter === 'All') return true;
    if (activeTabFilter === 'Verification') return app.status === 'Verification' || app.status === 'Documents Received';
    if (activeTabFilter === 'Processing') return app.status === 'Processing' || app.status === 'Awaiting Approval';
    if (activeTabFilter === 'Completed') return app.status === 'Completed';
    return true;
  });

  const handleOpenView = (app: ApplicationItem) => {
    setSelectedApp(app);
    setMode('view');
  };

  const handleFileUploadInDetail = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setRequiredDocs(
        requiredDocs.map((doc) =>
          doc.id === docId
            ? { ...doc, uploadedFile: fileName, uploaded: 'Yes', status: 'Under Review' }
            : doc
        )
      );
      showToast('Document Uploaded Successfully!', `${fileName} submitted for verification.`);
    }
  };

  const handleDownloadSummary = () => {
    if (!selectedApp) return;
    const summaryText = `=====================================================
AMMAN COMMUNICATIONS MANAGEMENT SERVICES
APPLICATION SUMMARY REPORT
=====================================================
Application ID  : ${selectedApp.id}
Service Type    : ${selectedApp.serviceType}
Submitted On    : ${selectedApp.submittedDate}
Updated Date    : ${selectedApp.updatedDate}
Added By        : ${selectedApp.addedBy}
Current Status  : ${selectedApp.status}
Step Phase      : Phase ${selectedApp.stepPhase} of 8
Assigned Officer: ${selectedApp.assignedOfficer || 'Officer Rajesh Kumar'}
Admin Remarks   : ${selectedApp.adminRemarks || 'None'}
=====================================================`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Application-Summary-${selectedApp.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Summary Downloaded Successfully!', `Application-Summary-${selectedApp.id}.txt saved.`);
  };

  const handleFinishCreate = () => {
    const newId = `AMC-2026-00000${applications.length + 1}`;
    const newApp: ApplicationItem = {
      id: newId,
      serviceType: serviceObj.name,
      submittedDate: '18 May 2026',
      updatedDate: 'Just now',
      addedBy: 'You',
      status: 'Verification',
      stepPhase: 3,
      adminRemarks: 'Application received and under initial verification.',
      assignedOfficer: 'Officer Rajesh Kumar',
      estimatedDays: '7 days left'
    };
    setApplications([newApp, ...applications]);
    setMode('list');
    setCurrentStep(1);
    showToast('Application Submitted Successfully!', `Application ${newId} registered for verification.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
      {/* ======================================================== */}
      {/* 1. LIST MODE (Pillio Metric Cards & Application Grid) */}
      {/* ======================================================== */}
      {mode === 'list' && (
        <>
          {/* Top 4 Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Avg. adherence</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">87%</h3>
                <span className="text-[11px] font-bold text-emerald-600">↑ +4% W-o-W</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Active applications</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">10</h3>
                <span className="text-[11px] font-semibold text-gray-400">1 recently added</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Pending documents</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">2</h3>
                <span className="text-[11px] font-semibold text-gray-400">Within 7 days</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Verification alerts</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">1</h3>
                <span className="text-[11px] font-bold text-amber-600">• Moderate risk</span>
              </div>
            </div>
          </div>

          {/* Main Container Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-6">
            {/* Top Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="bg-gray-100/80 p-1 rounded-full inline-flex items-center space-x-1 text-xs font-semibold">
                {(['All', 'Verification', 'Processing', 'Completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTabFilter(tab)}
                    className={`px-5 py-2 rounded-full transition-all whitespace-nowrap ${
                      activeTabFilter === tab
                        ? 'bg-white text-gray-900 font-bold shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setMode('create');
                  setCurrentStep(1);
                }}
                className="bg-[#12372A] hover:bg-[#1a4a38] text-white px-6 py-2.5 rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Application</span>
              </button>
            </div>

            {/* 3-Column Application Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredApps.length === 0 ? (
                <div className="col-span-full p-12 text-center text-xs text-gray-400">
                  No applications found in this filter category.
                </div>
              ) : (
                filteredApps.map((app) => {
                  const isCompleted = app.status === 'Completed';
                  const progressPercent = Math.min(100, Math.round((app.stepPhase / 8) * 100));

                  return (
                    <div
                      key={app.id}
                      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#f0f7f2] text-[#12372A] flex items-center justify-center shrink-0 border border-[#a8d5b9]/40 font-bold">
                            <FileText className="w-5 h-5 text-[#12372A]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#12372A] transition-colors leading-snug">
                              {app.serviceType}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-medium">
                              {app.id}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-[#d8ebdd] text-[#12372A]'
                          }`}
                        >
                          • {app.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                          <span>Phase {app.stepPhase} of 8</span>
                          <span className="text-gray-400 font-normal">{app.estimatedDays || '7 days left'}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#12372A] via-[#2e8a60] to-[#3b9f71] h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                        <div>
                          <p className="font-semibold text-gray-700">Synced from</p>
                          <p className="text-gray-400 font-medium truncate max-w-[130px]">{app.assignedOfficer || 'Officer Rajesh'}</p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-gray-700">Next update</p>
                          <p className="text-gray-400 font-medium">{app.updatedDate}</p>
                        </div>

                        <button
                          onClick={() => handleOpenView(app)}
                          className="w-9 h-9 rounded-full bg-gray-50 hover:bg-[#12372A] hover:text-white border border-gray-200/80 flex items-center justify-center text-gray-700 transition-all shrink-0 ml-2 shadow-2xs"
                          title="View Application Details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 2. VIEW MODE: APPLICATION DETAIL + TRACKING (Matching Reference Screenshot) */}
      {/* ======================================================== */}
      {mode === 'view' && selectedApp && (
        <div className="space-y-6">
          {/* Top Breadcrumb & Download Summary Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500">
              <button
                onClick={() => setMode('list')}
                className="hover:text-[#12372A] transition-colors flex items-center gap-1"
              >
                <span>My Applications</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 font-bold">{selectedApp.id}</span>
            </div>

            <button
              onClick={handleDownloadSummary}
              className="px-4 py-2 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all shadow-2xs flex items-center gap-2 self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Download Application Summary</span>
            </button>
          </div>

          {/* Top 2 Cards Grid: Application Info & Current Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Card 1: Application Info (Left 8/12) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Application Info
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-3 text-xs">
                <div className="flex items-center">
                  <span className="w-36 text-gray-500 font-medium">Application ID</span>
                  <span className="font-bold text-gray-900">: {selectedApp.id}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 text-gray-500 font-medium">Service Type</span>
                  <span className="font-bold text-gray-900">: {selectedApp.serviceType}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 text-gray-500 font-medium">Submitted On</span>
                  <span className="font-bold text-gray-900">: {selectedApp.submittedDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 text-gray-500 font-medium">Added By</span>
                  <span className="font-bold text-gray-900">: {selectedApp.addedBy}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Current Status (Right 4/12) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 text-center flex flex-col justify-center space-y-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                Current Status
              </h2>

              <div className="py-2">
                <span className="inline-block bg-[#d8ebdd] text-[#12372A] border border-[#a8d5b9] font-extrabold text-base px-8 py-3 rounded-2xl shadow-2xs">
                  {selectedApp.status}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 font-medium">
                Updated on: {selectedApp.updatedDate}
              </p>
            </div>
          </div>

          {/* Middle Card: Application Status Tracker */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Application Status Tracker
            </h2>

            {/* Stepper Nodes */}
            <div className="relative pt-4 pb-2 overflow-x-auto">
              <div className="flex items-start justify-between min-w-[700px] relative">
                {/* Connecting Track Line */}
                <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-0" />

                {TRACKER_PHASES.map((phase) => {
                  const isCompleted = phase.step < selectedApp.stepPhase;
                  const isActive = phase.step === selectedApp.stepPhase;

                  return (
                    <div key={phase.step} className="flex flex-col items-center text-center space-y-2 z-10 w-24">
                      {/* Step Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${
                          isCompleted
                            ? 'bg-[#12372A] text-white ring-4 ring-emerald-50'
                            : isActive
                            ? 'bg-[#1c3a63] text-white ring-4 ring-blue-100 scale-110'
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5 text-white stroke-[3]" /> : phase.step}
                      </div>

                      {/* Step Title & Date */}
                      <div className="space-y-0.5">
                        <p className={`text-[11px] font-bold leading-tight ${isActive ? 'text-[#1c3a63]' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {phase.title}
                        </p>
                        {phase.date && (
                          <p className="text-[10px] text-gray-400 font-medium">{phase.date}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom 2 Columns Grid: Documents Required & Admin Remarks/History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Documents Required (8/12) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Documents Required
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Document</th>
                      <th className="pb-3">Required</th>
                      <th className="pb-3">Uploaded</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requiredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 font-bold text-gray-900">{doc.name}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.required === 'Required' ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                          }`}>
                            {doc.required}
                          </span>
                        </td>
                        <td className="py-3.5 font-semibold text-gray-700">{doc.uploaded}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'Under Review'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {doc.uploaded === 'Yes' ? (
                            <button
                              onClick={() => setViewingDoc(doc)}
                              className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-[11px] rounded-xl transition-all shadow-2xs"
                            >
                              View
                            </button>
                          ) : (
                            <label className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-[11px] rounded-xl transition-all shadow-2xs cursor-pointer inline-block">
                              <span>Upload</span>
                              <input
                                type="file"
                                onChange={(e) => handleFileUploadInDetail(doc.id, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Admin Remarks & Application History (4/12) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Admin Remarks */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 space-y-3">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Admin Remarks
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {selectedApp.adminRemarks || 'Document Image is blurred. Please re-upload a clearer copy.'}
                </p>
              </div>

              {/* Card 2: Application History */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 space-y-4">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Application History
                </h2>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="w-full py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all shadow-2xs"
                >
                  View Full History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. WIZARD MODE: CREATE NEW APPLICATION */}
      {/* ======================================================== */}
      {mode === 'create' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">New Service Application</h2>
              <p className="text-xs text-gray-500">Follow the steps below to submit a new service request.</p>
            </div>
            <button
              onClick={() => setMode('list')}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl px-4 py-2 bg-gray-50"
            >
              Back to Applications
            </button>
          </div>

          <div className="flex items-center justify-between max-w-xl mx-auto py-4">
            {WIZARD_STEPS.map((step) => (
              <div key={step.id} className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep === step.id
                      ? 'bg-[#12372A] text-white shadow-sm'
                      : currentStep > step.id
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${currentStep === step.id ? 'text-[#12372A]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES.map((srv) => {
                const Icon = srv.icon;
                const isSelected = selectedService === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'border-[#12372A] bg-[#f0f7f2] shadow-sm'
                        : 'border-gray-200/80 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#12372A] flex items-center justify-center border border-gray-200">
                        <Icon className="w-5 h-5 text-[#12372A]" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {srv.tag}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{srv.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{srv.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Applicant Full Name *</label>
                <input
                  type="text"
                  value={details.applicantName}
                  onChange={(e) => setDetails({ ...details, applicantName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Contact Phone Number *</label>
                <input
                  type="text"
                  value={details.applicantPhone}
                  onChange={(e) => setDetails({ ...details, applicantPhone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Remarks / Special Notes</label>
                <textarea
                  value={details.remarks}
                  onChange={(e) => setDetails({ ...details, remarks: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-3 text-xs">
              {requiredDocs.map((doc) => (
                <div key={doc.id} className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{doc.name}</h4>
                    <p className="text-[11px] text-gray-400">
                      {doc.uploaded === 'Yes' ? `Uploaded: ${doc.uploadedFile}` : 'Not Uploaded Yet'}
                    </p>
                  </div>
                  <label className="px-4 py-2 bg-[#12372A] text-white rounded-full font-bold text-xs cursor-pointer hover:bg-[#1a4a38] transition-colors">
                    <span>Upload</span>
                    <input type="file" onChange={(e) => handleFileUploadInDetail(doc.id, e)} className="hidden" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-gray-900 border-b pb-2">Review Application Summary</h3>
              <div className="space-y-2">
                <p><span className="text-gray-500">Service:</span> <strong className="text-gray-900">{serviceObj.name}</strong></p>
                <p><span className="text-gray-500">Applicant:</span> <strong className="text-gray-900">{details.applicantName}</strong></p>
                <p><span className="text-gray-500">Phone:</span> <strong className="text-gray-900">{details.applicantPhone}</strong></p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2.5 border border-gray-300 rounded-full font-semibold text-xs text-gray-700 disabled:opacity-40"
            >
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2.5 bg-[#12372A] text-white font-bold text-xs rounded-full hover:bg-[#1a4a38] shadow-md"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleFinishCreate}
                className="px-6 py-2.5 bg-[#12372A] text-white font-bold text-xs rounded-full hover:bg-[#1a4a38] shadow-md"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODALS: HISTORY & DOCUMENT PREVIEW */}
      {/* ======================================================== */}
      {showHistoryModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">Application History - {selectedApp.id}</h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs max-h-80 overflow-y-auto">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900">18 May 2026 - 10:00 AM</p>
                <p className="text-gray-600">Application AMC-2026-000001 submitted by applicant.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900">19 May 2026 - 02:30 PM</p>
                <p className="text-gray-600">Documents Received and assigned to Officer Rajesh Kumar.</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="font-bold text-[#12372A]">21 May 2026 - 11:15 AM (Current)</p>
                <p className="text-gray-700">Verification in progress. Admin remark: Document Image is blurred.</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2.5 bg-[#12372A] text-white font-bold text-xs rounded-xl hover:bg-[#1a4a38]"
            >
              Close History
            </button>
          </div>
        </div>
      )}

      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Viewing Document: {viewingDoc.name}</h3>
              <button onClick={() => setViewingDoc(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2">
              <FileCheck className="w-12 h-12 text-[#12372A] mx-auto" />
              <p className="text-xs font-bold text-gray-900">{viewingDoc.uploadedFile}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">• Status: {viewingDoc.status}</p>
            </div>
            <button
              onClick={() => setViewingDoc(null)}
              className="w-full py-2.5 bg-[#12372A] text-white font-bold text-xs rounded-xl hover:bg-[#1a4a38]"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
