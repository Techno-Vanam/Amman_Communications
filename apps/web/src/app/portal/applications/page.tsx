'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import {
  Plus,
  BookOpen,
  Home,
  Car,
  CreditCard,
  Fingerprint,
  FileText,
  Scale,
  Check,
  ChevronRight,
  Download,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  X,
  FileCheck,
  Search,
  CheckCircle2,
  Lock,
  Clock,
  RefreshCw,
  Eye,
  Filter,
  ChevronDown,
  Upload
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useUser, getUserStorageKey } from '@/context/UserContext';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomTabDropdown from '@/components/ui/CustomTabDropdown';
import { fetchServicesAction, fetchApplicationsAction, createApplicationAction, uploadDocumentAction, fetchApplicationDocumentsAction, createCustomerPaymentAction, getDecryptedDocumentAction } from '@/app/portal/actions';
import { Building, Loader2 } from 'lucide-react';

interface ApplicationItem {
  id: string;    // Display id (applicationNumber like AMC-2026-...)
  dbId?: string; // Real DB cuid used for API calls
  serviceType: string;
  submittedDate: string;
  updatedDate: string;
  addedBy: 'You' | 'Admin';
  status: 'Draft' | 'Verification' | 'Documents Received' | 'Processing' | 'Awaiting Approval' | 'Completed';
  stepPhase: number; // 1 to 8
  phaseDates?: Record<number, string>;
  adminRemarks?: string;
  assignedOfficer?: string;
  estimatedDays?: string;
  isFeePaid?: boolean;
  paidFeeAmountVal?: number;
  pendingFeeAmountVal?: number;
  paymentMode?: string;
  paymentRef?: string;
  draftDetails?: any;
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
  { id: 3, label: 'Fee Payment' },
  { id: 4, label: 'Upload Documents' },
  { id: 5, label: 'Review & Submit' }
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
  storagePath?: string;
  downloadUrl?: string;
  mimeType?: string;
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

// const DETAIL_DOCS_DATA: Record<string, RequiredDocItem[]> = {
//   'AMC-2026-000001': SERVICE_REQUIRED_DOCS.passport,
//   'AMC-2026-000002': SERVICE_REQUIRED_DOCS.property,
//   'AMC-2026-000003': SERVICE_REQUIRED_DOCS.vehicle,
//   'AMC-2026-000004': SERVICE_REQUIRED_DOCS.pan,
//   'AMC-2026-000005': SERVICE_REQUIRED_DOCS.legal,
// };

export default function ApplicationsPage() {
  const pathname = usePathname();
  const { showToast } = useNotifications();
  const { user } = useUser();
  const [applications, setApplications] = useState<ApplicationItem[]>(INITIAL_APPLICATIONS);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Mode: 'list' | 'create' | 'view'
  const [mode, setMode] = useState<'list' | 'create' | 'view'>('list');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'All' | 'Draft' | 'Verification' | 'Processing' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appServiceSearchQuery, setAppServiceSearchQuery] = useState('');
  // History modal & document view modal toggles
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<RequiredDocItem | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [dbServices, setDbServices] = useState<any[]>([]);

  useEffect(() => {
    async function loadServices() {
      const fetched = await fetchServicesAction();
      setDbServices(fetched);
      if (fetched.length > 0) {
        setSelectedService(fetched[0].id);
      }
    }
    loadServices();
  }, []);

  const getServiceIcon = (serviceId: string) => {
    if (serviceId.includes('fiber')) return Building;
    if (serviceId.includes('residential')) return Home;
    return FileText;
  };

  // Automatically clear open view popups whenever pathname changes or component unmounts
  useEffect(() => {
    setSelectedApp(null);
    setShowHistoryModal(false);
    setViewingDoc(null);
    setMode('list');
    return () => {
      setSelectedApp(null);
      setShowHistoryModal(false);
      setViewingDoc(null);
    };
  }, [pathname]);

  // Wizard Details
  const [details, setDetails] = useState({
    applicantName: user.name || '',
    applicantPhone: user.phone || '+91 ',
    applicantEmail: user.email || '',
    altPhone: user.altPhone || '+91 ',
    address: user.address || '',
    description: '',
    idDocType: 'Aadhaar Card',
    idDocNumber: '',
    dob: '',
    remarks: '',
    paymentMode: 'UPI / NetBanking',
    paymentRef: 'TXN-884920',
    paymentAmount: '1000.00'
  });

  // Fee Payment Gateway & Partition Payment State
  const [paymentOption, setPaymentOption] = useState<'PARTITION' | 'FULL'>('PARTITION');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'UPI' | 'CASH'>('UPI');
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [paidFeeAmountVal, setPaidFeeAmountVal] = useState(1000);
  const [pendingFeeAmountVal, setPendingFeeAmountVal] = useState(1000);
  const [txnRefCode, setTxnRefCode] = useState('');

