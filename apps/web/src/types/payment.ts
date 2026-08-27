export interface ReceiptData {
  receiptNumber: string;
  paymentDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  applicationNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  paymentStatus: 'PAID' | 'FAILED' | 'PENDING';
}
