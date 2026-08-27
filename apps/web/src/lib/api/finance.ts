export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'UPI'
  | 'CHEQUE'
  | 'OTHER';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface CustomerMini {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status?: string;
}

export interface ServiceMini {
  id: string;
  name: string;
  description?: string | null;
}

export interface PaymentItem {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber?: string;
  invoiceTotal?: number;
  invoiceStatus?: InvoiceStatus;
  customerId: string;
  customer?: CustomerMini;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  reference?: string | null;
  notes?: string | null;
  paidAt: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: CustomerMini;
  serviceId?: string | null;
  service?: ServiceMini | null;
  applicationId?: string | null;
  governmentFee: number;
  serviceFee: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  dueDate?: string | null;
  notes?: string | null;
  paymentsCount?: number;
  payments?: PaymentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSummary {
  period: {
    from: string | null;
    to: string | null;
  };
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  governmentFeesTotal: number;
  serviceFeesTotal: number;
  invoiceCount: number;
  paymentCount: number;
}

export interface CreateInvoiceInput {
  customerId: string;
  serviceId?: string;
  applicationId?: string;
  governmentFee: number;
  serviceFee: number;
  dueDate?: string;
  notes?: string;
}

export interface UpdateInvoiceInput {
  governmentFee?: number;
  serviceFee?: number;
  dueDate?: string;
  notes?: string;
  status?: InvoiceStatus;
}

export interface RecordPaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  status?: PaymentStatus;
  reference?: string;
  notes?: string;
  paidAt?: string;
}

export interface InvoiceQueryResult {
  items: InvoiceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentQueryResult {
  items: PaymentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
