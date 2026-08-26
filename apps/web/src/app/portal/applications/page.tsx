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
  History,
  Clock,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  Eye,
  ShieldCheck,
  UserCheck
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
    submittedDate: 'May 12, 2026',
    updatedDate: 'Today, 14:00',
    addedBy: 'You',
    status: 'Verification',
    stepPhase: 3,
    adminRemarks: 'Field inspection completed. Awaiting revenue department clearance.',
    assignedOfficer: 'Officer Rajesh Kumar',
    estimatedDays: '7 days left'
  },
  {
    id: 'AMC-2026-000002',
    serviceType: 'Property Deed Registration',
    submittedDate: 'May 08, 2026',
    updatedDate: '21 March, 14:00',
    addedBy: 'You',
    status: 'Processing',
    stepPhase: 5,
    adminRemarks: 'Documents verified. Stamp duty payment processed.',
    assignedOfficer: 'Officer Piotr Wisni...',
    estimatedDays: '4 days left'
  },
  {
    id: 'AMC-2026-000003',
    serviceType: 'Encumbrance Certificate (EC)',
    submittedDate: 'May 01, 2026',
    updatedDate: '23 March, 11:00',
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
    submittedDate: 'Apr 25, 2026',
    updatedDate: 'May 10, 2026',
    addedBy: 'Admin',
    status: 'Completed',
    stepPhase: 8,
    adminRemarks: 'Passport dispatched via speed post. Tracking ID: SP904128.',
    assignedOfficer: 'Officer Anna Nowak',
    estimatedDays: 'Completed'
  },
  {
    id: 'AMC-2026-000005',
    serviceType: 'Legal Heirship Certificate',
    submittedDate: 'Apr 18, 2026',
    updatedDate: 'May 02, 2026',
    addedBy: 'You',
    status: 'Completed',
    stepPhase: 8,
    adminRemarks: 'Certificate issued successfully.',
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

interface RequiredDocItem {
  id: string;
  name: string;
  required: 'Required' | 'Optional';
  uploadedFile: string;
  uploaded?: 'Yes' | 'No';
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
      adminRemarks: 'Application received and under initial verification.',
      assignedOfficer: 'Officer Rajesh Kumar',
      estimatedDays: '7 days left'
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
      {/* 4 Metric Summary Cards Grid matching Pillio UI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
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

        {/* Card 2 */}
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

        {/* Card 3 */}
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

        {/* Card 4 */}
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

      {/* Main Container Card matching Pillio UI */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-6">
        {/* Top Control Bar inside Main Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Pill Tab Bar */}
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

          {/* Action Button */}
          {mode === 'list' && (
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
          )}
        </div>

        {/* LIST VIEW: 3-Column Card Grid matching Pillio UI */}
        {mode === 'list' && (
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
                    {/* Top Row: Icon + Title + Status Tag */}
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

                      {/* Status Tag */}
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

                    {/* Progress Track Bar Section */}
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

                    {/* Footer Metadata & Arrow Circle Action Button */}
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
                        title="View Details"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* WIZARD MODE: Create New Application */}
        {mode === 'create' && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
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

            {/* Stepper Header */}
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

            {/* Step 1: Select Service */}
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

            {/* Step 2: Applicant Info */}
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

            {/* Step 3: Upload Documents */}
            {currentStep === 3 && (
              <div className="max-w-2xl mx-auto space-y-3 text-xs">
                {requiredDocs.map((doc) => (
                  <div key={doc.id} className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{doc.name}</h4>
                      <p className="text-[11px] text-gray-400">
                        {doc.status === 'Uploaded' ? `Uploaded: ${doc.uploadedFile}` : 'Not Uploaded Yet'}
                      </p>
                    </div>
                    <label className="px-4 py-2 bg-[#12372A] text-white rounded-full font-bold text-xs cursor-pointer hover:bg-[#1a4a38] transition-colors">
                      <span>Upload</span>
                      <input type="file" onChange={(e) => handleFileUploadInWizard(doc.id, e)} className="hidden" />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Review & Submit */}
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

            {/* Step Control Buttons */}
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

        {/* VIEW MODE: Detailed Application Drawer */}
        {mode === 'view' && selectedApp && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold text-[#12372A] uppercase tracking-wider">{selectedApp.id}</span>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">{selectedApp.serviceType}</h2>
              </div>
              <button
                onClick={() => setMode('list')}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100"
              >
                Close View
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <p className="text-gray-500 font-medium">Current Status</p>
                <p className="text-sm font-bold text-[#12372A]">{selectedApp.status}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <p className="text-gray-500 font-medium">Assigned Officer</p>
                <p className="text-sm font-bold text-gray-900">{selectedApp.assignedOfficer || 'Officer Rajesh Kumar'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <p className="text-gray-500 font-medium">Estimated Time</p>
                <p className="text-sm font-bold text-gray-900">{selectedApp.estimatedDays || '7 days left'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-3">
              <h4 className="font-bold text-sm text-gray-900">Official Admin Remarks</h4>
              <p className="text-xs text-gray-700 leading-relaxed">{selectedApp.adminRemarks}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
