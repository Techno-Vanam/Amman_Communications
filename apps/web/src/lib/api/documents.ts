export type DocumentVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface DocumentItem {
  id: string;
  customerId: string;
  applicationId: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  verificationStatus: DocumentVerificationStatus;
  verificationRemarks?: string | null;
  uploadedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  application?: {
    id: string;
    service?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface DocumentStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export interface PaginatedDocuments {
  items: DocumentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadDocumentInput {
  documentType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath?: string;
  applicationId?: string;
}

export interface VerifyDocumentInput {
  status: DocumentVerificationStatus;
  remarks?: string;
}
