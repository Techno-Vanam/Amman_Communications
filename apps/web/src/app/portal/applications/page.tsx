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
  FileCheck,
  Search
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useUser, getUserStorageKey } from '@/context/UserContext';

interface ApplicationItem {
  id: string;
  serviceType: string;
  submittedDate: string;
  updatedDate: string;
  addedBy: 'You' | 'Admin';
  status: 'Verification' | 'Documents Received' | 'Processing' | 'Awaiting Approval' | 'Completed';
  stepPhase: number; // 1 to 8
  phaseDates?: Record<number, string>;
  adminRemarks?: string;
  assignedOfficer?: string;
  estimatedDays?: string;
}

const INITIAL_APPLICATIONS: ApplicationItem[] = [];

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
  { step: 1, title: 'Application Submitted' },
  { step: 2, title: 'Documents Received' },
  { step: 3, title: 'Verification' },
  { step: 4, title: 'Processing' },
  { step: 5, title: 'Government Submission' },
  { step: 6, title: 'Awaiting Approval' },
  { step: 7, title: 'Completed' },
  { step: 8, title: 'Ready for Collection' }
];

interface RequiredDocItem {
  id: string;
  name: string;
  required: 'Required' | 'Optional';
  uploadedFile: string;
  uploaded: 'Yes' | 'No';
  status: 'Not Uploaded' | 'Uploaded' | 'Under Review' | 'Approved';
}

