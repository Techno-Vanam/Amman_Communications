'use client';

import React, { useState } from 'react';
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
  History
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
}

const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'AMC-2026-000001',
    serviceType: 'Passport Renewal',
    submittedDate: '18 May 2026',
    updatedDate: '21 May 2026',
    addedBy: 'You',
    status: 'Verification',
    stepPhase: 3,
    adminRemarks: 'Document image is blurred. Please re-upload a cleaner copy.'
  },
  {
    id: 'AMC-2026-000002',
    serviceType: 'Property Registration',
    submittedDate: '15 May 2026',
    updatedDate: '16 May 2026',
    addedBy: 'Admin',
    status: 'Documents Received',
    stepPhase: 2,
    adminRemarks: 'All initial deeds received. Verification queued.'
  },
  {
    id: 'AMC-2026-000003',
    serviceType: 'Driving License',
    submittedDate: '10 May 2026',
    updatedDate: '12 May 2026',
    addedBy: 'You',
    status: 'Processing',
    stepPhase: 4,
    adminRemarks: 'RTO verification in progress.'
  },
  {
    id: 'AMC-2026-000004',
    serviceType: 'PAN Card',
    submittedDate: '05 May 2026',
    updatedDate: '08 May 2026',
    addedBy: 'Admin',
    status: 'Awaiting Approval',
    stepPhase: 6,
    adminRemarks: 'Pending final sign-off from authority officer.'
  },
  {
    id: 'AMC-2026-000005',
    serviceType: 'Aadhaar Update',
    submittedDate: '01 May 2026',
    updatedDate: '04 May 2026',
    addedBy: 'You',
    status: 'Completed',
    stepPhase: 8,
    adminRemarks: 'Certificate ready for download.'
  },
];

const SERVICES = [
  { id: 'passport', name: 'Passport Renewal', icon: BookOpen, desc: 'Complete passport renewal application, fresh issuance, and verification support.' },
  { id: 'property', name: 'Property Registration', icon: Home, desc: 'Property title deed verification, EC certificate processing, and revenue clearance.' },
  { id: 'dl', name: 'Driving License', icon: Car, desc: 'New driving license application, renewal, and RTO slot booking assistance.' },
  { id: 'pan', name: 'PAN Card', icon: CreditCard, desc: 'Fresh PAN card issuance, updates, and correction of identity details.' },
  { id: 'aadhaar', name: 'Aadhaar Update', icon: Fingerprint, desc: 'Aadhaar address update, mobile number linking, and biometric updates.' },
  { id: 'ec_patta', name: 'EC / Patta / Chitta', icon: FileText, desc: 'Encumbrance Certificate issuance, Patta transfer extract, and land records.' },
  { id: 'legal', name: 'Legal & Affidavit', icon: Scale, desc: 'Legal heirship affidavit preparation, notary attestation, and legal consultation.' },
  { id: 'other', name: 'Other Services', icon: MoreHorizontal, desc: 'Custom documentation, income certificate, and general government service help.' },
];

const WIZARD_STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Documents' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Success' },
];

const TRACKER_STEPS = [
  { step: 1, title: 'Application Submitted', date: '18 May 2026' },
  { step: 2, title: 'Documents Received', date: '19 May 2026' },
  { step: 3, title: 'Verification', date: '' },
  { step: 4, title: 'Processing', date: '' },
  { step: 5, title: 'Government Submission', date: '' },
  { step: 6, title: 'Awaiting Approval', date: '' },
  { step: 7, title: 'Completed', date: '' },
  { step: 8, title: 'Ready for Collection', date: '' },
];

interface RequiredDocItem {
  id: string;
  name: string;
  required: 'Required' | 'Optional';
  uploadedFile: string;
  uploaded: 'Yes' | 'No';
  status: 'Under Review' | 'Approved' | 'Not Uploaded';
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

  // History modal toggle
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Wizard Details
  const [details, setDetails] = useState({
    applicantName: 'John Doe',
    applicantPhone: '+91 98765 43210',
    applicantEmail: 'john@example.com',
    refNumber: '',
    remarks: 'Urgent processing requested.'
  });

