'use client';

import React, { useState, useEffect } from 'react';

interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  governmentFee?: number;
  serviceFee?: number;
  totalFee?: number;
  status?: string;
}

interface OfficeItem {
  id: string;
  name: string;
  address: string;
}

export default function BookAppointmentPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [serviceId, setServiceId] = useState('');
  const [appointmentType, setAppointmentType] = useState<'OFFICE_VISIT' | 'ONLINE_CONSULTATION'>('OFFICE_VISIT');
  const [officeId, setOfficeId] = useState('');
  const [consultationMode, setConsultationMode] = useState<'PHONE' | 'VIDEO' | 'WHATSAPP'>('PHONE');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Customer Information State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const candidateUrls = [
          'http://localhost:3003/api/v1/customer',
          'http://127.0.0.1:3003/api/v1/customer',
          'http://localhost:3003/v1/customer',
          'http://127.0.0.1:3003/v1/customer',
          'http://localhost:3003/customer',
        ];

        // Fetch customer profile for auto-fill if token exists
        if (token) {
          for (const baseUrl of candidateUrls) {
            try {
              const profileRes = await fetch(`${baseUrl}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (profileRes.ok) {
                const profile = await profileRes.json();
                if (profile.name) setFullName(profile.name);
                if (profile.email) setEmail(profile.email);
                if (profile.address) setAddress(profile.address);
                break;
              }
            } catch (e) {}
          }
        }

        // Fetch Active Services posted/activated by Admin
        let fetchedServices: ServiceItem[] = [];
        for (const baseUrl of candidateUrls) {
          try {
            const servicesRes = await fetch(`${baseUrl}/services`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (servicesRes.ok) {
              const rawServices: ServiceItem[] = await servicesRes.json();
              // Strict filter: only display ACTIVE services
              fetchedServices = rawServices.filter((s) => !s.status || s.status === 'ACTIVE');
              break;
            }
          } catch (e) {}
        }
        setServices(fetchedServices);
        if (fetchedServices.length > 0) {
          setServiceId(fetchedServices[0].id);
        }

        // Fetch Offices
        let fetchedOffices: OfficeItem[] = [];
        for (const baseUrl of candidateUrls) {
          try {
            const officesRes = await fetch(`${baseUrl}/offices`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (officesRes.ok) {
              fetchedOffices = await officesRes.json();
              break;
            }
          } catch (e) {}
        }
        setOffices(fetchedOffices);
        if (fetchedOffices.length > 0) {
          setOfficeId(fetchedOffices[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial data for booking', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!serviceId) {
      setMessage({ type: 'error', text: 'Please select a service' });
      return;
    }

    if (!preferredDate) {
      setMessage({ type: 'error', text: 'Please select a preferred date' });
      return;
    }

    if (!preferredTime) {
      setMessage({ type: 'error', text: 'Please select a preferred time slot' });
      return;
    }

    if (appointmentType === 'OFFICE_VISIT' && !officeId) {
      setMessage({ type: 'error', text: 'Please select an office location' });
      return;
    }

    if (appointmentType === 'ONLINE_CONSULTATION' && !contactNumber) {
      setMessage({ type: 'error', text: 'Please enter a valid contact number' });
      return;
    }

    setSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const candidateUrls = [
        'http://localhost:3003/api/v1/customer',
        'http://127.0.0.1:3003/api/v1/customer',
        'http://localhost:3003/v1/customer',
        'http://127.0.0.1:3003/v1/customer',
        'http://localhost:3003/customer',
      ];

      const payload = {
        serviceId,
        appointmentType,
        officeId: appointmentType === 'OFFICE_VISIT' ? officeId : undefined,
        consultationMode: appointmentType === 'ONLINE_CONSULTATION' ? consultationMode : undefined,
        preferredDate: new Date(preferredDate).toISOString(),
        preferredTime,
        contactNumber: contactNumber || email || '+962790000000',
        address,
        notes,
      };

      let res: Response | null = null;
      let errorMsg = 'Failed to submit appointment';

      for (const baseUrl of candidateUrls) {
        try {
          res = await fetch(`${baseUrl}/appointments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) break;
          const errData = await res.json().catch(() => ({}));
          if (errData.message) errorMsg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
        } catch (e) {}
      }

      if (!res || !res.ok) {
        throw new Error(errorMsg);
      }

      const createdAppointment = await res.json();
      setMessage({
        type: 'success',
        text: `Appointment ${createdAppointment.appointmentNumber || ''} confirmed and booked successfully!`,
      });

      // Reset Form fields
      setPreferredDate('');
      setPreferredTime('');
      setNotes('');
      setUploadedFiles([]);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while booking appointment.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 border-b border-slate-100 pb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">BOOK APPOINTMENT</h2>
          <p className="mt-1 text-sm text-slate-500">Fill in the details below to schedule your consultation</p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl p-4 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Service <span className="text-red-500">*</span>
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="" disabled>
                Select Service
              </option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} {svc.totalFee ? `($${svc.totalFee})` : ''}
                </option>
              ))}
            </select>
            {services.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">No active services currently available for booking.</p>
            )}
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Appointment Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="appointmentType"
                  value="OFFICE_VISIT"
                  checked={appointmentType === 'OFFICE_VISIT'}
                  onChange={() => setAppointmentType('OFFICE_VISIT')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                Office Visit
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="appointmentType"
                  value="ONLINE_CONSULTATION"
                  checked={appointmentType === 'ONLINE_CONSULTATION'}
                  onChange={() => setAppointmentType('ONLINE_CONSULTATION')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                Online Consultation
              </label>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Dynamic Fields: Office Visit vs Online */}
          {appointmentType === 'OFFICE_VISIT' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="" disabled>
                      Select Time Slot
                    </option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Office / Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={officeId}
                  onChange={(e) => setOfficeId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="" disabled>
                    Select Office
                  </option>
                  {offices.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} ({off.address})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Consultation Mode <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="consultationMode"
                      value="PHONE"
                      checked={consultationMode === 'PHONE'}
                      onChange={() => setConsultationMode('PHONE')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    Phone
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="consultationMode"
                      value="VIDEO"
                      checked={consultationMode === 'VIDEO'}
                      onChange={() => setConsultationMode('VIDEO')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    Video
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="consultationMode"
                      value="WHATSAPP"
                      checked={consultationMode === 'WHATSAPP'}
                      onChange={() => setConsultationMode('WHATSAPP')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    WhatsApp
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="" disabled>
                      Select Time Slot
                    </option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+962 79XXXXXXX"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>
          )}

          <hr className="border-slate-100" />

          {/* Customer Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Customer Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
              <input
                type="text"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes</label>
              <textarea
                rows={3}
                placeholder="Any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Supporting Documents</label>
              <div className="flex flex-col gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-fit">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>+ Upload Documents</span>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>

                {uploadedFiles.length > 0 && (
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, i) => (
                      <li key={i} className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                        <span>{file.name}</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:underline">
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-700 py-3.5 px-6 font-bold text-white shadow-md hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting Appointment...' : 'Submit Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
