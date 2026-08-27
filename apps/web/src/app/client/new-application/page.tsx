'use client';

import React, { useState, useEffect } from 'react';
import { SERVICES_CATALOG, ServiceDefinition } from '@repo/shared-types';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

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
  const [selectedService, setSelectedService] = useState<ServiceDefinition>(SERVICES_CATALOG[0]);
  
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

  // Load services catalog
  const services = SERVICES_CATALOG;

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
  const progressPercent = Math.round((uploadedRequiredCount / totalRequiredCount) * 100);
  const allRequiredCollected = uploadedRequiredCount === totalRequiredCount;

  return (
    <div className="app-container">
      {/* Header & Steps Indicator */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-info">Step {step} of 3</span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {step === 1 ? 'Select Service' : step === 2 ? 'Customer Details' : 'Upload Required Documents'}
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          {step === 1 && 'Select Your Required Service'}
          {step === 2 && `Application Details: ${selectedService.title}`}
          {step === 3 && `Document Upload Center for Application ${createdApplication?.applicationNumber}`}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {step === 1 && 'Choose from our government, travel, corporate, and verification services below.'}
          {step === 2 && 'Please fill in basic applicant information before attaching documents.'}
          {step === 3 && 'Upload the documents required specifically for this service. All files are 256-bit encrypted.'}
        </p>

        {/* Wizard Steps Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.5rem' }}>
          <div
            onClick={() => step > 1 && setStep(1)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: step === 1 ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
              border: `1px solid ${step === 1 ? 'var(--primary)' : 'var(--border)'}`,
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
                background: step >= 1 ? 'var(--primary)' : 'var(--border)',
                color: '#0b0f19',
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
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>1. Select Service</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{selectedService.title}</div>
            </div>
          </div>

          <div
            onClick={() => step > 2 && setStep(2)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: step === 2 ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
              border: `1px solid ${step === 2 ? 'var(--primary)' : 'var(--border)'}`,
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
                background: step >= 2 ? 'var(--primary)' : 'var(--border)',
                color: '#0b0f19',
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
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>2. Basic Customer Info</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {customerDetails.fullName || 'Applicant Details'}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: step === 3 ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
              border: `1px solid ${step === 3 ? 'var(--primary)' : 'var(--border)'}`,
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
                background: step === 3 ? 'var(--primary)' : 'var(--border)',
                color: '#0b0f19',
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
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>3. Document Uploads</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
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
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-sm)',
            color: '#fca5a5',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
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
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-sm)',
            color: '#86efac',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SERVICE SELECTION */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
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
                >
                  {isSelected && <div className="check-circle">✓</div>}
                  <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{svc.icon}</div>
                  <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                    {svc.category}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{svc.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {svc.tagline}
                  </p>

                  <div
                    style={{
                      borderTop: '1px solid var(--border)',
                      paddingTop: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text-dim)',
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
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Selected: {selectedService.title}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {selectedService.requiredDocuments.length} documents will be requested based on this service.
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Proceed to Customer Details →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: BASIC CUSTOMER DETAILS */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '1.75rem' }}>{selectedService.icon}</div>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>{selectedService.title}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  Please provide applicant information for this service request.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateApplication}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Full Legal Name <span style={{ color: '#ef4444' }}>*</span>
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
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
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
                    Phone / Mobile Number <span style={{ color: '#ef4444' }}>*</span>
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

      {/* ========================================================================= */}
      {/* STEP 3: PARALLEL DOCUMENT UPLOAD SPACES */}
      {/* ========================================================================= */}
      {step === 3 && createdApplication && (
        <div>
          {/* Top Overview & Progress Card */}
          <div
            className="card card-glow"
            style={{
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, rgba(19, 27, 46, 0.95), rgba(11, 23, 44, 0.95))',
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
                <h2 style={{ fontSize: '1.75rem' }}>{selectedService.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Applicant: <strong>{customerDetails.fullName}</strong> ({customerDetails.phone})
                </p>
              </div>

              {/* Status completion banner */}
              <div>
                {allRequiredCollected ? (
                  <div
                    style={{
                      background: 'var(--success-bg)',
                      border: '1px solid var(--success-border)',
                      padding: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--success)' }}>
                        All Required Documents Uploaded!
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Synced to Document Center & Ready for Verification
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'var(--warning-bg)',
                      border: '1px solid var(--warning-border)',
                      padding: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--warning)' }}>
                        {totalRequiredCount - uploadedRequiredCount} Document(s) Needed
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
                <span>Document Upload Progress</span>
                <span style={{ color: allRequiredCollected ? 'var(--success)' : 'var(--primary)' }}>
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
                              background: '#10b981',
                              color: '#0b0f19',
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
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: '#f59e0b',
                              fontWeight: 900,
                              fontSize: '0.85rem',
                            }}
                          >
                            !
                          </span>
                        )}

                        <h4 style={{ fontSize: '1.1rem' }}>{docSpec.name}</h4>

                        {docSpec.required ? (
                          <span className="badge badge-warning">Required</span>
                        ) : (
                          <span className="badge badge-neutral">Optional</span>
                        )}

                        <span className="badge badge-info">Limit: {docSpec.maxSizeMb}MB</span>
                        <span className="badge badge-neutral">🔒 AES-256</span>
                      </div>

                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {docSpec.description}
                      </p>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Accepted Formats: {docSpec.acceptedFormats.join(', ')} • Max Size: {docSpec.maxSizeMb}MB per file
                      </div>
                    </div>

                    {/* Right: Uploaded state OR Upload Action Space */}
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      {uploaded ? (
                        <div
                          style={{
                            width: '100%',
                            background: 'rgba(16, 185, 129, 0.08)',
                            border: '1px solid var(--success-border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.875rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#86efac' }}>
                                📄 {uploaded.fileName}
                              </span>
                              <span className="badge badge-info">v{uploaded.version}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
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
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                            {isUploading ? 'Encrypting & Uploading...' : 'Click to Upload Document'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
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
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
            }}
          >
            <Link href="/client/documents" className="btn btn-secondary">
              📁 View in Document Center →
            </Link>

            <Link href="/client/dashboard" className="btn btn-primary">
              ✓ Finish & Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
