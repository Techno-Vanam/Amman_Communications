export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  email: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
    documents: number;
  };
  applications?: {
    id: string;
    createdAt: string;
    service?: {
      id: string;
      name: string;
    } | null;
  }[];
  documents?: {
    id: string;
    fileName: string;
    documentType: string;
    verificationStatus: string;
    uploadedAt: string;
  }[];
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  withApplications: number;
}

export interface PaginatedCustomers {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  password: string;
  status?: CustomerStatus;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  status?: CustomerStatus;
}
