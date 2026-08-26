'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Eye,
  Download,
  FileCheck,
  Plus,
  Lock
} from 'lucide-react';

const INITIAL_DOCS = [
  {
    id: 'DOC-101',
    name: 'Encumbrance_Certificate_2026.pdf',
    category: 'EC Certificate',
    size: '2.4 MB',
    date: 'Yesterday, 10:30 AM',
    status: 'Verified',
    statusBg: 'bg-[#d8ebdd] text-[#12372A]',
  },
  {
    id: 'DOC-102',
    name: 'Aadhaar_Card_JohnDoe.pdf',
    category: 'Identity Proof',
    size: '1.1 MB',
    date: '12 Aug 2026',
    status: 'Action Required',
    statusBg: 'bg-amber-100 text-amber-900',
  },
  {
    id: 'DOC-103',
    name: 'Property_Sale_Deed_Copy.pdf',
    category: 'Property Deed',
    size: '4.8 MB',
    date: '05 Aug 2026',
    status: 'Under Verification',
    statusBg: 'bg-blue-100 text-blue-900',
  },
  {
    id: 'DOC-104',
    name: 'Patta_Extract_Document.pdf',
    category: 'Revenue Extract',
    size: '850 KB',
    date: '20 Jul 2026',
    status: 'Verified',
    statusBg: 'bg-[#d8ebdd] text-[#12372A]',
  },
];

import { useNotifications } from '@/context/NotificationContext';

export default function PortalDocumentsPage() {
  const { showToast } = useNotifications();
  const [documents, setDocuments] = useState<typeof INITIAL_DOCS>([]);
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#12372A] tracking-wider uppercase mb-1">
          <Upload className="w-4 h-4 text-[#2e8a60]" />
          <span>Document Repository</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Document Upload &amp; Management
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload essential certificates, government IDs, and legal deeds for official verification.
        </p>
      </div>

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
          <div className="w-14 h-14 rounded-2xl bg-[#f0f7f2] text-[#12372A] border border-[#a8d5b9]/50 flex items-center justify-center mx-auto shadow-inner">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">Upload Your Document</h3>
            <p className="text-xs text-gray-500 mt-1">
              Supports PDF, PNG, JPG files up to 10MB each.
            </p>
          </div>

          {/* Select Category */}
          <div className="flex justify-center items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-gray-700">Document Type:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#12372A]"
            >
              <option value="Identity Proof">Identity Proof (Aadhaar/PAN/Passport)</option>
              <option value="EC Certificate">EC Certificate</option>
              <option value="Property Deed">Property Sale Deed</option>
              <option value="Revenue Extract">Revenue Extract / Patta</option>
            </select>
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
          <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Uploaded files cannot be deleted
          </span>
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
                <button
                  className="p-2 text-gray-600 hover:text-[#12372A] hover:bg-gray-100 rounded-lg transition-colors"
                  title="Preview Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-600 hover:text-[#12372A] hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
                <span
                  className="px-2.5 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg flex items-center gap-1 cursor-not-allowed"
                  title="Uploaded documents cannot be deleted"
                >
                  <Lock className="w-3.5 h-3.5 text-gray-400" /> Locked
                </span>
              </div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}