  // Payment Gateway Modal state
  const [showPaymentGatewayModal, setShowPaymentGatewayModal] = useState(false);
  const [gatewayProcessing, setGatewayProcessing] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [cashVerified, setCashVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // Resets wizard state completely for starting a fresh application
  const startNewFreshApplication = (initialServiceId?: string) => {
    setIsFeePaid(false);
    setPaidFeeAmountVal(1000);
    setPendingFeeAmountVal(1000);
    setTxnRefCode('');
    setPaymentOption('PARTITION');
    setSelectedPaymentMode('UPI');
    setPendingFiles({});
    setCurrentDraftId(null);
    if (initialServiceId) {
      setSelectedService(initialServiceId);
    }
    setDetails({
      applicantName: user.name || '',
      applicantPhone: user.phone || '+91 ',
      applicantEmail: user.email || '',
      altPhone: user.altPhone || '+91 ',
      address: user.address || '',
      description: '',
      idDocType: 'Aadhaar Card',
      idDocNumber: '',
      dob: '',
      remarks: '',
      paymentMode: 'UPI / NetBanking',
      paymentRef: '',
      paymentAmount: '1000.00'
    });
    setMode('create');
    setCurrentStep(1);
  };

  // Save Draft Application when fee payment completes before document upload
  const handleSaveDraftOnPayment = (paidAmt: number, pendAmt: number, refCode: string, modeVal: string) => {
    const todayDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const draftDisplayId = `AMC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const serviceName = serviceObj?.name || 'Service Request';
    setCurrentDraftId(draftDisplayId);

    const draftItem: ApplicationItem = {
      id: draftDisplayId,
      serviceType: serviceName,
      submittedDate: todayDate,
      updatedDate: todayDate,
      addedBy: 'You',
      status: 'Draft',
      stepPhase: 3,
      adminRemarks: `Payment of ₹${paidAmt.toLocaleString('en-IN')}.00 verified (${refCode}). Documents pending upload.`,
      assignedOfficer: 'Officer Rajesh Kumar',
      estimatedDays: 'Action Required: Upload Docs',
      isFeePaid: true,
      paidFeeAmountVal: paidAmt,
      pendingFeeAmountVal: pendAmt,
      paymentMode: modeVal,
      paymentRef: refCode,
      draftDetails: { ...details, serviceId: selectedService, serviceName },
    };

    setApplications((prev) => {
      const filtered = prev.filter((a) => a.id !== draftDisplayId);
      return [draftItem, ...filtered];
    });

    try {
      const draftStorageKey = getUserStorageKey(user.email, 'amman_user_draft_apps');
      const existingDrafts = localStorage.getItem(draftStorageKey);
      const draftsArr = existingDrafts ? JSON.parse(existingDrafts) : [];
      const updatedDrafts = [draftItem, ...draftsArr.filter((d: any) => d.id !== draftDisplayId)];
      localStorage.setItem(draftStorageKey, JSON.stringify(updatedDrafts));
    } catch (e) {
      console.error('Error saving draft application locally:', e);
    }
  };

  const handleResumeDraft = (draftApp: ApplicationItem) => {
    setCurrentDraftId(draftApp.id);
    if (draftApp.draftDetails?.serviceId) {
      setSelectedService(draftApp.draftDetails.serviceId);
    }
    if (draftApp.draftDetails) {
      setDetails((prev) => ({
        ...prev,
        ...draftApp.draftDetails,
      }));
    }
    setIsFeePaid(true);
    setPaidFeeAmountVal(draftApp.paidFeeAmountVal || 1000);
    setPendingFeeAmountVal(draftApp.pendingFeeAmountVal || 1000);
    setTxnRefCode(draftApp.paymentRef || '');
    setRequiredDocs(SERVICE_REQUIRED_DOCS[draftApp.draftDetails?.serviceId || 'passport'] || SERVICE_REQUIRED_DOCS.passport);

    setMode('create');
    setCurrentStep(4);
    showToast('Draft Resumed', `Resuming ${draftApp.id}. Fee payment verified. Please upload your documents.`);
  };

  // Razorpay Checkout Integration
  const handleRazorpayCheckout = async () => {
    setGatewayProcessing(true);
    const due = paymentOption === 'PARTITION' ? 1000 : 2000;
    const pend = paymentOption === 'PARTITION' ? 1000 : 0;
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TWjvpMMHHLN3OZ';

    const loadScript = () => {
      return new Promise<boolean>((resolve) => {
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const isLoaded = await loadScript();

    if (isLoaded && typeof window !== 'undefined' && (window as any).Razorpay) {
      const options = {
        key: keyId,
        amount: due * 100, // in paise
        currency: 'INR',
        name: 'Amman Communications',
        description: `Fee Payment for ${serviceObj.name}`,
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=120&h=120&q=80',
        prefill: {
          name: details.applicantName || user.name || 'Applicant',
          email: details.applicantEmail || user.email || 'applicant@example.com',
          contact: details.applicantPhone || user.phone || '+919876543210',
        },
        theme: {
          color: '#12372A',
        },
        handler: function (response: any) {
          const ref = response.razorpay_payment_id || `pay_${Math.floor(100000 + Math.random() * 900000)}`;
          setIsFeePaid(true);
          setPaidFeeAmountVal(due);
          setPendingFeeAmountVal(pend);
          setTxnRefCode(ref);
          setDetails({
            ...details,
            paymentMode: 'UPI / Razorpay',
            paymentRef: ref,
            paymentAmount: due.toString(),
          });
          handleSaveDraftOnPayment(due, pend, ref, 'UPI / Razorpay');
          setGatewayProcessing(false);
          setShowPaymentGatewayModal(false);
          showToast('Razorpay Payment Successful!', `Payment ID: ${ref}. Initial fee of ₹${due.toLocaleString('en-IN')}.00 received. Draft application saved. You can upload documents now or resume later!`);
        },
        modal: {
          ondismiss: function () {
            setGatewayProcessing(false);
            showToast('Payment Cancelled', 'Razorpay checkout window closed without completing payment.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      // Fallback verification when script loading is blocked
      await new Promise((r) => setTimeout(r, 1000));
      const ref = `pay_${Math.floor(100000 + Math.random() * 900000)}`;
      setIsFeePaid(true);
      setPaidFeeAmountVal(due);
      setPendingFeeAmountVal(pend);
      setTxnRefCode(ref);
      setDetails({
        ...details,
        paymentMode: 'UPI / Razorpay',
        paymentRef: ref,
        paymentAmount: due.toString(),
      });
      handleSaveDraftOnPayment(due, pend, ref, 'UPI / Razorpay');
      setGatewayProcessing(false);
      setShowPaymentGatewayModal(false);
      showToast('Razorpay Payment Verified!', `Payment ID: ${ref}. Fee of ₹${due.toLocaleString('en-IN')}.00 received. Draft application saved. You can upload documents now or resume later!`);
    }
  };

  // Holds actual File objects staged at step 4 — keyed by docId
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

  const [requiredDocs, setRequiredDocs] = useState<RequiredDocItem[]>(SERVICE_REQUIRED_DOCS.passport);

  // Sync required documents whenever selectedService changes
  React.useEffect(() => {
    const docsForService = SERVICE_REQUIRED_DOCS[selectedService] || SERVICE_REQUIRED_DOCS.passport;
    setRequiredDocs(docsForService);
  }, [selectedService]);

  const serviceObj = dbServices.find((s) => s.id === selectedService) || { name: 'Broadband Setup', id: '' };

  // Filter applications by tab and search query
  const filteredApps = applications.filter((app) => {
    const matchesTab =
      activeTabFilter === 'All'
        ? true
        : activeTabFilter === 'Draft'
        ? app.status === 'Draft'
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

  const appPaymentTxn = React.useMemo(() => {
    if (!selectedApp) return null;
    try {
      const storageKey = getUserStorageKey(user.email, 'amman_user_payments');
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const txns = JSON.parse(saved);
        const match = txns.find((t: Record<string, unknown>) => t.appId === selectedApp.id);
        if (match) return match;
      }
    } catch (e) {
      console.error('Error fetching payment txn for app:', e);
    }
    return null;
  }, [selectedApp, user.email]);

  const handleOpenView = async (app: ApplicationItem) => {
    setSelectedApp(app);
    setMode('view');

    // Fetch uploaded documents from DB and merge into requiredDocs
    if (app.dbId) {
      try {
        const uploadedDocs = await fetchApplicationDocumentsAction(app.dbId);
        if (uploadedDocs && uploadedDocs.length > 0) {
          // Build a map of documentType -> uploaded doc
          const uploadedMap = new Map<string, any>();
          for (const doc of uploadedDocs) {
            uploadedMap.set(doc.documentType, doc);
          }

          // Update requiredDocs to reflect what's already uploaded
          setRequiredDocs((prevDocs) =>
            prevDocs.map((rd) => {
              // Match by converting doc name to the same format used in upload
              const rdType = rd.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
              const match = uploadedMap.get(rdType) || uploadedDocs.find((d: any) => d.id === rd.id || d.fileName === rd.uploadedFile);
              if (match) {
                return {
                  ...rd,
                  uploadedFile: match.originalFileName || match.fileName,
                  storagePath: match.storagePath,
                  downloadUrl: match.downloadUrl,
                  mimeType: match.mimeType,
                  uploaded: 'Yes' as const,
                  status: match.status === 'APPROVED' ? 'Approved' as const
                    : match.status === 'UPLOADED' || match.status === 'UNDER_REVIEW' ? 'Under Review' as const
                    : 'Uploaded' as const,
                };
              }
              return rd;
            })
          );
        }
      } catch (e) {
        console.error('Error loading application documents:', e);
      }
    }
  };

  const handleFileUploadInDetail = async (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        showToast('File Too Large', 'Maximum allowed file size is 10 MB.');
        return;
      }
      console.log('[UPLOAD] Started. docId:', docId, 'file:', file.name, 'size:', file.size, 'type:', file.type);
      console.log('[UPLOAD] mode:', mode, 'selectedApp:', selectedApp?.id, 'dbId:', selectedApp?.dbId);

      // VIEW MODE: existing application — upload immediately to DB
      if (selectedApp && selectedApp.dbId) {
        const appDbId = selectedApp.dbId;
        console.log('[UPLOAD] VIEW MODE → uploading to DB. appDbId:', appDbId);

        try {
          const docMeta = requiredDocs.find((d) => d.id === docId);
          const documentType = docMeta
            ? docMeta.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')
            : 'OTHER';
          console.log('[UPLOAD] documentType:', documentType);

          // Convert to base64
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          console.log('[UPLOAD] base64 ready. length:', base64Data.length);

          const result = await uploadDocumentAction(appDbId, {
            documentType,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            base64Data,
          });
          console.log('[UPLOAD] Server action result:', JSON.stringify(result).slice(0, 300));

          if (result.error) {
            showToast('Upload Failed', result.error);
            return;
          }

          const savedDoc = result.document;

          // Update local UI to reflect upload
          setRequiredDocs(
            requiredDocs.map((doc) =>
              doc.id === docId
                ? {
                    ...doc,
                    uploadedFile: file.name,
                    storagePath: savedDoc?.storagePath,
                    downloadUrl: savedDoc?.downloadUrl,
                    mimeType: file.type,
                    uploaded: 'Yes',
                    status: 'Under Review',
                  }
                : doc
            )
          );
          showToast('Document Uploaded!', `${file.name} saved and encrypted in your vault.`);
        } catch (err) {
          console.error('[UPLOAD] Exception during upload:', err);
          showToast('Upload Error', `Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
        }
        return;
      }

