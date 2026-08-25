'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import {
  createAdminService,
  deleteAdminService,
  fetchAdminServices,
  fetchAdminServiceStats,
  updateAdminService,
  updateAdminServiceStatus
} from './actions';
import { Service, ServiceStats, ServiceStatus } from '@/lib/api/services';

interface FormDocument {
  id?: string;
  name: string;
  displayOrder: number;
  isRequired: boolean;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formGovernmentFee, setFormGovernmentFee] = useState<string>('0');
  const [formServiceFee, setFormServiceFee] = useState<string>('0');
  const [formEstimatedTime, setFormEstimatedTime] = useState<string>('');
  const [formStatus, setFormStatus] = useState<ServiceStatus>('DRAFT');
  const [formDocuments, setFormDocuments] = useState<FormDocument[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal
  const [viewingService, setViewingService] = useState<Service | null>(null);

  // Delete Confirm Modal
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [statsRes, servicesRes] = await Promise.all([
      fetchAdminServiceStats(),
      fetchAdminServices(search, selectedStatus)
    ]);

    if (statsRes.error) setError(statsRes.error);
    else if (statsRes.stats) setStats(statsRes.stats);

    if (servicesRes.error) setError(servicesRes.error);
    else if (servicesRes.services) setServices(servicesRes.services);

    setLoading(false);
  }, [search, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Form Open (New Service)
  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormName('');
    setFormDescription('');
    setFormGovernmentFee('0');
    setFormServiceFee('0');
    setFormEstimatedTime('3-5 Business Days');
    setFormStatus('DRAFT');
    setFormDocuments([
      { name: 'Identity Proof / National ID', displayOrder: 1, isRequired: true },
      { name: 'Proof of Address / Utility Bill', displayOrder: 2, isRequired: true }
    ]);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Handle Form Open (Edit Service)
  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setFormName(service.name);
    setFormDescription(service.description || '');
    setFormGovernmentFee(service.governmentFee.toString());
    setFormServiceFee(service.serviceFee.toString());
    setFormEstimatedTime(service.estimatedTime || '');
    setFormStatus(service.status);
    setFormDocuments(
      (service.requiredDocuments || []).map((doc, idx) => ({
        id: doc.id,
        name: doc.name,
        displayOrder: doc.displayOrder ?? idx + 1,
        isRequired: doc.isRequired ?? true
      }))
    );
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Document Management in Form
  const handleAddDocument = () => {
    setFormDocuments((prev) => [
      ...prev,
      { name: '', displayOrder: prev.length + 1, isRequired: true }
    ]);
  };

  const handleRemoveDocument = (index: number) => {
    setFormDocuments((prev) =>
      prev.filter((_, i) => i !== index).map((doc, i) => ({ ...doc, displayOrder: i + 1 }))
    );
  };

  const handleUpdateDocument = (index: number, key: keyof FormDocument, value: string | number | boolean) => {
    setFormDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [key]: value } : doc))
    );
  };

  const handleMoveDocument = (index: number, direction: 'UP' | 'DOWN') => {
    if (
      (direction === 'UP' && index === 0) ||
      (direction === 'DOWN' && index === formDocuments.length - 1)
    ) {
      return;
    }
    const newDocs = [...formDocuments];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const temp = newDocs[index];
    newDocs[index] = newDocs[targetIndex];
    newDocs[targetIndex] = temp;
    // Reassign display orders
    setFormDocuments(newDocs.map((doc, i) => ({ ...doc, displayOrder: i + 1 })));
  };

  // Submit Create/Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Frontend Validations
    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('Service Name is required and must be at least 2 characters.');
      return;
    }

    const govFee = parseFloat(formGovernmentFee);
    const svcFee = parseFloat(formServiceFee);

    if (isNaN(govFee) || govFee < 0) {
      setFormError('Government Fee must be a valid non-negative number.');
      return;
    }

    if (isNaN(svcFee) || svcFee < 0) {
      setFormError('Service Fee must be a valid non-negative number.');
      return;
    }

    const validDocs = formDocuments
      .map((d) => ({ ...d, name: d.name.trim() }))
      .filter((d) => d.name.length > 0);

    if (validDocs.length === 0) {
      setFormError('At least one valid required document must be added.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      governmentFee: govFee,
      serviceFee: svcFee,
      estimatedTime: formEstimatedTime.trim() || undefined,
      status: formStatus,
      requiredDocuments: validDocs.map((d, idx) => ({
        id: d.id,
        name: d.name,
        displayOrder: idx + 1,
        isRequired: d.isRequired
      }))
    };

    if (editingService) {
      const res = await updateAdminService(editingService.id, payload);
      if (res.error) {
        setFormError(res.error);
      } else {
        setSuccessMessage(`Service "${editingService.name}" updated successfully.`);
        setIsFormModalOpen(false);
        loadData();
      }
    } else {
      const res = await createAdminService(payload);
      if (res.error) {
        setFormError(res.error);
      } else {
        setSuccessMessage(`Service "${payload.name}" created successfully.`);
        setIsFormModalOpen(false);
        loadData();
      }
    }

    setIsSubmitting(false);
  };

  // Status Toggle (Activate / Deactivate)
  const handleToggleStatus = async (service: Service) => {
    const nextStatus: ServiceStatus =
      service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const res = await updateAdminServiceStatus(service.id, nextStatus);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(
        `Service "${service.name}" is now ${nextStatus === 'ACTIVE' ? 'Activated' : 'Deactivated'}.`
      );
      loadData();
    }
  };

  // Delete Action
  const handleDeleteService = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteAdminService(deletingService.id);
    if (res.error) {
      setDeleteError(res.error);
    } else {
      setSuccessMessage(`Service "${deletingService.name}" deleted successfully.`);
      setDeletingService(null);
      loadData();
    }
    setIsDeleting(false);
  };

  // Fee calculation helper
  const govVal = parseFloat(formGovernmentFee) || 0;
  const svcVal = parseFloat(formServiceFee) || 0;
  const calculatedTotal = (govVal + svcVal).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Admin Portal
            </p>
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-500">Service Management</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Services & Fee Catalog
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure application services, government & service fee structures, and document verification criteria.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Service</span>
        </button>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'TOTAL SERVICES',
            value: stats ? stats.total : '--',
            sub: 'All services configured',
            statusKey: 'ALL',
            badgeBg: 'bg-gray-100 text-gray-800 border-gray-200',
          },
          {
            label: 'ACTIVE SERVICES',
            value: stats ? stats.active : '--',
            sub: 'Available for customer applications',
            statusKey: 'ACTIVE',
            badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          },
          {
            label: 'INACTIVE SERVICES',
            value: stats ? stats.inactive : '--',
            sub: 'Deactivated / Archived',
            statusKey: 'INACTIVE',
            badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          },
          {
            label: 'DRAFT SERVICES',
            value: stats ? stats.draft : '--',
            sub: 'In setup / Hidden from customers',
            statusKey: 'DRAFT',
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          },
        ].map((card) => {
          const isSelected = selectedStatus === card.statusKey;
          return (
            <button
              key={card.label}
              onClick={() => setSelectedStatus(card.statusKey)}
              className={`flex flex-col text-left rounded-xl border p-5 transition shadow-sm ${
                isSelected
                  ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-700/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  {card.label}
                </span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${card.badgeBg}`}>
                  {card.value}
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-gray-500">{card.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 pb-2 md:border-none md:pb-0">
          {[
            { id: 'ALL', label: 'All Services' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'DRAFT', label: 'Drafts' },
            { id: 'INACTIVE', label: 'Inactive' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                selectedStatus === tab.id
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search service by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Service Table / List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-700" />
            <p className="mt-3 text-sm font-medium">Loading service catalog...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-gray-100 p-4 text-gray-400">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              {search || selectedStatus !== 'ALL'
                ? 'No services match your active search filter criteria. Try resetting filters.'
                : 'Get started by creating your first service.'}
            </p>
            {search || selectedStatus !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('ALL');
                }}
                className="mt-4 text-sm font-semibold text-emerald-800 hover:text-emerald-900 underline"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <Plus className="h-4 w-4" /> New Service
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Service Name</th>
                  <th scope="col" className="px-6 py-3.5">Required Documents</th>
                  <th scope="col" className="px-6 py-3.5">Govt Fee</th>
                  <th scope="col" className="px-6 py-3.5">Service Fee</th>
                  <th scope="col" className="px-6 py-3.5">Total Fee</th>
                  <th scope="col" className="px-6 py-3.5">Est. Time</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50/80 transition">
                    {/* Name & Description */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      {service.description && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1 max-w-xs">
                          {service.description}
                        </p>
                      )}
                    </td>

                    {/* Required Documents */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                          <FileText className="h-3 w-3" />
                          {service.requiredDocuments?.length || 0} Docs
                        </span>
                        {service.requiredDocuments?.slice(0, 2).map((doc) => (
                          <span
                            key={doc.id || doc.name}
                            className="inline-block max-w-[120px] truncate rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600"
                            title={doc.name}
                          >
                            {doc.name}
                          </span>
                        ))}
                        {(service.requiredDocuments?.length || 0) > 2 && (
                          <span className="text-[11px] text-gray-400 font-medium">
                            +{(service.requiredDocuments?.length || 0) - 2} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Govt Fee */}
                    <td className="px-6 py-4 font-medium text-gray-700">
                      ${Number(service.governmentFee).toFixed(2)}
                    </td>

                    {/* Service Fee */}
                    <td className="px-6 py-4 font-medium text-gray-700">
                      ${Number(service.serviceFee).toFixed(2)}
                    </td>

                    {/* Total Fee */}
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ${Number(service.totalFee).toFixed(2)}
                    </td>

                    {/* Est Time */}
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{service.estimatedTime || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {service.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          ACTIVE
                        </span>
                      )}
                      {service.status === 'DRAFT' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                          DRAFT
                        </span>
                      )}
                      {service.status === 'INACTIVE' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          INACTIVE
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setViewingService(service)}
                        className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(service)}
                        className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                        title="Edit Service"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(service)}
                        className={`px-2 py-1 text-xs font-semibold rounded-lg border transition ${
                          service.status === 'ACTIVE'
                            ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {service.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => setDeletingService(service)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT SERVICE MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingService ? 'Edit Service' : 'Create New Service'}
                </h3>
                <p className="text-xs text-gray-500">
                  Define service details, fees, and required documents.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 font-medium">
                  {formError}
                </div>
              )}

              {/* Service Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Fiber Broadband"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the service..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              {/* Fees Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Government Fee ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formGovernmentFee}
                    onChange={(e) => setFormGovernmentFee(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Service Fee ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formServiceFee}
                    onChange={(e) => setFormServiceFee(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Total Fee ($)
                  </label>
                  <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-900">
                    ${calculatedTotal}
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">Calculated server-side</p>
                </div>
              </div>

              {/* Estimated Time & Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Estimated Fulfillment Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3-5 Business Days"
                    value={formEstimatedTime}
                    onChange={(e) => setFormEstimatedTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Service Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ServiceStatus)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  >
                    <option value="DRAFT">DRAFT (Hidden from customers)</option>
                    <option value="ACTIVE">ACTIVE (Available for customer applications)</option>
                    <option value="INACTIVE">INACTIVE (Deactivated)</option>
                  </select>
                </div>
              </div>

              {/* Required Documents Section */}
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Required Customer Documents <span className="text-rose-500">*</span>
                    </h4>
                    <p className="text-xs text-gray-500">
                      Specify documents the customer must upload during application submission.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Document
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 shrink-0">
                        {index + 1}
                      </span>

                      <input
                        type="text"
                        placeholder="Document Name (e.g. Commercial Registration)"
                        value={doc.name}
                        onChange={(e) => handleUpdateDocument(index, 'name', e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none"
                      />

                      <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doc.isRequired}
                          onChange={(e) =>
                            handleUpdateDocument(index, 'isRequired', e.target.checked)
                          }
                          className="rounded text-emerald-700 focus:ring-emerald-600"
                        />
                        <span>Required</span>
                      </label>

                      {/* Reorder Controls */}
                      <div className="flex items-center shrink-0 border-l border-gray-300 pl-2 space-x-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveDocument(index, 'UP')}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === formDocuments.length - 1}
                          onClick={() => handleMoveDocument(index, 'DOWN')}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Delete Doc */}
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(index)}
                        className="p-1 text-gray-400 hover:text-rose-600 shrink-0"
                        title="Remove Document"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : editingService ? (
                    'Update Service'
                  ) : (
                    'Save Service'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SERVICE DETAILS MODAL */}
      {viewingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 bg-emerald-900 px-6 py-4 text-white">
              <div>
                <h3 className="text-lg font-bold">{viewingService.name}</h3>
                <span className="text-xs text-emerald-200 uppercase font-semibold">
                  Status: {viewingService.status}
                </span>
              </div>
              <button
                onClick={() => setViewingService(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700">
              {viewingService.description && (
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">Description</p>
                  <p className="mt-1 text-gray-900">{viewingService.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase">Govt Fee</p>
                  <p className="text-base font-bold text-gray-900">
                    ${Number(viewingService.governmentFee).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase">Service Fee</p>
                  <p className="text-base font-bold text-gray-900">
                    ${Number(viewingService.serviceFee).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-emerald-800 font-bold uppercase">Total Fee</p>
                  <p className="text-base font-bold text-emerald-900">
                    ${Number(viewingService.totalFee).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Estimated Fulfillment Time</p>
                <p className="mt-1 text-gray-900 font-medium">
                  {viewingService.estimatedTime || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-500 mb-2">
                  Required Customer Documents ({viewingService.requiredDocuments?.length || 0})
                </p>
                <ul className="space-y-1.5">
                  {viewingService.requiredDocuments?.map((doc, idx) => (
                    <li
                      key={doc.id || idx}
                      className="flex items-center justify-between rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-emerald-700" />
                        {doc.displayOrder}. {doc.name}
                      </span>
                      {doc.isRequired && (
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                          REQUIRED
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewingService(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">Delete Service</h3>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong className="text-gray-900">{deletingService.name}</strong>?
            </p>

            {deleteError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingService(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteService}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