  const [requiredDocs, setRequiredDocs] = useState([
    { id: 'd1', name: 'Aadhaar Card', required: 'Required', uploadedFile: '-', status: 'Not Uploaded' },
    { id: 'd2', name: 'PAN Card', required: 'Required', uploadedFile: '-', status: 'Not Uploaded' },
    { id: 'd3', name: 'Sale Deed', required: 'Required', uploadedFile: '-', status: 'Not Uploaded' },
    { id: 'd4', name: 'EC Certificate', required: 'Required', uploadedFile: '-', status: 'Not Uploaded' },
    { id: 'd5', name: 'Passport Photo', required: 'Required', uploadedFile: '-', status: 'Not Uploaded' },
    { id: 'd6', name: 'Any Supporting Document', required: 'Optional', uploadedFile: '-', status: 'Not Uploaded' },
  ]);

  const serviceObj = SERVICES.find((s) => s.id === selectedService) || SERVICES[0];

  const getStatusBadgeClass = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'Verification':
        return 'bg-[#d8ebdd] text-[#12372A] border border-[#a8d5b9]';
      case 'Documents Received':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Processing':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'Awaiting Approval':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleOpenView = (app: ApplicationItem) => {
    setSelectedApp(app);
    setMode('view');
  };

  const handleFileUploadInWizard = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setRequiredDocs(
        requiredDocs.map((doc) =>
          doc.id === docId
            ? { ...doc, uploadedFile: fileName, status: 'Uploaded' }
            : doc
        )
      );
      showToast('Document Attached Successfully!', `${fileName} has been added.`);
    }
  };

  const handleDeleteFileInWizard = (docId: string) => {
    setRequiredDocs(
      requiredDocs.map((doc) =>
        doc.id === docId
          ? { ...doc, uploadedFile: '-', status: 'Not Uploaded' }
          : doc
      )
    );
  };

  const handleFinishCreate = () => {
    const newId = `AMC-2026-00000${applications.length + 1}`;
    const newApp: ApplicationItem = {
      id: newId,
      serviceType: serviceObj.name,
      submittedDate: 'Just now',
      updatedDate: 'Just now',
      addedBy: 'You',
      status: 'Verification',
      stepPhase: 3,
      adminRemarks: 'Application received and under initial verification.'
    };
    setApplications([newApp, ...applications]);
    setMode('list');
    setCurrentStep(1);
    showToast('Application Submitted Successfully!', `Application ${newId} registered for verification.`);
  };

  const currentDetailDocs = (selectedApp && DETAIL_DOCS_DATA[selectedApp.id]) || [
    { id: 'd1', name: 'Aadhaar Card', required: 'Required', uploadedFile: 'Aadhaar.pdf', uploaded: 'Yes', status: 'Under Review' },
    { id: 'd2', name: 'PAN Card', required: 'Required', uploadedFile: 'PAN.jpg', uploaded: 'Yes', status: 'Approved' },
    { id: 'd3', name: 'Passport Photo', required: 'Required', uploadedFile: 'Photo.jpg', uploaded: 'Yes', status: 'Approved' },
    { id: 'd4', name: 'Old Passport (if any)', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
    { id: 'd5', name: 'Any Supporting Document', required: 'Optional', uploadedFile: '-', uploaded: 'No', status: 'Not Uploaded' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
      {/* MODE 1: MAIN TABLE LIST VIEW */}
      {mode === 'list' && (
        <>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                My Applications
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Track all your applications
              </p>
            </div>

            <button
              onClick={() => {
                setMode('create');
                setCurrentStep(1);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-xl transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#a8d5b9]" />
              <span>+ Add New Application</span>
            </button>
          </div>

          {/* Applications Data Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                    <th className="py-3.5 px-4">Application ID</th>
                    <th className="py-3.5 px-4">Service Type</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Added By</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-gray-900">
                        {app.id}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">
                        {app.serviceType}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {app.submittedDate}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-700">
                        {app.addedBy}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full ${getStatusBadgeClass(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleOpenView(app)}
                          className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all shadow-2xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Information Note Banner */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3 text-xs text-gray-600">
            <Info className="w-4 h-4 text-gray-400 shrink-0" />
            <p>
              <strong>Note:</strong> Click on &quot;View&quot; to see detailed status, required documents, history and payments.
            </p>
          </div>
        </>
      )}

      {/* MODE 2: APPLICATION DETAIL + TRACKING VIEW (Matching Attached Screenshot) */}
      {mode === 'view' && selectedApp && (
        <div className="space-y-6">
          {/* Top Breadcrumb & Download Summary Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <button
                onClick={() => setMode('list')}
                className="hover:text-[#12372A] hover:underline transition-colors flex items-center gap-1 font-bold text-gray-800"
              >
                My Applications
              </button>
              <span>&gt;</span>
              <span className="font-bold text-gray-900 font-mono">{selectedApp.id}</span>
            </div>

            <button
              onClick={() => alert(`Downloading Application Summary for ${selectedApp.id}...`)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-[#12372A]" />
              <span>Download Application Summary</span>
            </button>
          </div>

          {/* Top Grid (2 Cards: Application Info & Current Status) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Application Info (8/12) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                Application Info
              </h2>

              <div className="space-y-2.5 text-xs font-medium text-gray-800 max-w-lg">
                <div className="flex items-center">
                  <span className="w-36 text-gray-500">Application ID</span>
                  <span className="font-mono font-bold text-gray-900">: {selectedApp.id}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 text-gray-500">Service Type</span>
                  <span className="font-bold text-[#12372A]">: {selectedApp.serviceType}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 text-gray-500">Submitted On</span>
                  <span className="text-gray-900">: {selectedApp.submittedDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 text-gray-500">Added By</span>
                  <span className="text-gray-900">: {selectedApp.addedBy}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Current Status (4/12) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between items-center text-center">
              <h2 className="text-base font-bold text-gray-900 self-start pb-2">
                Current Status
              </h2>

              <div className="my-auto py-3">
                <span className={`inline-block px-6 py-2.5 rounded-xl text-base font-bold shadow-2xs ${getStatusBadgeClass(selectedApp.status)}`}>
                  {selectedApp.status}
                </span>
                <p className="text-[11px] text-gray-500 mt-2 font-medium">
                  Updated on: {selectedApp.updatedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Middle Section: Application Status Tracker (8 Steps Timeline) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-gray-900">
              Application Status Tracker
            </h2>

            <div className="overflow-x-auto pb-4">
              <div className="min-w-[800px] flex items-center justify-between relative px-4">
                {/* Connector Line */}
                <div className="absolute top-5 left-[5%] right-[5%] h-0.5 bg-gray-200 -z-0" />

                {TRACKER_STEPS.map((stepItem) => {
                  const isDone = stepItem.step < selectedApp.stepPhase;
                  const isCurrent = stepItem.step === selectedApp.stepPhase;

                  return (
                    <div key={stepItem.step} className="relative z-10 flex flex-col items-center text-center max-w-[90px]">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-2xs
                          ${isDone
                            ? 'bg-[#12372A] text-white border-2 border-[#12372A]'
                            : isCurrent
                            ? 'bg-blue-600 text-white border-2 border-blue-600 ring-4 ring-blue-50'
                            : 'bg-white text-gray-400 border-2 border-gray-200'
                          }
                        `}
                      >
                        {isDone ? <Check className="w-5 h-5 text-[#a8d5b9]" /> : stepItem.step}
                      </div>

                      <span
                        className={`mt-2 text-[11px] leading-tight font-semibold ${
                          isCurrent
                            ? 'text-blue-600 font-bold'
                            : isDone
                            ? 'text-[#12372A] font-bold'
                            : 'text-gray-400'
                        }`}
                      >
                        {stepItem.title}
                      </span>
                      {stepItem.date && (
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          {stepItem.date}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Grid (Left: Documents Required Table | Right: Admin Remarks & History) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Documents Required Table (8/12) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                Documents Required
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                      <th className="py-3 px-3">Document</th>
                      <th className="py-3 px-3">Required</th>
                      <th className="py-3 px-3">Uploaded</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
                    {currentDetailDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-3 font-bold text-gray-900">
                          {doc.name}
                        </td>
                        <td className="py-3.5 px-3 text-gray-500">
                          {doc.required}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-gray-700">
                          {doc.uploaded}
                        </td>
                        <td className="py-3.5 px-3">
                          {doc.status === 'Approved' ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333]">
                              Approved
                            </span>
                          ) : doc.status === 'Under Review' ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                              Under Review
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              Not Uploaded
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {doc.uploaded === 'Yes' ? (
                            <button
                              onClick={() => alert(`Previewing ${doc.name}...`)}
                              className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-[11px] rounded-lg transition-colors"
                            >
                              View
                            </button>
                          ) : (
                            <button
                              onClick={() => alert(`Uploading ${doc.name}...`)}
                              className="px-3 py-1 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-[11px] rounded-lg transition-colors shadow-2xs"
                            >
                              Upload
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Stacked Cards (Admin Remarks & Application History) (4/12) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Admin Remarks Card */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-3">
                <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                  Admin Remarks
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {selectedApp.adminRemarks || 'No admin notes at this time.'}
                </p>
              </div>

              {/* Application History Card */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
                <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                  Application History
                </h2>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="w-full py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4 text-[#12372A]" />
                  <span>View Full History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: WIZARD MODE: Add New Application */}
      {mode === 'create' && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Add New Application
            </h1>
            <button
              onClick={() => setMode('list')}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 underline"
            >
              Back to Applications List
            </button>
          </div>

          {/* 5-Step Stepper Progress Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 overflow-hidden">
            <div className="flex items-center justify-between max-w-3xl mx-auto relative px-5">
              {/* Background Track Line */}
              <div className="absolute top-5 left-9 right-9 h-1 bg-gray-200 -z-0 rounded-full" />

              {/* Animated Active Progress Line */}
              <div
                className="absolute top-5 left-9 h-1 bg-gradient-to-r from-[#12372A] via-[#1b4d3a] to-[#2d6a4f] -z-0 rounded-full transition-all duration-700 ease-in-out shadow-sm"
                style={{
                  width: `calc(${((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100}% - ${
                    ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 36
                  }px)`
                }}
              />

              {WIZARD_STEPS.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center group">
                    <button
                      onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                      disabled={step.id > currentStep}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 transform
                        ${isCompleted
                          ? 'bg-[#12372A] text-white border-2 border-[#12372A] shadow-md scale-100'
                          : isCurrent
                          ? 'bg-white text-[#12372A] border-2 border-[#12372A] ring-4 ring-[#12372A]/20 scale-110 shadow-md animate-step-pulse'
                          : 'bg-white text-gray-400 border-2 border-gray-200 scale-95 hover:border-gray-300'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-[#a8d5b9] animate-tick-pop stroke-[3]" />
                      ) : (
                        <span className={`transition-transform duration-300 ${isCurrent ? 'scale-110 font-extrabold' : ''}`}>
                          {step.id}
                        </span>
                      )}
                    </button>
                    <span
                      className={`mt-2 text-xs transition-all duration-300 tracking-wide ${
                        isCurrent
                          ? 'text-[#12372A] font-bold scale-105'
                          : isCompleted
                          ? 'text-gray-800 font-semibold'
                          : 'text-gray-400 font-normal'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Content Container */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-8">
            {/* STEP 1: Select Service */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Step 1: Select Service</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the service you want to apply for.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Select Service</label>

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
                                : 'bg-gray-100 text-gray-700 group-hover:bg-[#12372A]/10 group-hover:text-[#12372A]'
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

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900">Service Description</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {serviceObj.desc}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Step 2: Application Details</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Provide applicant details for <strong className="text-[#12372A]">{serviceObj.name}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Applicant Full Name</label>
                    <input
                      type="text"
                      value={details.applicantName}
                      onChange={(e) => setDetails({ ...details, applicantName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-sm text-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      value={details.applicantPhone}
                      onChange={(e) => setDetails({ ...details, applicantPhone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-sm text-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={details.applicantEmail}
                      onChange={(e) => setDetails({ ...details, applicantEmail: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-sm text-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Reference Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. EC-88210-2026"
                      value={details.refNumber}
                      onChange={(e) => setDetails({ ...details, refNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-sm text-gray-800"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Additional Remarks</label>
                    <textarea
                      rows={3}
                      value={details.remarks}
                      onChange={(e) => setDetails({ ...details, remarks: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#12372A] text-sm text-gray-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Required Documents Table */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Step 3: Required Documents</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload the documents required for the selected service.
                  </p>
                </div>

                <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50/70">
                        <th className="py-3 px-4">Document Name</th>
                        <th className="py-3 px-4">Required</th>
                        <th className="py-3 px-4">Upload</th>
                        <th className="py-3 px-4">Uploaded File</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
                      {requiredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50/50">
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            {doc.name}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">
                            {doc.required}
                          </td>
                          <td className="py-3.5 px-4">
                            <label className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[11px] font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs">
                              <span>Choose File</span>
                              <input
                                type="file"
                                onChange={(e) => handleFileUploadInWizard(doc.id, e)}
                                className="hidden"
                              />
                            </label>
                          </td>
                          <td className="py-3.5 px-4 text-gray-700 font-mono">
                            {doc.uploadedFile}
                          </td>
                          <td className="py-3.5 px-4">
                            {doc.status === 'Uploaded' ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333]">
                                Uploaded
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                Not Uploaded
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {doc.status === 'Uploaded' ? (
                              <button
                                onClick={() => handleDeleteFileInWizard(doc.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                                title="Remove file draft"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-gray-500 font-medium">
                  Supported formats: PDF, JPG, PNG | Max file size: 10MB
                </p>
              </div>
            )}

            {/* STEP 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Step 4: Review Application</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Please review your application summary before final submission.
                  </p>
                </div>

                <div className="bg-[#f0f7f2] border border-[#a8d5b9] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                    <span className="text-xs text-gray-600 font-medium">Applied Service</span>
                    <span className="text-sm font-bold text-[#12372A]">{serviceObj.name}</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                    <span className="text-xs text-gray-600 font-medium">Applicant Name</span>
                    <span className="text-sm font-bold text-gray-900">{details.applicantName}</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                    <span className="text-xs text-gray-600 font-medium">Contact Number</span>
                    <span className="text-sm font-bold text-gray-900">{details.applicantPhone}</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#a8d5b9]/50">
                    <span className="text-xs text-gray-600 font-medium">Uploaded Files</span>
                    <span className="text-sm font-bold text-gray-900">
                      {requiredDocs.filter((d) => d.status === 'Uploaded').length} of {requiredDocs.length} files uploaded
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Processing SLA</span>
                    <span className="text-sm font-bold text-[#12372A]">3-5 Business Days</span>
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
                <h2 className="text-2xl font-bold text-gray-900">Application Submitted Successfully!</h2>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Your Application ID is <strong className="text-[#12372A] font-mono">AMC-2026-00000{applications.length + 1}</strong>. Current status is set to <strong className="text-blue-600 font-semibold">Verification</strong>.
                </p>

                <div className="pt-6">
                  <button
                    onClick={handleFinishCreate}
                    className="px-6 py-3 bg-[#12372A] hover:bg-[#1a4a38] text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                  >
                    Back to Applications List
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            {currentStep < 5 && (
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-xs rounded-full hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    onClick={() => setMode('list')}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-xs rounded-full hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}

                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-8 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-full transition-all shadow-sm flex items-center gap-2"
                >
                  <span>{currentStep === 4 ? 'Submit Application' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4 text-[#a8d5b9]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Log Modal */}
      {showHistoryModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Application History Log
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Status changed to &quot;{selectedApp.status}&quot;</p>
                  <p className="text-gray-500 text-[11px]">{selectedApp.updatedDate} by System</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Documents Submitted</p>
                  <p className="text-gray-500 text-[11px]">19 May 2026 by {selectedApp.addedBy}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-[#12372A] mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Application Created ({selectedApp.id})</p>
                  <p className="text-gray-500 text-[11px]">{selectedApp.submittedDate} by {selectedApp.addedBy}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-[#12372A] text-white text-xs font-bold rounded-xl"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