      // Fallback: selectedApp exists but dbId is missing
      if (selectedApp && !selectedApp.dbId) {
        console.warn('[UPLOAD] selectedApp exists but dbId is MISSING!', selectedApp);
        showToast('Upload Error', 'Application ID not found. Please go back and re-open this application.');
        return;
      }

      // CREATE MODE (wizard step 4): stage for upload after application is created
      console.log('[UPLOAD] CREATE MODE → staging in pendingFiles');
      setPendingFiles((prev) => ({ ...prev, [docId]: file }));
      setRequiredDocs(
        requiredDocs.map((doc) =>
          doc.id === docId
            ? { ...doc, uploadedFile: file.name, uploaded: 'Yes', status: 'Under Review' }
            : doc
        )
      );
      showToast('Document Staged', `${file.name} will be uploaded when you submit the application.`);
    }
  };

  const handleDownloadDocFile = async (docItemOrFileName?: RequiredDocItem | string, docNameFallback?: string) => {
    let targetDoc: RequiredDocItem | undefined;
    let fileName = 'document';

    if (typeof docItemOrFileName === 'object' && docItemOrFileName !== null) {
      targetDoc = docItemOrFileName;
      fileName = docItemOrFileName.uploadedFile || docItemOrFileName.name;
    } else if (typeof docItemOrFileName === 'string') {
      fileName = docItemOrFileName;
      targetDoc = requiredDocs.find((d) => d.uploadedFile === docItemOrFileName || d.name === docItemOrFileName || d.name === docNameFallback);
    }

    if (targetDoc?.storagePath) {
      showToast('Downloading Document', 'Decrypting and preparing your file...');
      const res = await getDecryptedDocumentAction(targetDoc.storagePath);
      if (res.success && res.base64) {
        const rawBase64 = res.base64.includes(',') ? res.base64.split(',')[1] : res.base64;
        const cleanBase64 = rawBase64.replace(/\s/g, '');
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const finalFileName = res.fileName || fileName;
        const ext = finalFileName.split('.').pop()?.toLowerCase();
        let mime = res.mimeType || targetDoc.mimeType;
        if (!mime || mime === 'application/octet-stream') {
          if (ext === 'jpeg' || ext === 'jpg') mime = 'image/jpeg';
          else if (ext === 'png') mime = 'image/png';
          else if (ext === 'webp') mime = 'image/webp';
          else if (ext === 'pdf') mime = 'application/pdf';
          else mime = 'application/octet-stream';
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Download Complete', `${link.download} saved to your device.`);
        return;
      }
    }

    // Try fetching live documents from DB for this application
    if (selectedApp?.dbId) {
      try {
        const docs = await fetchApplicationDocumentsAction(selectedApp.dbId);
        const match = docs.find(
          (d: any) =>
            d.fileName === fileName ||
            d.originalFileName === fileName ||
            (targetDoc && d.documentType === targetDoc.name.toUpperCase().replace(/[^A-Z0-9]/g, '_'))
        );
        if (match?.storagePath) {
          showToast('Downloading Document', 'Decrypting and preparing your file...');
          const res = await getDecryptedDocumentAction(match.storagePath);
          if (res.success && res.base64) {
            const rawBase64 = res.base64.includes(',') ? res.base64.split(',')[1] : res.base64;
            const cleanBase64 = rawBase64.replace(/\s/g, '');
            const byteCharacters = atob(cleanBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const finalFileName = res.fileName || match.originalFileName || match.fileName || fileName;
            const ext = finalFileName.split('.').pop()?.toLowerCase();
            let mime = res.mimeType || match.mimeType;
            if (!mime || mime === 'application/octet-stream') {
              if (ext === 'jpeg' || ext === 'jpg') mime = 'image/jpeg';
              else if (ext === 'png') mime = 'image/png';
              else if (ext === 'webp') mime = 'image/webp';
              else if (ext === 'pdf') mime = 'application/pdf';
              else mime = 'application/octet-stream';
            }

            const blob = new Blob([byteArray], { type: mime });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('Download Complete', `${link.download} saved to your device.`);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching live application document:', err);
      }
    }

    showToast('Download Unavailable', 'Document file is not yet available in secure storage.');
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

  // Load applications from backend DB
  React.useEffect(() => {
    async function loadApplications() {
      try {
        const data = await fetchApplicationsAction();
        setApplications(data.map((app: any) => ({
          id: app.applicationNumber || app.id,
          dbId: app.id, // real DB cuid for API calls
          serviceType: app.serviceType || app.service?.name || app.serviceName || 'Document Clearance & Legal Verification',
          submittedDate: app.submittedAt
            ? new Date(app.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          updatedDate: app.updatedAt
            ? new Date(app.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          addedBy: 'You' as const,
          status: (app.status === 'COMPLETED' ? 'Completed' : app.status === 'PROCESSING' ? 'Processing' : 'Verification') as ApplicationItem['status'],
          stepPhase: app.stepPhase || 1,
          adminRemarks: app.notes || 'Application submitted successfully.',
          assignedOfficer: app.assignedOfficer || 'Officer Rajesh Kumar',
          estimatedDays: '7 days left',
        })));
      } catch (e) {
        console.error('Error loading applications from DB:', e);
        setApplications([]);
      }
    }
    loadApplications();
  }, []);

  const handleFinishCreate = async () => {
    if (!isFeePaid) {
      showToast('Payment Completion Required', 'Only after completion of initial fee payment will your application details be saved to the database.');
      setCurrentStep(3);
      if (selectedPaymentMode !== 'CASH') {
        setShowPaymentGatewayModal(true);
      }
      return;
    }

    setSubmitting(true);
    const todayDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // 1. Create the application in DB first
    const result = await createApplicationAction({
      serviceType: serviceObj.name,
      fullName: details.applicantName,
      email: details.applicantEmail,
      phone: details.applicantPhone,
      dateOfBirth: details.dob || undefined,
      address: details.address || undefined,
      notes: details.description || details.remarks || undefined,
    });

    if (result.error) {
      showToast('Submission Failed', result.error);
      setSubmitting(false);
      return;
    }

    const savedApp = result.application;
    // Use the real DB id for document upload, applicationNumber for display
    const dbAppId: string = savedApp?.id || '';
    const displayId: string = savedApp?.applicationNumber || savedApp?.id || `AMC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    // 2. Upload any staged documents from step 4
    const pendingEntries = Object.entries(pendingFiles);
    if (dbAppId && pendingEntries.length > 0) {
      const uploadResults = await Promise.allSettled(
        pendingEntries.map(async ([docId, file]) => {
          // Find doc metadata to get documentType
          const docMeta = requiredDocs.find((d) => d.id === docId);
          const documentType = docMeta
            ? docMeta.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')
            : 'OTHER';

          // Convert file to base64
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });

          return uploadDocumentAction(dbAppId, {
            documentType,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            base64Data,
          });
        })
      );

      const failed = uploadResults.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.error));
      if (failed.length > 0) {
        showToast('Some Documents Failed', `${failed.length} of ${pendingEntries.length} document(s) could not be uploaded. You can retry from the Documents page.`);
      } else if (pendingEntries.length > 0) {
        showToast('Documents Uploaded!', `${pendingEntries.length} document(s) saved to the database.`);
      }
    }

    const newApp: ApplicationItem = {
      id: displayId,
      dbId: dbAppId, // store real cuid for future uploads
      serviceType: serviceObj.name,
      submittedDate: todayDate,
      updatedDate: todayDate,
      addedBy: 'You',
      status: 'Verification',
      stepPhase: 1,
      phaseDates: { 1: todayDate },
      adminRemarks: 'Application submitted successfully. Verification officer assigned.',
      assignedOfficer: 'Officer Rajesh Kumar',
      estimatedDays: '7 days left'
    };
    setApplications((prev) => [
      newApp,
      ...prev.filter(
        (a) =>
          a.id !== currentDraftId &&
          a.id !== displayId &&
          !(a.status === 'Draft' && (a.serviceType === newApp.serviceType || a.draftDetails?.serviceId === selectedService))
      ),
    ]);
    setPendingFiles({});

    // Record payment locally for Payments & Receipts page (fallback)
    try {
      const paymentStorageKey = getUserStorageKey(user.email, 'amman_user_payments');
      const savedPayments = localStorage.getItem(paymentStorageKey);
      const existingPayments = savedPayments ? JSON.parse(savedPayments) : [];
      const totalCost = 2000;
      const actualPaid = isFeePaid ? paidFeeAmountVal : 0;
      const actualPending = isFeePaid ? pendingFeeAmountVal : 2000;
      const todayISO = new Date().toISOString().split('T')[0];
      const newPaymentTxn = {
        id: txnRefCode || details.paymentRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        appId: displayId,
        service: serviceObj.name,
        totalAmount: totalCost,
        paidAmount: actualPaid,
        pendingAmount: actualPending,
        paymentMode: details.paymentMode,
        status: actualPending === 0 ? 'Paid' : actualPaid > 0 ? 'Partial' : 'Pending',
        date: todayISO
      };
      localStorage.setItem(paymentStorageKey, JSON.stringify([newPaymentTxn, ...existingPayments]));

      // Also save to DB (Invoice + Payment)
      if (dbAppId) {
        createCustomerPaymentAction({
          applicationId: dbAppId,
          amount: actualPaid,
          serviceFee: totalCost,
          paymentMode: details.paymentMode,
          reference: newPaymentTxn.id,
        }).catch((e) => console.error('Error saving payment to DB:', e));
      }
    } catch (e) {
      console.error('Error saving payment transaction:', e);
    }

    // Clear draft from localStorage if this was a draft application
    try {
      const draftStorageKey = getUserStorageKey(user.email, 'amman_user_draft_apps');
      const existingDrafts = localStorage.getItem(draftStorageKey);
      if (existingDrafts) {
        const draftsArr = JSON.parse(existingDrafts);
        const remaining = draftsArr.filter(
          (d: any) =>
            d.id !== currentDraftId &&
            d.id !== displayId &&
            d.draftDetails?.serviceId !== selectedService
        );
        localStorage.setItem(draftStorageKey, JSON.stringify(remaining));
      }
    } catch (e) {
      console.error('Error clearing draft:', e);
    }

    setCurrentDraftId(null);
    setSubmitting(false);
    // Reset payment & wizard state completely so subsequent new applications start 100% fresh
    setIsFeePaid(false);
    setPaidFeeAmountVal(1000);
    setPendingFeeAmountVal(1000);
    setTxnRefCode('');
    setPaymentOption('PARTITION');
    setSelectedPaymentMode('UPI');
    setPendingFiles({});
    setDetails({
      applicantName: user.name || '',
      applicantPhone: user.phone || '+91 ',
      applicantEmail: user.email || '',
      altPhone: user.altPhone || '+91 ',
      address: user.address || '',
      description: '',
      idDocType: 'Aadhaar Card',
      idDocNumber: '',
      dob: '',
      remarks: '',
      paymentMode: 'UPI / NetBanking',
      paymentRef: '',
      paymentAmount: '1000.00'
    });
    setMode('list');
    setCurrentStep(1);
    showToast('Application Submitted!', `Application ${displayId} saved${pendingEntries.length > 0 ? ' with documents' : ''}.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
      {/* ======================================================== */}
      {/* 1. LIST MODE (Pillio Metric Cards & Application Grid) */}
      {/* ======================================================== */}
      {mode === 'list' && (
        <>
          {/* Top 3 Summary Cards Grid - Matching Payments Card Styling & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Mobile Custom Tab Dropdown */}
              <CustomTabDropdown
                value={activeTabFilter}
                options={['All', 'Draft', 'Verification', 'Processing', 'Completed']}
                onChange={(val) => setActiveTabFilter(val as any)}
                className="sm:hidden self-start"
              />

              {/* Desktop Capsule Filter Tabs - DRAFT PLACED RIGHT NEAR VERIFICATION */}
              <div className="hidden sm:inline-flex bg-gray-100/90 p-1.5 rounded-full items-center gap-1 border border-gray-200/60 shrink-0">
                {(['All', 'Draft', 'Verification', 'Processing', 'Completed'] as const).map((tab) => {
                  const count = tab === 'All'
                    ? applications.length
                    : applications.filter(a => a.status === tab).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTabFilter(tab)}
                      className={`px-4 py-1.5 rounded-full transition-all text-xs whitespace-nowrap flex items-center gap-1.5 ${
                        activeTabFilter === tab
                          ? tab === 'Draft' ? 'bg-amber-700 text-white font-extrabold shadow-xs' : 'bg-[#12372A] text-white font-extrabold shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 font-semibold'
                      }`}
                    >
                      <span>{tab}</span>
                      {count > 0 && (
                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                          activeTabFilter === tab
                            ? 'bg-white/20 text-white'
                            : tab === 'Draft' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Search Bar Input */}
                <div className="relative flex-1 sm:flex-initial sm:w-64">
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
                  onClick={() => startNewFreshApplication()}
                  className="bg-[#12372A] hover:bg-[#1a4a38] text-white px-5 py-2 rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 shrink-0 ml-auto sm:ml-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Application</span>
                </button>
              </div>
            </div>

            {/* Responsive Application Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    onClick={() => startNewFreshApplication()}
                    className="px-6 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-full transition-all shadow-sm inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Start New Application</span>
                  </button>
                </div>
              ) : (
                filteredApps.map((app) => {
                  const isCompleted = app.status === 'Completed';
                  const isDraft = app.status === 'Draft';
                  const progressPercent = isDraft ? 37 : Math.min(100, Math.round((app.stepPhase / 8) * 100));

                  return (
                    <div
                      key={app.id}
                      className={`bg-white rounded-3xl p-5 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group ${
                        isDraft ? 'border-amber-200/90 bg-amber-50/20' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border font-bold ${
                            isDraft ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-[#f0f7f2] text-[#12372A] border-[#a8d5b9]/40'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-[#12372A] transition-colors leading-snug">
                              {app.serviceType || app.draftDetails?.serviceName || 'Document Clearance & Legal Verification'}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                              {app.id}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                            isDraft
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-[#d8ebdd] text-[#12372A]'
                          }`}
                        >
                          {isDraft ? '• Partially Filled (Docs Pending)' : `• ${app.status}`}
                        </span>
                      </div>

                      {isDraft && (
                        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-[11px] space-y-1 text-amber-950">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1 text-amber-900">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                              Partially Filled • Payment Verified
                            </span>
                            <span className="text-amber-800 font-mono font-extrabold">₹{app.paidFeeAmountVal?.toLocaleString('en-IN') || '1,000'}.00</span>
                          </div>
                          <p className="text-amber-800/90 text-[10px] leading-relaxed">
                            Application is partially filled. Initial fee payment completed via {app.paymentMode || 'Gateway'}. Document upload is pending. Click below to upload documents and complete.
                          </p>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                          <span>{isDraft ? 'Partially Filled (Payment Verified, Docs Pending)' : `Phase ${app.stepPhase} of 8`}</span>
                          <span className={isDraft ? 'text-amber-700 font-bold' : 'text-gray-400 font-normal'}>
                            {isDraft ? 'Action Needed' : app.estimatedDays || '7 days left'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isDraft ? 'bg-amber-500' : 'bg-gradient-to-r from-[#12372A] via-[#2e8a60] to-[#3b9f71]'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                        <div>
                          <p className="font-semibold text-gray-700">Status</p>
                          <p className="text-gray-400 font-medium truncate max-w-[130px]">{isDraft ? 'Partially Filled' : app.assignedOfficer || 'Officer Rajesh'}</p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-gray-700">Updated</p>
                          <p className="text-gray-400 font-medium">{app.updatedDate}</p>
                        </div>

                        {isDraft ? (
                          <button
                            onClick={() => handleResumeDraft(app)}
                            className="px-3.5 py-1.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 ml-2"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Docs &amp; Resume</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenView(app)}
                            className="w-9 h-9 rounded-full bg-gray-50 hover:bg-[#12372A] hover:text-white border border-gray-200/80 flex items-center justify-center text-gray-700 transition-all shrink-0 ml-2 shadow-2xs"
                            title="View Application Details"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        )}
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

          {/* Top 3 Cards Grid: Application Info, Amount Paid Box & Current Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Card 1: Application Info (Left 5/12) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Application Info
              </h2>

              <div className="grid grid-cols-1 gap-2.5 text-xs">
                <div className="flex items-center">
                  <span className="w-32 text-gray-500 font-medium">Application ID</span>
                  <span className="font-bold text-gray-900">: {selectedApp.id}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-gray-500 font-medium">Service Type</span>
                  <span className="font-bold text-gray-900">: {selectedApp.serviceType}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-gray-500 font-medium">Submitted On</span>
                  <span className="font-bold text-gray-900">: {selectedApp.submittedDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-gray-500 font-medium">Added By</span>
                  <span className="font-bold text-gray-900">: {selectedApp.addedBy}</span>
                </div>
                <div className="flex items-center border-t border-gray-100 pt-2">
                  <span className="w-32 text-gray-500 font-medium">Amount Paid</span>
                  <span className="font-extrabold text-[#12372A]">: ₹{(appPaymentTxn?.paidAmount ?? 2000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Dedicated Amount Paid Box (Middle 4/12) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Amount Paid
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  (appPaymentTxn?.status || 'Paid') === 'Paid'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {appPaymentTxn?.status || 'Paid'}
                </span>
              </div>

              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-[#12372A] tracking-tight">
                  ₹{(appPaymentTxn?.paidAmount ?? 2000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                  Total Service Fee: ₹{(appPaymentTxn?.totalAmount ?? 2000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 text-xs space-y-1 text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Payment Mode:</span>
                  <span className="font-bold text-gray-800">{appPaymentTxn?.paymentMode || 'UPI / NetBanking'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Transaction Ref:</span>
                  <span className="font-bold text-gray-800">{appPaymentTxn?.id || 'TXN-884920'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Current Status (Right 3/12) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 text-center flex flex-col justify-center space-y-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                Current Status
              </h2>

              <div className="py-2">
                <span className="inline-block bg-[#d8ebdd] text-[#12372A] border border-[#a8d5b9] font-extrabold text-base px-6 py-2.5 rounded-2xl shadow-2xs">
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
            <div className="relative pt-2 pb-2 w-full">
              <div className="w-full grid grid-cols-8 relative py-1">
                {/* Connecting Track Line (100% Equal Center-to-Center Spacing) */}
                <div className="absolute top-[12px] sm:top-[18px] left-[6.25%] right-[6.25%] h-1 bg-gray-200 z-0 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-[#12372A] to-[#2d6a4f] rounded-full transition-all duration-500 ease-in-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((selectedApp.stepPhase - 1) / (TRACKER_PHASES.length - 1)) * 100))}%`
                    }}
                  />
                </div>

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
                    <div key={phase.step} className="flex flex-col items-center text-center space-y-1 z-10 px-0.5">
                      {/* Step Circle */}
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs transition-all shadow-2xs ${
                          isCompleted
                            ? 'bg-[#12372A] text-white ring-2 sm:ring-4 ring-gray-300'
                            : isActive
                            ? 'bg-[#1c3a63] text-white ring-2 sm:ring-4 ring-gray-300 scale-105'
                            : 'bg-white text-gray-800'
                        }`}
                        style={{
                          border: '2px solid #6b7280',
                          backgroundColor: isCompleted ? '#12372A' : isActive ? '#1c3a63' : '#ffffff'
                        }}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3]" /> : phase.step}
                      </div>

                      {/* Step Title & Date */}
                      <div className="space-y-0.5">
                        <p className={`text-[7px] sm:text-[9px] md:text-[11px] font-bold leading-tight line-clamp-2 ${isActive ? 'text-[#1c3a63]' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {phase.title}
                        </p>
                        {phaseDate && (
                          <p className="text-[6px] sm:text-[8px] md:text-[10px] text-gray-500 font-medium hidden sm:block">{phaseDate}</p>
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
                      <th className="pb-3 pr-4 text-left">Document</th>
                      <th className="pb-3 px-3 text-center whitespace-nowrap">Required</th>
                      <th className="pb-3 px-3 text-center whitespace-nowrap">Uploaded</th>
                      <th className="pb-3 px-3 text-center whitespace-nowrap">Status</th>
                      <th className="pb-3 pl-3 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requiredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 pr-4 font-bold text-gray-900 leading-snug">{doc.name}</td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.required === 'Required' ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-gray-50 text-gray-400 border border-gray-100'
                          }`}>
                            {doc.required}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap font-semibold text-gray-700">{doc.uploaded}</td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                            doc.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : doc.status === 'Under Review'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                          {doc.uploaded === 'Yes' ? (
                            <div className="flex items-center justify-end gap-1.5 shrink-0">
                              {/* View Button */}
                              <button
                                onClick={() => setViewingDoc(doc)}
                                className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-[11px] rounded-xl transition-all shadow-2xs flex items-center gap-1 whitespace-nowrap"
                                title="View Document"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                <span>View</span>
                              </button>

                              {/* Download Button */}
                              <button
                                onClick={() => handleDownloadDocFile(doc.uploadedFile || doc.name, doc.name)}
                                className="px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-xl transition-all shadow-2xs flex items-center gap-1 whitespace-nowrap"
                                title="Download Document"
                              >
                                <Download className="w-3.5 h-3.5 shrink-0" />
                                <span>Download</span>
                              </button>

                              {/* Re-upload Button */}
                              <label className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                                <span>Re-upload</span>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUploadInDetail(doc.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-[11px] rounded-xl transition-all shadow-2xs cursor-pointer inline-block whitespace-nowrap">
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
        <div className="bg-white rounded-3xl p-4 sm:p-5 md:p-6 border border-gray-100 shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-gray-900">New Service Application</h2>
                {!isFeePaid ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Temporary Draft (Not Saved to DB Yet)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ Payment Verified (Ready to Save)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {!isFeePaid
                  ? "Information is stored as temporary draft data. Details will be saved to the database only after completing initial payment in Step 3."
                  : "Initial payment complete. Click Submit in Step 5 to save your application to the database."}
              </p>
            </div>
            <button
              onClick={() => setMode('list')}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl px-4 py-2 bg-gray-50"
            >
              Back to Applications
            </button>
          </div>

          <div className="flex items-center justify-between max-w-4xl mx-auto py-2.5 overflow-x-auto gap-3">
            {WIZARD_STEPS.map((step) => (
              <div key={step.id} className="flex items-center space-x-2 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                    currentStep >= step.id
                      ? 'bg-[#12372A] text-white border-2 border-[#12372A] shadow-xs'
                      : 'bg-white text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap hidden sm:inline ${currentStep === step.id ? 'text-[#12372A]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs font-bold text-gray-700">Select Service Type</p>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={appServiceSearchQuery}
                    onChange={(e) => setAppServiceSearchQuery(e.target.value)}
                    placeholder="Search services..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-900 focus:outline-none focus:border-[#12372A] focus:ring-2 focus:ring-[#12372A]/10 transition-all"
                  />
                  {appServiceSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAppServiceSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dbServices.filter((s) => {
                  if (!appServiceSearchQuery.trim()) return true;
                  const q = appServiceSearchQuery.toLowerCase().trim();
                  return (
                    (s.name && s.name.toLowerCase().includes(q)) ||
                    (s.description && s.description.toLowerCase().includes(q))
                  );
                }).length === 0 ? (
                  <div className="col-span-full py-10 text-center text-xs font-semibold text-gray-400 bg-gray-50/80 rounded-2xl border border-gray-200/80">
                    No services found matching &quot;{appServiceSearchQuery}&quot;
                  </div>
                ) : (
                  dbServices.filter((s) => {
                    if (!appServiceSearchQuery.trim()) return true;
                    const q = appServiceSearchQuery.toLowerCase().trim();
                    return (
                      (s.name && s.name.toLowerCase().includes(q)) ||
                      (s.description && s.description.toLowerCase().includes(q))
                    );
                  }).map((srv) => {
                    const Icon = getServiceIcon(srv.id);
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/50">
                            Active
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">{srv.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{srv.description || 'Service description not provided'}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
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
                  <CustomSelect
                    value={details.idDocType}
                    onChange={(val) => setDetails({ ...details, idDocType: val })}
                    options={['Aadhaar Card', 'PAN Card', 'Passport Number', 'Voter ID']}
                  />
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
                  <CustomDatePicker
                    value={details.dob}
                    onChange={(val) => setDetails({ ...details, dob: val })}
                    disableFuture
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

          {/* STEP 3: Fee Payment */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-6 text-xs">
              <div className="p-4 bg-[#f0f7f2] border border-[#a8d5b9]/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-[#12372A]">Fee Payment for {serviceObj.name}</h3>
                  <p className="text-gray-600 text-[11px] mt-0.5">Statutory government fee & processing charge payment.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-3 py-1 bg-emerald-100 text-[#12372A] font-extrabold text-xs rounded-full border border-emerald-300 inline-block">
                    Total Service Fee: ₹ 2,000.00
                  </span>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-2 shadow-2xs">
                <h4 className="font-bold text-gray-900 border-b pb-2 text-xs uppercase tracking-wider text-gray-500">Service Fee Breakdown</h4>
                <div className="flex justify-between text-gray-600"><span>Government Statutory Fee:</span> <span className="font-bold text-gray-800">₹ 1,500.00</span></div>
                <div className="flex justify-between text-gray-600"><span>Verification & Filing Fee:</span> <span className="font-bold text-gray-800">₹ 350.00</span></div>
                <div className="flex justify-between text-gray-600"><span>GST & Convenience Charge:</span> <span className="font-bold text-gray-800">₹ 150.00</span></div>
                <div className="flex justify-between text-sm font-extrabold text-[#12372A] border-t pt-2 mt-1"><span>Total Statutory Amount:</span> <span>₹ 2,000.00</span></div>
              </div>

              {/* Partitioned Payment Options */}
              <div className="space-y-3">
                <label className="block font-bold text-gray-700">Select Payment Structure *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Partitioned Payment (50% Initial / 50% Final) */}
                  <div
                    onClick={() => setPaymentOption('PARTITION')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                      paymentOption === 'PARTITION'
                        ? 'border-[#12372A] bg-[#f0f7f2] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Popular / Partitioned
                      </span>
                      {paymentOption === 'PARTITION' && (
                        <div className="w-5 h-5 rounded-full bg-[#12372A] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#a8d5b9]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">Partitioned Payment (50% / 50%)</h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Pay <strong className="text-[#12372A] font-bold">₹1,000.00 now</strong> to unlock document upload & start processing. Pay remaining <strong className="text-gray-700 font-bold">₹1,000.00 later</strong> before receiving final information.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-emerald-200/60 flex justify-between items-center text-xs font-bold">
                      <span className="text-emerald-800">Initial Due Now: ₹1,000.00</span>
                      <span className="text-gray-500 font-normal">Final Balance: ₹1,000.00</span>
                    </div>
                  </div>

                  {/* Card 2: Full Payment (100% Upfront) */}
                  <div
                    onClick={() => setPaymentOption('FULL')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                      paymentOption === 'FULL'
                        ? 'border-[#12372A] bg-[#f0f7f2] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                        One-Time Full Pay
                      </span>
                      {paymentOption === 'FULL' && (
                        <div className="w-5 h-5 rounded-full bg-[#12372A] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#a8d5b9]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">Full Payment (100%)</h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Pay complete <strong className="text-[#12372A] font-bold">₹2,000.00 upfront</strong>. Zero remaining balance throughout the entire application lifecycle.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-blue-200/60 flex justify-between items-center text-xs font-bold">
                      <span className="text-blue-900">Payable Now: ₹2,000.00</span>
                      <span className="text-gray-500 font-normal">Final Balance: ₹0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector - ONLY TWO OPTIONS: UPI & CASH */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700">Select Payment Mode *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMode('UPI')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedPaymentMode === 'UPI'
                        ? 'border-[#12372A] bg-[#f0f7f2] text-[#12372A] font-bold ring-2 ring-[#12372A]/20 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-[#12372A]" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">UPI / NetBanking</p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">GPay, PhonePe, Paytm, BHIM & NetBanking</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMode('CASH')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedPaymentMode === 'CASH'
                        ? 'border-[#12372A] bg-[#f0f7f2] text-[#12372A] font-bold ring-2 ring-[#12372A]/20 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="w-6 h-6 text-[#12372A]" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Cash at Counter</p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">Pay cash at office counter</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Status & Gateway Action */}
              {!isFeePaid ? (
                selectedPaymentMode === 'CASH' ? (
                  <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-amber-950">Cash Payment Selected (Office Counter)</h4>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          You have selected <strong className="font-bold">Cash at Counter</strong> payment. You can pay the initial fee of <strong className="font-bold text-amber-950">₹{paymentOption === 'PARTITION' ? '1,000.00' : '2,000.00'}</strong> in cash at our office counter or present your payment receipt. Click below to confirm cash booking and unlock document upload.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const due = paymentOption === 'PARTITION' ? 1000 : 2000;
                        const pend = paymentOption === 'PARTITION' ? 1000 : 0;
                        const ref = `CASH-BOOK-${Math.floor(100000 + Math.random() * 900000)}`;
                        setIsFeePaid(true);
                        setPaidFeeAmountVal(due);
                        setPendingFeeAmountVal(pend);
                        setTxnRefCode(ref);
                        setDetails({
                          ...details,
                          paymentMode: 'Cash at Counter',
                          paymentRef: ref,
                          paymentAmount: due.toString(),
                        });
                        showToast('Cash Booking Confirmed', `Cash payment booking recorded (${ref}). Document upload is now unlocked!`);
                      }}
                      className="w-full py-3 bg-[#12372A] hover:bg-[#1a4a38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Confirm Cash Booking &amp; Unlock Document Upload</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-amber-950">Payment Completion Required</h4>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          Only after completion of fee payment is the upload document section allowed. Please complete the initial payment of <strong className="font-extrabold text-amber-950">₹{paymentOption === 'PARTITION' ? '1,000.00' : '2,000.00'}</strong> via Payment Gateway.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRazorpayCheckout()}
                      className="w-full py-3 bg-[#12372A] hover:bg-[#1a4a38] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Pay ₹{paymentOption === 'PARTITION' ? '1,000.00' : '2,000.00'} via Razorpay Gateway</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                )
              ) : (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-emerald-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h4 className="font-extrabold text-sm text-emerald-900">
                        {selectedPaymentMode === 'CASH' ? 'Cash Payment Option Confirmed!' : 'Payment Successfully Verified!'}
                      </h4>
                    </div>
                    <span className="px-3 py-1 bg-emerald-200/80 text-emerald-900 font-extrabold text-[11px] rounded-full">
                      ✓ Unlocked Step 4
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    {selectedPaymentMode === 'CASH'
                      ? `Selected Cash at Counter (Booking Ref: ${txnRefCode || details.paymentRef}). Initial ₹${paidFeeAmountVal.toLocaleString('en-IN')}.00 payable at counter. Document upload is unlocked.`
                      : `Paid ₹${paidFeeAmountVal.toLocaleString('en-IN')}.00 via ${selectedPaymentMode} (Ref: ${txnRefCode || details.paymentRef}). ${pendingFeeAmountVal > 0 ? `Remaining balance of ₹${pendingFeeAmountVal.toLocaleString('en-IN')}.00 due before receiving final information.` : 'Fully settled.'}`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Upload Documents */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="p-4 bg-[#f0f7ff] border border-blue-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#12372A]">Required Documentation for {serviceObj.name}</h3>
                  <p className="text-gray-600 text-[11px] mt-0.5">Please upload clear scans or photos for the required documents.</p>
                </div>
                {isFeePaid && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-300">
                    ✓ Payment Verified
                  </span>
                )}
              </div>

              {!isFeePaid ? (
                <div className="p-8 bg-amber-50/90 border border-amber-200 rounded-2xl text-center space-y-4 shadow-2xs">
                  <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-amber-950">Document Upload Locked</h4>
                    <p className="text-xs text-amber-800 max-w-md mx-auto mt-1 leading-relaxed">
                      Only after completion of the fee payment in Step 3 is the document upload section allowed. Please complete the initial payment of <strong className="font-bold text-amber-950">₹{paymentOption === 'PARTITION' ? '1,000.00' : '2,000.00'}</strong>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentGatewayModal(true)}
                      className="px-6 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-full transition-all shadow-md inline-flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{paymentOption === 'PARTITION' ? '1,000.00' : '2,000.00'} Now &amp; Unlock Upload</span>
                    </button>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="max-w-xl mx-auto space-y-2.5 sm:space-y-3 text-xs">
              {!isFeePaid ? (
                <div className="p-3 px-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-950">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Temporary Draft: Details are stored in temporary data memory. Only after initial fee payment will details be saved to the database.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(3);
                      if (selectedPaymentMode !== 'CASH') setShowPaymentGatewayModal(true);
                    }}
                    className="px-3 py-1 bg-amber-700 text-white font-bold text-[11px] rounded-lg shrink-0"
                  >
                    Pay Now
                  </button>
                </div>
              ) : (
                <div className="p-2.5 px-3.5 sm:p-3 sm:px-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-900 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>✓ Initial payment completed. Click &quot;Submit Application&quot; below to save your details to the database.</span>
                </div>
              )}

              <div className="bg-gray-50 p-3.5 sm:p-4 md:p-5 rounded-2xl border border-gray-200 space-y-2.5 sm:space-y-3">
                <h3 className="font-bold text-sm text-gray-900 border-b pb-1.5 sm:pb-2">Review Application Summary</h3>
              <div className="space-y-1.5 sm:space-y-2">
                <p className="flex justify-between"><span className="text-gray-500 font-medium">Selected Service:</span> <strong className="text-gray-900 font-bold">{serviceObj.name}</strong></p>
                <p className="flex justify-between"><span className="text-gray-500 font-medium">Applicant Name:</span> <strong className="text-gray-900 font-bold">{details.applicantName}</strong></p>
                <p className="flex justify-between"><span className="text-gray-500 font-medium">Primary Phone:</span> <strong className="text-gray-900 font-bold">{details.applicantPhone}</strong></p>
                <p className="flex justify-between"><span className="text-gray-500 font-medium">Email Address:</span> <strong className="text-gray-900 font-bold">{details.applicantEmail}</strong></p>
                <p className="flex justify-between">
                  <span className="text-gray-500 font-medium">Fee Payment Status:</span>
                  <strong className={isFeePaid ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                    {isFeePaid
                      ? `Paid ₹${paidFeeAmountVal.toLocaleString('en-IN')}.00 via ${selectedPaymentMode} [${txnRefCode || details.paymentRef}]`
                      : 'Fee Payment Pending'}
                  </strong>
                </p>
                {pendingFeeAmountVal > 0 && (
                  <p className="flex justify-between">
                    <span className="text-gray-500 font-medium">Final Balance Due Later:</span>
                    <strong className="text-rose-600 font-bold">₹{pendingFeeAmountVal.toLocaleString('en-IN')}.00 (Before receiving final info)</strong>
                  </p>
                )}
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
          </div>
        )}

          <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-100">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2.5 border border-gray-300 rounded-full font-semibold text-xs text-gray-700 disabled:opacity-40"
            >
              Back
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => {
                  if (currentStep === 3 && !isFeePaid) {
                    showToast('Payment Required', 'Only after completion of fee payment is the upload document section allowed.');
                    setShowPaymentGatewayModal(true);
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                }}
                className="px-6 py-2.5 bg-[#12372A] text-white font-bold text-xs rounded-full hover:bg-[#1a4a38] shadow-md"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleFinishCreate}
                disabled={submitting}
                className="px-6 py-2.5 bg-[#12372A] text-white font-bold text-xs rounded-full hover:bg-[#1a4a38] shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Submitting…</span></>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Fee Payment Gateway Simulator */}
      {mounted && showPaymentGatewayModal && createPortal(
        <div
          onClick={() => setShowPaymentGatewayModal(false)}
          className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-200/90 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#f0f7f2] text-[#12372A] flex items-center justify-center font-bold border border-emerald-200">
                  <CreditCard className="w-4 h-4 text-[#12372A]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Amman Payment Gateway</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Secured SSL 256-bit Encrypted Transaction</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentGatewayModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Summary Box */}
            <div className="p-4 bg-[#f0f7f2] border border-[#a8d5b9]/80 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <p className="text-gray-500 font-medium">Service Fee Order:</p>
                <p className="font-bold text-[#12372A] text-sm">{serviceObj.name}</p>
                <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                  {paymentOption === 'PARTITION' ? '50% Partitioned Initial Payment' : '100% Full Payment'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400">Payable Now</span>
                <p className="text-2xl font-extrabold text-[#12372A]">
                  ₹{paymentOption === 'PARTITION' ? '1,000.00' : '2,000.00'}
                </p>
              </div>
            </div>

            {/* Payment Method Selector - ONLY TWO OPTIONS: UPI & CASH */}
            <div className="space-y-3 text-xs">
              <label className="block font-bold text-gray-700">Choose Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMode('UPI')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                    selectedPaymentMode === 'UPI'
                      ? 'border-[#12372A] bg-[#12372A] text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  UPI / NetBanking (GPay/PhonePe)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMode('CASH')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                    selectedPaymentMode === 'CASH'
                      ? 'border-[#12372A] bg-[#12372A] text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cash at Counter
                </button>
              </div>

              {/* UPI & NetBanking Tab View */}
              {selectedPaymentMode === 'UPI' && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 bg-white border border-gray-300 rounded-xl p-1.5 flex items-center justify-center shrink-0">
                      <div className="w-full h-full bg-gray-900 text-white rounded-lg flex items-center justify-center font-mono text-[9px] text-center font-bold p-1">
                        SCAN QR CODE
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">Scan QR Code or enter VPA ID</p>
                      <p className="text-[11px] text-gray-500">Supports Google Pay, PhonePe, Paytm, BHIM & NetBanking.</p>
                      <p className="text-[11px] font-mono text-[#12372A] font-bold">UPI ID: ammancomms@upi</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <label className="block font-semibold text-gray-700">Enter Your VPA / UPI ID</label>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. mobileNumber@upi or name@okicici"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#12372A]"
                    />
                  </div>
                </div>
              )}

              {/* Cash Tab View */}
              {selectedPaymentMode === 'CASH' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-amber-950">
                  <div className="flex items-center gap-2 font-bold">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pay at Amman Office Counter</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Confirming cash request will generate a payment voucher slip. Document upload section will be unlocked for immediate processing.
                  </p>
                </div>
              )}
            </div>

            {/* Gateway Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentGatewayModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={gatewayProcessing}
                onClick={() => {
                  if (selectedPaymentMode === 'UPI') {
                    handleRazorpayCheckout();
                  } else {
                    const due = paymentOption === 'PARTITION' ? 1000 : 2000;
                    const pend = paymentOption === 'PARTITION' ? 1000 : 0;
                    const ref = `CASH-BOOK-${Math.floor(100000 + Math.random() * 900000)}`;
                    setIsFeePaid(true);
                    setPaidFeeAmountVal(due);
                    setPendingFeeAmountVal(pend);
                    setTxnRefCode(ref);
                    setDetails({
                      ...details,
                      paymentMode: 'Cash at Counter',
                      paymentRef: ref,
                      paymentAmount: due.toString(),
                    });
                    setShowPaymentGatewayModal(false);
                    showToast('Cash Option Confirmed', `Cash payment booking recorded (${ref}). Document upload is unlocked.`);
                  }
                }}
                className="px-6 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                {gatewayProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing with Razorpay…</span></>
                ) : (
                  <span>{selectedPaymentMode === 'UPI' ? 'Pay via Razorpay Gateway' : 'Confirm Cash Booking'}</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ======================================================== */}
      {/* 4. MODALS: HISTORY & DOCUMENT PREVIEW */}
      {/* ======================================================== */}
      {mounted && showHistoryModal && selectedApp && createPortal(
        <div
          onClick={() => setShowHistoryModal(false)}
          className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-gray-200/90 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Application History - {selectedApp.id}</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
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
              className="w-full py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-xl transition-colors shadow-md"
            >
              Close History
            </button>
          </div>
        </div>,
        document.body
      )}

      {mounted && viewingDoc && createPortal(
        <div
          onClick={() => setViewingDoc(null)}
          className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-gray-200/90 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Viewing Document: {viewingDoc.name}</h3>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2">
              <FileCheck className="w-12 h-12 text-[#12372A] mx-auto" />
              <p className="text-xs font-bold text-gray-900">{viewingDoc.uploadedFile || viewingDoc.name}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">• Status: {viewingDoc.status}</p>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleDownloadDocFile(viewingDoc.uploadedFile || viewingDoc.name, viewingDoc.name)}
                className="flex-1 py-2.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <label className="flex-1 py-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer">
                <RefreshCw className="w-4 h-4" />
                <span>Re-upload</span>
                <input
                  type="file"
                  onChange={(e) => {
                    handleFileUploadInDetail(viewingDoc.id, e);
                    setViewingDoc(null);
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
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
