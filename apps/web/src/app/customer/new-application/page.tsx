'use client';

import React, { useState, useEffect } from 'react';
import { type ServiceDefinition } from '@repo/shared-types';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

const DEFAULT_SERVICES: ServiceDefinition[] = [
  {
    id: 'svc_commercial_fiber',
    code: 'svc_commercial_fiber',
    title: 'Commercial Fiber Broadband',
    category: 'Corporate Broadband',
    tagline: 'High-speed dedicated fiber optic connectivity for corporate & business premises.',
    description: 'High-speed dedicated fiber optic connectivity for corporate & business premises.',
    estimatedProcessingDays: '3-5 Business Days',
    governmentFee: 250,
    serviceFee: 750,
    totalFee: 1000,
    icon: '🏢',
    requiredDocuments: [
      {
        type: 'COMMERCIAL_REGISTRATION_CERTIFICATE',
        name: 'Commercial Registration Certificate',
        description: 'Commercial Registration Certificate scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'AUTHORIZED_SIGNATORY_NATIONAL_ID',
        name: 'Authorized Signatory National ID',
        description: 'Authorized Signatory National ID scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'LEASE_AGREEMENT_PROOF_OF_ADDRESS',
        name: 'Lease Agreement / Proof of Address',
        description: 'Lease Agreement or Proof of Address scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
    ],
  },
  {
    id: 'svc_residential_broadband',
    code: 'svc_residential_broadband',
    title: 'Residential Broadband Setup',
    category: 'Home Internet',
    tagline: 'High-speed home internet connection with included Wi-Fi router setup.',
    description: 'High-speed home internet connection with included Wi-Fi router setup.',
    estimatedProcessingDays: '1-2 Business Days',
    governmentFee: 100,
    serviceFee: 300,
    totalFee: 400,
    icon: '📡',
    requiredDocuments: [
      {
        type: 'NATIONAL_IDENTIFICATION_PASSPORT',
        name: 'National Identification / Passport',
        description: 'National Identification / Passport scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'UTILITY_BILL_ELECTRICITY_WATER',
        name: 'Utility Bill (Electricity/Water)',
        description: 'Utility Bill (Electricity/Water) scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
    ],
  },
];

interface UploadedDocState {
  id?: string;
  documentId?: string;
  documentType: string;
  fileName: string;
  originalFileName?: string;
  fileSize: number;
  mimeType: string;
  status: string;
  version: number;
  downloadUrl?: string;
  uploadedAt?: string;
  rejectionReason?: string;
}

export default function NewApplicationPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [services, setServices] = useState<ServiceDefinition[]>(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState<ServiceDefinition>(DEFAULT_SERVICES[0]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [catRes, profRes] = await Promise.all([
          apiRequest<ServiceDefinition[]>('/api/v1/customer/services-catalog'),
          apiRequest<{ name?: string; email?: string; phone?: string }>('/api/v1/customer/dashboard/profile'),
        ]);

        if (catRes.success && catRes.data && catRes.data.length > 0) {
          setServices(catRes.data);
          setSelectedService(catRes.data[0]);
        }

        if (profRes.success && profRes.data) {
          setCustomerDetails((prev) => ({
            ...prev,
            fullName: prev.fullName || profRes.data?.name || '',
            email: prev.email || profRes.data?.email || '',
            phone: prev.phone || profRes.data?.phone || '',
          }));
        }
      } catch {}
    }
    loadInitialData();
  }, []);

  // Step 2 Customer Basic Details
  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: 'Indian',
    address: '',
    notes: '',
  });

  // Created Application state
  const [createdApplication, setCreatedApplication] = useState<{
    id: string;
    applicationNumber: string;
    serviceType: string;
  } | null>(null);

  // Uploaded Documents state for the current application
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, UploadedDocState>>({});
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle customer basic details submit -> Create Application
  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerDetails.fullName || !customerDetails.email || !customerDetails.phone) {
      setErrorMessage('Please fill in required customer details (Full Name, Email, Phone).');
      return;
    }

    try {
      const res = await apiRequest('/api/v1/customer/applications', {
        method: 'POST',
        body: JSON.stringify({
          serviceType: selectedService.code,
          title: selectedService.title,
          fullName: customerDetails.fullName,
          email: customerDetails.email,
          phone: customerDetails.phone,
          dateOfBirth: customerDetails.dateOfBirth,
          nationality: customerDetails.nationality,
          address: customerDetails.address,
          notes: customerDetails.notes,
        }),
      });

      if (res.success && res.data) {
        setCreatedApplication({
          id: res.data.id,
          applicationNumber: res.data.applicationNumber,
          serviceType: res.data.serviceType,
        });
        setStep(3);
        setSuccessMessage(`Application ${res.data.applicationNumber} created! Please upload required documents below.`);
      } else {
        setErrorMessage(res.message || 'Failed to create application in database. Please check your connection.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create application');
    }
  };

  // Handle file selection and direct encrypted upload
  const handleFileUpload = async (docType: string, file: File) => {
    if (!createdApplication) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    // Max 10MB check
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`File "${file.name}" exceeds the maximum 10MB limit.`);
      return;
    }

    setUploadingDocType(docType);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        const res = await apiRequest(`/api/v1/customer/applications/${createdApplication.id}/documents/upload`, {
          method: 'POST',
          body: JSON.stringify({
            documentType: docType,
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            fileSize: file.size,
            base64Data,
          }),
        });

        setUploadingDocType(null);

        if (res.success && res.data) {
          setUploadedDocuments((prev) => ({
            ...prev,
            [docType]: {
              id: res.data.id || res.data.documentId,
              documentId: res.data.id || res.data.documentId,
              documentType: docType,
              fileName: file.name,
              originalFileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              status: res.data.status || 'UPLOADED',
              version: res.data.version || (prev[docType]?.version ? prev[docType].version + 1 : 1),
              uploadedAt: new Date().toISOString(),
              downloadUrl: res.data.downloadUrl,
            },
          }));
          setSuccessMessage(`Document "${file.name}" encrypted & uploaded successfully!`);
        } else {
          setErrorMessage(res.message || 'Upload failed. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingDocType(null);
      setErrorMessage(err?.message || 'Upload failed');
    }
  };

  // Document calculation
  const requiredDocs = selectedService.requiredDocuments.filter((d) => d.required);
  const totalRequiredCount = requiredDocs.length;
  const uploadedRequiredCount = requiredDocs.filter((d) => uploadedDocuments[d.type]).length;
  const progressPercent = Math.round((uploadedRequiredCount / (totalRequiredCount || 1)) * 100);
  const allRequiredCollected = uploadedRequiredCount === totalRequiredCount;

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header & Steps Indicator */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-info">Step {step} of 3</span>
          <span style={{ color: '#94a3b8' }}>•</span>
          <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
            {step === 1 ? 'Select Service' : step === 2 ? 'Customer Details' : 'Upload Required Documents'}
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', color: '#0f172a', margin: '0 0 0.5rem' }}>
          {step === 1 && 'Select Your Service'}
          {step === 2 && `Application Details: ${selectedService.title}`}
          {step === 3 && `Document Upload Center for Application ${createdApplication?.applicationNumber}`}
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          {step === 1 && 'Choose from our government, travel, identity, and verification services below.'}
          {step === 2 && 'Please fill in basic applicant information before attaching documents.'}
          {step === 3 && 'Upload the documents required specifically for this service. All files are AES-256 encrypted.'}
        </p>

        {/* Wizard Steps Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.5rem' }}>
          <div
            onClick={() => step > 1 && setStep(1)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: step === 1 ? '#f0f7f2' : '#ffffff',
              border: `1px solid ${step === 1 ? '#12372A' : '#e2e8f0'}`,
              cursor: step > 1 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step >= 1 ? '#12372A' : '#e2e8f0',
                color: step >= 1 ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              1
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>1. Select Service</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedService.title}</div>
            </div>
          </div>

          <div
            onClick={() => step > 2 && setStep(2)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: step === 2 ? '#f0f7f2' : '#ffffff',
              border: `1px solid ${step === 2 ? '#12372A' : '#e2e8f0'}`,
              cursor: step > 2 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step >= 2 ? '#12372A' : '#e2e8f0',
                color: step >= 2 ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              2
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>2. Basic Customer Info</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {customerDetails.fullName || 'Applicant Details'}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: step === 3 ? '#f0f7f2' : '#ffffff',
              border: `1px solid ${step === 3 ? '#12372A' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step === 3 ? '#12372A' : '#e2e8f0',
                color: step === 3 ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              3
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>3. Document Uploads</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {progressPercent}% completed ({uploadedRequiredCount}/{totalRequiredCount})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#b91c1c',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 500,
          }}
        >
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#15803d',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 500,
          }}
        >
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* STEP 1: SERVICE SELECTION */}
      {step === 1 && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            {services.map((svc) => {
              const isSelected = selectedService.id === svc.id;
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`card service-card ${isSelected ? 'selected' : ''}`}
                  style={{ padding: '1.5rem' }}
                >
                  {isSelected && <div className="check-circle">✓</div>}
                  <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{svc.icon}</div>
                  <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                    {svc.category}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>{svc.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {svc.tagline}
                  </p>

                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: '#64748b',
                    }}
                  >
                    <span>⏱️ {svc.estimatedProcessingDays}</span>
                    <span>📑 {svc.requiredDocuments.length} Documents Required</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                Selected: {selectedService.title}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {selectedService.requiredDocuments.length} documents will be requested based on this service.
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Proceed to Customer Details →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: BASIC CUSTOMER DETAILS */}
      {step === 2 && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '2rem' }}>{selectedService.icon}</div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>{selectedService.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                  Please provide applicant information for this service request.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateApplication}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Full Legal Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    className="form-control"
                    value={customerDetails.fullName}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email Address <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@example.com"
                    className="form-control"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Phone / Mobile Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    className="form-control"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customerDetails.dateOfBirth}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input
                    type="text"
                    placeholder="e.g. Indian"
                    className="form-control"
                    value={customerDetails.nationality}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, nationality: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    placeholder="House / Street / City / Pincode"
                    className="form-control"
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Application Notes / Special Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Any specific requests or urgencies (optional)..."
                  className="form-control"
                  value={customerDetails.notes}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                >
                  ← Back to Services
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Proceed to Documents →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 3: PARALLEL DOCUMENT UPLOAD SPACES */}
      {step === 3 && createdApplication && (
        <div>
          {/* Top Overview & Progress Card */}
          <div
            className="card"
            style={{
              marginBottom: '2rem',
              padding: '1.75rem',
              border: '1px solid #d8ebdd',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-info">{selectedService.category}</span>
                  <span className="badge badge-neutral">App ID: {createdApplication.applicationNumber}</span>
                  <span className="badge badge-success">🔒 256-Bit Encrypted</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '0.25rem 0' }}>{selectedService.title}</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                  Applicant: <strong>{customerDetails.fullName}</strong> ({customerDetails.phone})
                </p>
              </div>

              {/* Status completion banner */}
              <div>
                {allRequiredCollected ? (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                    <div>
                      <div style={{ fontWeight: 800, color: '#15803d' }}>
                        All Required Documents Uploaded!
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Synced to Document Center & Ready for Verification
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: 800, color: '#b45309' }}>
                        {totalRequiredCount - uploadedRequiredCount} Document(s) Needed
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Please upload all mandatory documents below
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ color: '#0f172a' }}>Document Upload Progress</span>
                <span style={{ color: allRequiredCollected ? '#16a34a' : '#12372A', fontWeight: 700 }}>
                  {progressPercent}% Complete ({uploadedRequiredCount} of {totalRequiredCount} required)
                </span>
              </div>
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* List of Required & Optional Document Upload Slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {selectedService.requiredDocuments.map((docSpec) => {
              const uploaded = uploadedDocuments[docSpec.type];
              const isUploading = uploadingDocType === docSpec.type;

              return (
                <div
                  key={docSpec.type}
                  className={`document-slot ${uploaded ? 'is-uploaded' : 'is-missing'}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    {/* Left: Document details and requirements */}
                    <div style={{ flex: '1 1 320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        {uploaded ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#16a34a',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '0.85rem',
                            }}
                          >
                            ✓
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#fef3c7',
                              color: '#b45309',
                              fontWeight: 900,
                              fontSize: '0.85rem',
                            }}
                          >
                            !
                          </span>
                        )}

                        <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>{docSpec.name}</h4>

                        {docSpec.required ? (
                          <span className="badge badge-danger">Required</span>
                        ) : (
                          <span className="badge badge-neutral">Optional</span>
                        )}

                        <span className="badge badge-info">Limit: {docSpec.maxSizeMb}MB</span>
                        <span className="badge badge-neutral">🔒 AES-256</span>
                      </div>

                      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                        {docSpec.description}
                      </p>

                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Accepted Formats: {docSpec.acceptedFormats.join(', ')} • Max Size: {docSpec.maxSizeMb}MB per file
                      </div>
                    </div>

                    {/* Right: Uploaded state OR Upload Action Space */}
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      {uploaded ? (
                        <div
                          style={{
                            width: '100%',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            padding: '0.875rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534' }}>
                                📄 {uploaded.fileName}
                              </span>
                              <span className="badge badge-info">v{uploaded.version}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                              {(uploaded.fileSize / 1024).toFixed(1)} KB • Encrypted On-Disk
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                              <span>🔄 Replace</span>
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                accept={docSpec.acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(',')}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(docSpec.type, file);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label
                          className="dropzone-box"
                          style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: isUploading ? 0.6 : 1,
                          }}
                        >
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            disabled={isUploading}
                            accept={docSpec.acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(',')}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(docSpec.type, file);
                            }}
                          />
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                            {isUploading ? '⏳' : '📤'}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                            {isUploading ? 'Encrypting & Uploading...' : 'Click to Upload Document'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Max 10MB (PDF, JPG, PNG, WEBP)
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1.5rem',
            }}
          >
            <Link href="/customer/documents" className="btn btn-secondary">
              📁 View in Document Center →
            </Link>

            <Link href="/customer/applications" className="btn btn-primary">
              ✓ View in My Applications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
