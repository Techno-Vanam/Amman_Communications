import React, { useRef } from 'react';
import { UploadCloud, File, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface PendingFile {
  id: string;
  file: File;
  documentType: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface DocumentUploaderProps {
  files: PendingFile[];
  onAddFiles: (newFiles: File[]) => void;
  onRemoveFile: (fileId: string) => void;
  maxSizeMB?: number;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  maxSizeMB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || 10),
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      const validFiles: File[] = [];

      for (const file of selected) {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          alert(`File "${file.name}" is not supported. Please upload PDF, JPG, or PNG.`);
          continue;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`File "${file.name}" exceeds the maximum allowed limit of ${maxSizeMB}MB.`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onAddFiles(validFiles);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Supporting Documents (Optional)
        </label>
        <span className="text-xs text-slate-400">
          PDF, JPG, PNG up to {maxSizeMB}MB each
        </span>
      </div>

      {/* Drag & Drop Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl py-10 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="bg-blue-50 text-blue-500 rounded-full p-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-700">Click to upload</span>{' '}
          <span className="text-slate-500">or drag and drop documents</span>
        </p>
        <p className="text-xs text-slate-400">
          Identity documents, lease contracts, commercial registration copies
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2 mt-3">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <File className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.file.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.status === 'uploading' && (
                  <span className="text-xs text-blue-600 font-semibold animate-pulse">
                    Uploading...
                  </span>
                )}
                {item.status === 'completed' && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Attached
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {item.error || 'Failed'}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onRemoveFile(item.id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
