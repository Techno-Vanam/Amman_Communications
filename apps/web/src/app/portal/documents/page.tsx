'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  FileCheck,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import { useNotifications } from '@/context/NotificationContext';

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  size: string;
  date: string;
  status: string;
  statusBg: string;
}

export default function PortalDocumentsPage() {
  const { showToast } = useNotifications();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Identity Proof');

  const handleUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc = {
        id: `DOC-${Date.now().toString().slice(-3)}`,
        name: file.name,
        category: selectedCategory,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: 'Just now',
        status: 'Under Verification',
        statusBg: 'bg-blue-100 text-blue-900',
      };
      setDocuments([newDoc, ...documents]);
      showToast('Document Uploaded Successfully!', `${file.name} saved to your repository.`);
    }
  };

  const handleReuploadDocument = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                date: 'Just now (Re-uploaded)',
                status: 'Under Verification',
                statusBg: 'bg-blue-100 text-blue-900'
              }
            : d
        )
      );
      showToast('Document Re-uploaded Successfully!', `${file.name} replaced and submitted for verification.`);
    }
  };

  const handleDownloadDocument = (docName: string, category: string) => {
    const fileTitle = docName || 'Document';
    const content = `=====================================================
AMMAN COMMUNICATIONS - OFFICIAL DOCUMENT REPOSITORY
=====================================================
Document Name    : ${fileTitle}
Category / Type  : ${category || 'General Document'}
Verification ID  : VERIFIED-DOC-${Math.floor(100000 + Math.random() * 900000)}
Downloaded Date  : ${new Date().toLocaleString()}
Status           : Official Verified Vault Document
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = fileTitle.includes('.') ? fileTitle : `${fileTitle}.pdf`;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Document Download Started', `${cleanName} saved to your device.`);
  };

  const handleDeleteDocument = (docId: string) => {
    const docToDelete = documents.find((d) => d.id === docId);
    setDocuments(documents.filter((d) => d.id !== docId));
    if (docToDelete) {
      showToast('Document Deleted', `${docToDelete.name} was removed from your vault.`);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8 font-sans">
      {/* Drag and Drop Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        className={`bg-white border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragging ? 'border-[#12372A] bg-[#f0f7f2]' : 'border-gray-300 hover:border-[#12372A]'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#12372A] flex items-center justify-center mx-auto">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">Upload Official Documents</h3>
            <p className="text-xs text-gray-500 mt-1">
              Drag & drop files here, or browse from your computer. Supported formats: PDF, PNG, JPG (Max 15MB).
            </p>
          </div>

          {/* Select Category */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-xs sm:max-w-sm mx-auto text-left">
            <span className="text-xs font-semibold text-gray-700 shrink-0 text-center sm:text-left">Document Type:</span>
            <div className="flex-1 min-w-0">
              <CustomSelect
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: 'Identity Proof', label: 'Identity Proof (Aadhaar/PAN/Passport)' },
                  { value: 'EC Certificate', label: 'EC Certificate' },
                  { value: 'Property Deed', label: 'Property Sale Deed' },
                  { value: 'Revenue Extract', label: 'Revenue Extract / Patta' }
                ]}
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm">
            <Plus className="w-4 h-4 text-[#a8d5b9]" />
            <span>Browse Computer</span>
            <input type="file" onChange={handleUploadSimulate} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
          </label>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#12372A]" />
            Uploaded Documents ({documents.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {documents.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500 space-y-2">
              <FileText className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700">No Documents Uploaded Yet</p>
              <p className="text-[11px] text-gray-500">Select a document type and click &quot;Browse Computer&quot; above to upload your first document.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#12372A]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{doc.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.statusBg}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>Category: <strong className="text-gray-700">{doc.category}</strong></span>
                      <span>•</span>
                      <span>Size: {doc.size}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadDocument(doc.name, doc.category)}
                    className="p-2 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold border border-blue-200 shadow-2xs"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>

                  {/* Re-upload / Replace Button */}
                  <label
                    className="p-2 text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold border border-emerald-200 shadow-2xs"
                    title="Re-upload / Replace Document"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Re-upload</span>
                    <input
                      type="file"
                      onChange={(e) => handleReuploadDocument(doc.id, e)}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </label>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}