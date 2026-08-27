'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  fetchServices,
  fetchOffices,
  fetchCustomerProfile,
  createAppointment,
  requestDocumentUploadUrl,
  uploadFileToSignedUrl,
  completeDocumentUpload,
  AppointmentType,
  ConsultationMode,
  Appointment,
} from '../../lib/api/appointments';
import { ServiceSelect } from './ServiceSelect';
import { AppointmentTypeToggle } from './AppointmentTypeToggle';
import { OfficeVisitFields } from './OfficeVisitFields';
import { OnlineConsultationFields } from './OnlineConsultationFields';
import { CustomerInfoFields } from './CustomerInfoFields';
import { DocumentUploader, PendingFile } from './DocumentUploader';
import { SubmitAppointmentButton } from './SubmitAppointmentButton';
import { CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export function BookAppointmentForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form State
  const [serviceId, setServiceId] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('OFFICE_VISIT');
  const [officeId, setOfficeId] = useState('');
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('VIDEO');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Data Queries
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  });

  const { data: offices = [] } = useQuery({
    queryKey: ['offices'],
    queryFn: fetchOffices,
  });

  const { data: profile = null, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: async () => {
      try {
        const res = await fetchCustomerProfile();
        if (res?.contactNumber) {
          setContactNumber(res.contactNumber);
        }
        if (res?.address) {
          setAddress(res.address);
        }
        return res;
      } catch {
        return null;
      }
    },
  });

  // Handle file additions
  const handleAddFiles = (newFiles: File[]) => {
    const items: PendingFile[] = newFiles.map((f, idx) => ({
      id: `${Date.now()}_${idx}`,
      file: f,
      documentType: f.name.toLowerCase().includes('passport')
        ? 'passport_copy'
        : f.name.toLowerCase().includes('license')
        ? 'trade_license'
        : 'supporting_document',
      progress: 0,
      status: 'pending',
    }));
    setPendingFiles((prev) => [...prev, ...items]);
  };

  const handleRemoveFile = (fileId: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Submit Mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      // 1. Validate Form Fields
      const errors: Record<string, string> = {};

      if (!serviceId) errors.serviceId = 'Please select a service';
      if (!preferredDate) errors.preferredDate = 'Preferred date is required';
      if (!preferredTime) errors.preferredTime = 'Preferred time slot is required';

      if (appointmentType === 'OFFICE_VISIT') {
        if (!officeId) errors.officeId = 'Please select an office location';
      } else {
        if (!consultationMode) errors.consultationMode = 'Please select a consultation mode';
        if (!contactNumber.trim()) errors.contactNumber = 'Contact phone number is required';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        throw new Error('Please correct all validation errors');
      }

      setValidationErrors({});

      // 2. Submit Appointment
      const result = await createAppointment({
        serviceId,
        appointmentType,
        officeId: appointmentType === 'OFFICE_VISIT' ? officeId : undefined,
        consultationMode: appointmentType === 'ONLINE_CONSULTATION' ? consultationMode : undefined,
        preferredDate,
        preferredTime,
        contactNumber: appointmentType === 'ONLINE_CONSULTATION' ? contactNumber : (profile?.contactNumber || contactNumber || '+962790000000'),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // 3. Process Document Uploads
      if (pendingFiles.length > 0) {
        for (const item of pendingFiles) {
          try {
            setPendingFiles((prev) =>
              prev.map((pf) => (pf.id === item.id ? { ...pf, status: 'uploading' } : pf))
            );

            const { uploadUrl, storagePath } = await requestDocumentUploadUrl(result.id, {
              documentType: item.documentType,
              fileName: item.file.name,
              mimeType: item.file.type,
              fileSize: item.file.size,
            });

            await uploadFileToSignedUrl(uploadUrl, item.file);

            const fileExt = item.file.name.split('.').pop() || 'pdf';
            await completeDocumentUpload(result.id, {
              storagePath,
              fileName: item.file.name,
              fileType: fileExt,
              fileSize: item.file.size,
            });

            setPendingFiles((prev) =>
              prev.map((pf) => (pf.id === item.id ? { ...pf, status: 'completed' } : pf))
            );
          } catch (fileErr) {
            console.error(`Failed to upload ${item.file.name}`, fileErr);
            setPendingFiles((prev) =>
              prev.map((pf) => (pf.id === item.id ? { ...pf, status: 'error', error: 'Upload failed' } : pf))
            );
          }
        }
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setCreatedAppointment(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookingMutation.mutate();
  };

  // SUCCESS CONFIRMATION STATE
  if (createdAppointment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-card max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full mb-2">
            Booking Confirmed
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Request Submitted!</h2>
          <p className="text-sm text-slate-600 mt-1">
            Your appointment reference number:
          </p>
          <div className="mt-3 inline-block bg-slate-100 text-slate-900 font-mono font-semibold text-lg px-4 py-2 rounded-xl border border-slate-200">
            {createdAppointment.appointmentNumber}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-left space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">Service:</span>
            <span className="font-semibold text-slate-900">{createdAppointment.service.name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">Type:</span>
            <span className="font-semibold text-slate-900">
              {createdAppointment.appointmentType === 'OFFICE_VISIT'
                ? `Office Visit (${createdAppointment.office?.name || 'Branch Office'})`
                : `Online Consultation (${createdAppointment.consultationMode})`}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">Scheduled Date & Time:</span>
            <span className="font-semibold text-blue-600">
              {new Date(createdAppointment.preferredDate).toLocaleDateString()} at{' '}
              {createdAppointment.preferredTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Status:</span>
            <span className="font-semibold text-amber-600">Pending Advisor Confirmation</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.push('/customer/appointments')}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>View My Appointments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCreatedAppointment(null);
              setServiceId('');
              setPreferredDate('');
              setPreferredTime('');
              setAddress('');
              setNotes('');
              setPendingFiles([]);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {bookingMutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Failed to submit appointment</p>
            <p className="text-xs mt-0.5 text-red-700">
              {(bookingMutation.error as Error)?.message || 'An error occurred during submission. Please try again.'}
            </p>
          </div>
        </div>
      )}

      {/* 1. Service Type Dropdown */}
      <ServiceSelect
        services={services}
        selectedServiceId={serviceId}
        onChange={(id) => {
          setServiceId(id);
          setValidationErrors((prev) => ({ ...prev, serviceId: '' }));
        }}
        error={validationErrors.serviceId}
        isLoading={isLoadingServices}
      />

      {/* 2. Appointment Type Toggle Cards */}
      <AppointmentTypeToggle
        value={appointmentType}
        onChange={(type) => {
          setAppointmentType(type);
          setValidationErrors({});
        }}
      />

      {/* 3. Conditional Details Box */}
      {appointmentType === 'OFFICE_VISIT' ? (
        <OfficeVisitFields
          offices={offices}
          officeId={officeId}
          preferredDate={preferredDate}
          preferredTime={preferredTime}
          onOfficeChange={(id) => {
            setOfficeId(id);
            setValidationErrors((prev) => ({ ...prev, officeId: '' }));
          }}
          onDateChange={(d) => {
            setPreferredDate(d);
            setValidationErrors((prev) => ({ ...prev, preferredDate: '' }));
          }}
          onTimeChange={(t) => {
            setPreferredTime(t);
            setValidationErrors((prev) => ({ ...prev, preferredTime: '' }));
          }}
          errors={{
            officeId: validationErrors.officeId,
            preferredDate: validationErrors.preferredDate,
            preferredTime: validationErrors.preferredTime,
          }}
        />
      ) : (
        <OnlineConsultationFields
          consultationMode={consultationMode}
          preferredDate={preferredDate}
          preferredTime={preferredTime}
          contactNumber={contactNumber}
          onModeChange={(m) => {
            setConsultationMode(m);
            setValidationErrors((prev) => ({ ...prev, consultationMode: '' }));
          }}
          onDateChange={(d) => {
            setPreferredDate(d);
            setValidationErrors((prev) => ({ ...prev, preferredDate: '' }));
          }}
          onTimeChange={(t) => {
            setPreferredTime(t);
            setValidationErrors((prev) => ({ ...prev, preferredTime: '' }));
          }}
          onContactChange={(c) => {
            setContactNumber(c);
            setValidationErrors((prev) => ({ ...prev, contactNumber: '' }));
          }}
          errors={{
            consultationMode: validationErrors.consultationMode,
            preferredDate: validationErrors.preferredDate,
            preferredTime: validationErrors.preferredTime,
            contactNumber: validationErrors.contactNumber,
          }}
        />
      )}

      {/* 4. Customer Information Box with Editable Address */}
      <CustomerInfoFields
        profile={profile}
        address={address}
        onAddressChange={setAddress}
        notes={notes}
        onNotesChange={setNotes}
        isLoadingProfile={isLoadingProfile}
      />

      {/* 5. Supporting Documents Dropzone */}
      <DocumentUploader
        files={pendingFiles}
        onAddFiles={handleAddFiles}
        onRemoveFile={handleRemoveFile}
      />

      {/* 6. Submit Button */}
      <SubmitAppointmentButton
        isDisabled={!serviceId || !preferredDate || !preferredTime}
        isSubmitting={bookingMutation.isPending}
      />
    </form>
  );
}