const SERVICE_REQUIRED_DOCS: Record<string, RequiredDocItem[]> = {
  passport: [
    { id: 'p1', name: 'Aadhaar Card (Identity Proof)', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'p2', name: 'Proof of Address (Utility Bill / Passbook)', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'p3', name: 'Passport Size Photo (White Background)', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'p4', name: 'Old Passport Copy (For Re-issue)', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'p5', name: 'Birth / Educational Certificate', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
  ],
  property: [
    { id: 'pr1', name: 'Registered Sale Deed / Title Deed Copy', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'pr2', name: 'Encumbrance Certificate (EC)', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'pr3', name: 'Applicant Aadhaar Card', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'pr4', name: 'Latest Property Tax Receipt', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'pr5', name: 'Parent Document Copy', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
  ],
  vehicle: [
    { id: 'v1', name: 'Original Vehicle RC (Registration Certificate)', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'v2', name: 'Valid Insurance Copy', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'v3', name: 'Pollution Under Control (PUC) Certificate', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'v4', name: 'Vehicle Owner Aadhaar & PAN Card', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'v5', name: 'RTO Form 28 / Form 29 & 30 (If Transfer)', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
  ],
  pan: [
    { id: 'pn1', name: 'Current Aadhaar Card Copy', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'pn2', name: 'Existing PAN Card Copy (If Update)', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'pn3', name: 'Recent Passport Size Photograph', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'pn4', name: 'Proof of Name Change / Gazetted Officer Cert', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
  ],
  biometric: [
    { id: 'b1', name: 'Government Photo ID (Aadhaar / Passport)', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'b2', name: 'Appointment Confirmation Slip', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'b3', name: 'Physical Verification Consent Form', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
  ],
  legal: [
    { id: 'l1', name: 'Draft Agreement / Document Copy', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'l2', name: 'First Party Aadhaar & PAN Card', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'l3', name: 'Second Party Aadhaar Card', required: 'Required', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'l4', name: 'Stamp Paper Purchase Receipt', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'l5', name: 'Witness Identity Proof Copy', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
  ]
};

const DETAIL_DOCS_DATA: Record<string, RequiredDocItem[]> = {
  'AMC-2026-000001': SERVICE_REQUIRED_DOCS.passport,
  'AMC-2026-000002': SERVICE_REQUIRED_DOCS.property,
  'AMC-2026-000003': SERVICE_REQUIRED_DOCS.vehicle,
  'AMC-2026-000004': SERVICE_REQUIRED_DOCS.pan,
  'AMC-2026-000005': SERVICE_REQUIRED_DOCS.legal,
};

export default function ApplicationsPage() {
  const { showToast } = useNotifications();
  const { user } = useUser();
  const [applications, setApplications] = useState<ApplicationItem[]>(INITIAL_APPLICATIONS);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Mode: 'list' | 'create' | 'view'
  const [mode, setMode] = useState<'list' | 'create' | 'view'>('list');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('passport');
  const [activeTabFilter, setActiveTabFilter] = useState<'All' | 'Verification' | 'Processing' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewModalApp, setViewModalApp] = useState<ApplicationItem | null>(null);

  // History modal & document view modal toggles
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<RequiredDocItem | null>(null);

  // Wizard Details
  const [details, setDetails] = useState({
    applicantName: user.name || '',
    applicantPhone: user.phone || '+91 ',
    applicantEmail: user.email || '',
    altPhone: user.altPhone || '+91 ',
    address: user.address || '',
    description: ''
  });

  const [requiredDocs, setRequiredDocs] = useState<RequiredDocItem[]>(SERVICE_REQUIRED_DOCS.passport);

  // Sync required documents whenever selectedService changes
  React.useEffect(() => {
    const docsForService = SERVICE_REQUIRED_DOCS[selectedService] || SERVICE_REQUIRED_DOCS.passport;
    setRequiredDocs(docsForService);
  }, [selectedService]);

  const serviceObj = SERVICES.find((s) => s.id === selectedService) || SERVICES[0];

  // Filter applications by tab and search query
  const filteredApps = applications.filter((app) => {
    const matchesTab =
      activeTabFilter === 'All'
        ? true
        : activeTabFilter === 'Verification'
        ? app.status === 'Verification' || app.status === 'Documents Received'
        : activeTabFilter === 'Processing'
        ? app.status === 'Processing' || app.status === 'Awaiting Approval'
        : activeTabFilter === 'Completed'
        ? app.status === 'Completed'
        : true;

    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    return (
      app.id.toLowerCase().includes(query) ||
      app.serviceType.toLowerCase().includes(query) ||
      app.status.toLowerCase().includes(query) ||
      app.submittedDate.toLowerCase().includes(query) ||
      app.addedBy.toLowerCase().includes(query) ||
      (app.assignedOfficer && app.assignedOfficer.toLowerCase().includes(query)) ||
      (app.adminRemarks && app.adminRemarks.toLowerCase().includes(query))
    );
  });

  const handleOpenView = (app: ApplicationItem) => {
    setSelectedApp(app);
    setViewModalApp(app);
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

  // Hydrate applications from localStorage per user account
  React.useEffect(() => {
    try {
      const storageKey = getUserStorageKey(user.email, 'amman_user_applications');
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setApplications(JSON.parse(saved));
      } else {
        setApplications([]);
      }
    } catch (e) {
      console.error('Error loading applications:', e);
      setApplications([]);
    }
  }, [user.email]);

  const handleFinishCreate = () => {
    const newId = `AMC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const todayDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newApp: ApplicationItem = {
      id: newId,
      serviceType: serviceObj.name,
      submittedDate: todayDate,
      updatedDate: todayDate,
      addedBy: 'You',
      status: 'Verification',
      stepPhase: 1,
      phaseDates: {
        1: todayDate
      },
      adminRemarks: 'Application submitted successfully. Verification officer assigned.',
      assignedOfficer: 'Officer Rajesh Kumar',
      estimatedDays: '7 days left'
    };
    const updated = [newApp, ...applications];
    setApplications(updated);
    try {
      const storageKey = getUserStorageKey(user.email, 'amman_user_applications');
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving application:', e);
    }
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
          {/* Top 3 Summary Cards Grid - Matching Payments Card Styling & Size */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Active Applications */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs relative flex flex-col justify-between h-44">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 tracking-wide">Active Applications</span>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-4">
                  {applications.length}
                </p>
              </div>
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  In Progress
                </span>
              </div>
            </div>

            {/* Card 2: Pending Documents */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs relative flex flex-col justify-between h-44">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 tracking-wide">Pending Documents</span>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-4">
                  2
                </p>
              </div>
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
                  Within 7 days
                </span>
              </div>
            </div>

            {/* Card 3: Verification Status */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs relative flex flex-col justify-between h-44">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 tracking-wide">Verification Status</span>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-4">
                  1
                </p>
              </div>
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                  • Review Active
                </span>
              </div>
            </div>
          </div>

          {/* Main Container Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-6">
            {/* Top Control Bar with Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="bg-gray-100/90 p-1.5 rounded-full inline-flex items-center gap-1 border border-gray-200/60 overflow-x-auto max-w-full shrink-0">
                {(['All', 'Verification', 'Processing', 'Completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTabFilter(tab)}
                    className={`px-4 py-1.5 rounded-full transition-all text-xs whitespace-nowrap ${
                      activeTabFilter === tab
                        ? 'bg-white text-gray-900 font-extrabold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 font-semibold'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search Bar Input */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search applications..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200/90 rounded-full text-xs font-medium text-gray-900 focus:outline-none focus:border-[#12372A] focus:ring-2 focus:ring-[#12372A]/10 shadow-2xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Add Application Action Button */}
                <button
                  onClick={() => {
                    setMode('create');
                    setCurrentStep(1);
                  }}
                  className="bg-[#12372A] hover:bg-[#1a4a38] text-white px-5 py-2 rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Application</span>
                </button>
              </div>
            </div>

            {/* 3-Column Application Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredApps.length === 0 ? (
                <div className="col-span-full bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 rounded-full bg-[#f0f7ff] text-[#12372A] flex items-center justify-center mx-auto border border-blue-100">
                    <FileText className="w-8 h-8 text-[#12372A]" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-gray-900">No Applications Found</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      You haven&apos;t created any applications in this view. Click below to submit a new service request for property, passport, RTO, or legal documentation.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMode('create');
                      setCurrentStep(1);
                    }}
                    className="px-6 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-full transition-all shadow-sm inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Start New Application</span>
                  </button>
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

                  // Dynamic completion date logic (no hardcoded mock dates)
                  let phaseDate = '';
                  if (selectedApp.phaseDates && selectedApp.phaseDates[phase.step]) {
                    phaseDate = selectedApp.phaseDates[phase.step];
                  } else if (phase.step === 1) {
                    phaseDate = selectedApp.submittedDate;
                  } else if (phase.step <= selectedApp.stepPhase) {
                    phaseDate = selectedApp.updatedDate || selectedApp.submittedDate;
                  }

                  return (
                    <div key={phase.step} className="flex flex-col items-center text-center space-y-2 z-10 w-24">
                      {/* Step Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${
                          isCompleted
                            ? 'bg-[#12372A] text-white ring-4 ring-gray-300'
                            : isActive
                            ? 'bg-[#1c3a63] text-white ring-4 ring-gray-300 scale-110'
                            : 'bg-white text-gray-800'
                        }`}
                        style={{
                          border: '2px solid #6b7280',
                          backgroundColor: isCompleted ? '#12372A' : isActive ? '#1c3a63' : '#ffffff'
                        }}
                      >
                        {isCompleted ? <Check className="w-5 h-5 text-white stroke-[3]" /> : phase.step}
                      </div>

                      {/* Step Title & Date */}
                      <div className="space-y-0.5">
                        <p className={`text-[11px] font-bold leading-tight ${isActive ? 'text-[#1c3a63]' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {phase.title}
                        </p>
                        {phaseDate && (
                          <p className="text-[10px] text-gray-500 font-medium">{phaseDate}</p>
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
                      ? 'bg-[#12372A] text-white ring-2 ring-gray-300 shadow-sm'
                      : currentStep > step.id
                      ? 'bg-[#12372A] text-white shadow-sm'
                      : 'bg-white text-gray-800'
                  }`}
                  style={{
                    border: '2px solid #6b7280',
                    backgroundColor: currentStep >= step.id ? '#12372A' : '#ffffff'
                  }}
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
            <div className="max-w-2xl mx-auto bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 space-y-5 text-xs">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Applicant Personal &amp; Contact Details</h3>
                <p className="text-gray-500 text-[11px] mt-0.5">Please fill in all mandatory applicant credentials for official service filing.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Applicant Full Name */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Applicant Full Name *</label>
                  <input
                    type="text"
                    value={details.applicantName}
                    onChange={(e) => setDetails({ ...details, applicantName: e.target.value })}
                    placeholder="Full official name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    value={details.applicantEmail}
                    onChange={(e) => setDetails({ ...details, applicantEmail: e.target.value })}
                    placeholder="applicant.email@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Phone Number */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Primary Mobile Number *</label>
                  <input
                    type="text"
                    value={details.applicantPhone}
                    onChange={(e) => setDetails({ ...details, applicantPhone: e.target.value })}
                    placeholder="+91 Mobile Number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                    required
                  />
                </div>

                {/* Alternate Phone Number */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Alternate Contact Number</label>
                  <input
                    type="text"
                    value={details.altPhone}
                    onChange={(e) => setDetails({ ...details, altPhone: e.target.value })}
                    placeholder="+91 Alternate Number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  />
                </div>
              </div>

              {/* Residential Address */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Residential / Communication Address *</label>
                <input
                  type="text"
                  value={details.address}
                  onChange={(e) => setDetails({ ...details, address: e.target.value })}
                  placeholder="House No, Building, Street, City, State & Pincode"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  required
                />
              </div>

              {/* Government ID Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Government Identification Type</label>
                  <select
                    value={details.idDocType}
                    onChange={(e) => setDetails({ ...details, idDocType: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport Number">Passport Number</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">ID Document Number / Reference</label>
                  <input
                    type="text"
                    value={details.idDocNumber}
                    onChange={(e) => setDetails({ ...details, idDocNumber: e.target.value })}
                    placeholder="Enter document reference number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={details.dob}
                    onChange={(e) => setDetails({ ...details, dob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Special Notes / Remarks (Optional)</label>
                  <input
                    type="text"
                    value={details.remarks}
                    onChange={(e) => setDetails({ ...details, remarks: e.target.value })}
                    placeholder="e.g. Urgent processing, special request"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="p-4 bg-[#f0f7ff] border border-blue-200 rounded-2xl">
                <h3 className="font-bold text-sm text-[#12372A]">Required Documentation for {serviceObj.name}</h3>
                <p className="text-gray-600 text-[11px] mt-0.5">Please upload clear scans or photos for the documents required for this specific service.</p>
              </div>

              <div className="space-y-3">
                {requiredDocs.map((doc) => (
                  <div key={doc.id} className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{doc.name}</h4>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          doc.required === 'Required' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {doc.required}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {doc.uploaded === 'Yes' ? `Uploaded: ${doc.uploadedFile}` : 'Not Uploaded Yet'}
                      </p>
                    </div>
                    <label className="px-4 py-2 bg-[#12372A] text-white rounded-full font-bold text-xs cursor-pointer hover:bg-[#1a4a38] transition-colors shrink-0">
                      <span>{doc.uploaded === 'Yes' ? 'Replace' : 'Upload'}</span>
                      <input type="file" onChange={(e) => handleFileUploadInDetail(doc.id, e)} className="hidden" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-gray-900 border-b pb-2">Review Application Summary</h3>
              <div className="space-y-2.5">
                <p className="flex justify-between"><span className="text-gray-500 font-medium">Selected Service:</span> <strong className="text-gray-900 font-bold">{serviceObj.name}</strong></p>
                <p className="flex justify-between"><span className="text-gray-500 font-medium">Applicant Name:</span> <strong className="text-gray-900 font-bold">{details.applicantName}</strong></p>
                <p className="flex justify-between"><span className="text-gray-500 font-medium">Primary Phone:</span> <strong className="text-gray-900 font-bold">{details.applicantPhone}</strong></p>
                <p className="flex justify-between"><span className="text-gray-500 font-medium">Email Address:</span> <strong className="text-gray-900 font-bold">{details.applicantEmail}</strong></p>
                {details.address && (
                  <p className="flex justify-between"><span className="text-gray-500 font-medium">Address:</span> <strong className="text-gray-900 font-bold max-w-[240px] text-right">{details.address}</strong></p>
                )}
                {details.idDocNumber && (
                  <p className="flex justify-between"><span className="text-gray-500 font-medium">{details.idDocType}:</span> <strong className="text-gray-900 font-bold">{details.idDocNumber}</strong></p>
                )}
                {details.remarks && (
                  <p className="flex justify-between"><span className="text-gray-500 font-medium">Remarks:</span> <strong className="text-gray-900 font-bold">{details.remarks}</strong></p>
                )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
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

      {/* MODAL: Centered Application Details Popup */}
      {viewModalApp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0f7f2] text-[#12372A] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5 text-[#12372A]" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">
                    Application Details
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">{viewModalApp.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewModalApp(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Application Overview Grid */}
            <div className="bg-[#f8faf9] border border-gray-200/80 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                <span className="font-bold text-[#12372A] text-sm">{viewModalApp.serviceType}</span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#d8ebdd] text-[#12372A]">
                  • {viewModalApp.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-gray-700 font-medium pt-1">
                <div><span className="text-gray-400">Application ID:</span> <span className="font-bold text-gray-900">{viewModalApp.id}</span></div>
                <div><span className="text-gray-400">Submitted On:</span> <span className="font-bold text-gray-900">{viewModalApp.submittedDate}</span></div>
                <div><span className="text-gray-400">Added By:</span> <span className="font-bold text-gray-900">{viewModalApp.addedBy}</span></div>
                <div><span className="text-gray-400">Assigned Officer:</span> <span className="font-bold text-gray-900">{viewModalApp.assignedOfficer || 'Officer Assigned'}</span></div>
                <div><span className="text-gray-400">Processing Time:</span> <span className="font-bold text-gray-900">{viewModalApp.estimatedDays || '7 days'}</span></div>
                <div><span className="text-gray-400">Current Phase:</span> <span className="font-bold text-[#12372A]">Phase {viewModalApp.stepPhase} of 8</span></div>
              </div>
            </div>

            {/* Status Tracker Stepper Nodes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Application Status Tracker</h4>
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center justify-between min-w-[550px] relative py-2">
                  <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 -z-0 rounded-full" />
                  {TRACKER_PHASES.map((phase) => {
                    const isCompleted = phase.step < viewModalApp.stepPhase;
                    const isActive = phase.step === viewModalApp.stepPhase;
                    return (
                      <div key={phase.step} className="flex flex-col items-center text-center space-y-1.5 z-10 w-16">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCompleted
                              ? 'bg-[#12372A] text-white'
                              : isActive
                              ? 'bg-[#12372A] text-white ring-4 ring-gray-300 scale-110'
                              : 'bg-white text-gray-800'
                          }`}
                          style={{
                            border: '2px solid #6b7280',
                            backgroundColor: isCompleted || isActive ? '#12372A' : '#ffffff'
                          }}
                        >
                          {isCompleted ? <Check className="w-4 h-4 text-white stroke-[3]" /> : phase.step}
                        </div>
                        <p className={`text-[10px] font-bold leading-tight ${isActive ? 'text-[#12372A]' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                          {phase.title}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Required Documents Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Required Documents</h4>
              <div className="divide-y divide-gray-100 border border-gray-200/80 rounded-2xl overflow-hidden bg-white">
                {(DETAIL_DOCS_DATA[viewModalApp.id] || SERVICE_REQUIRED_DOCS.passport).map((doc) => (
                  <div key={doc.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-semibold text-gray-800">{doc.name}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 sticky bottom-0 bg-white">
              <button
                onClick={handleDownloadSummary}
                className="px-4 py-2 border border-gray-300 rounded-full bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all shadow-2xs flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span>Download Summary</span>
              </button>
              <button
                onClick={() => setViewModalApp(null)}
                className="px-6 py-2 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-full transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
