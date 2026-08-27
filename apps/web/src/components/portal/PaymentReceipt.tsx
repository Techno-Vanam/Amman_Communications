import React from 'react';
import { ReceiptData } from '@/types/payment';
import { Landmark, FileText, Phone, Mail, Globe, MapPin } from 'lucide-react';

interface PaymentReceiptProps {
  data: ReceiptData;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ data }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-8 md:p-12 font-poppins print:shadow-none print:border-none print:p-0">
      
      {/* Top Brand Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-100 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-brand-700 flex items-center justify-center text-white font-bold text-3xl">
              A
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-brand-900 leading-none">Amman Communications</h1>
              <p className="text-xs text-gray-500 mt-2">
                Customer Support: support@ammancomm.com | +91 98765 43210
              </p>
            </div>
          </div>
        </div>
        <div className="md:text-right flex flex-col items-start md:items-end">
          <h2 className="text-3xl font-extrabold text-brand-700 uppercase tracking-wide">PAYMENT RECEIPT</h2>
          <span className="inline-flex items-center mt-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800">
            {data.paymentStatus}
          </span>
        </div>
      </div>

      {/* Grid details: Receipt Details & Bill To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-gray-100 text-sm">
        
        {/* Left: Receipt Details */}
        <div className="pr-0 md:pr-8 md:border-r border-gray-100">
          <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-4">RECEIPT DETAILS</h3>
          <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-gray-700">
            <span className="text-gray-500 font-medium col-span-1">Receipt No:</span>
            <span className="font-bold text-gray-900 col-span-2">{data.receiptNumber}</span>
            
            <span className="text-gray-500 font-medium col-span-1">Payment Date:</span>
            <span className="font-bold text-gray-900 col-span-2">{data.paymentDate}</span>
            
            <span className="text-gray-500 font-medium col-span-1">Application No:</span>
            <span className="font-bold text-gray-900 col-span-2 font-mono">{data.applicationNumber}</span>
            
            <span className="text-gray-500 font-medium col-span-1">Transaction ID:</span>
            <span className="font-bold text-gray-900 col-span-2 font-mono break-all">{data.transactionId}</span>
            
            <span className="text-gray-500 font-medium col-span-1">Payment Method:</span>
            <span className="font-bold text-gray-900 col-span-2">{data.paymentMethod}</span>
          </div>
        </div>

        {/* Right: Bill To */}
        <div className="pl-0 md:pl-8">
          <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-4">BILL TO</h3>
          <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-gray-700">
            <span className="text-gray-500 font-medium col-span-1">Name:</span>
            <span className="font-bold text-gray-900 col-span-2">{data.customerName}</span>
            
            <span className="text-gray-500 font-medium col-span-1">Email:</span>
            <span className="text-gray-900 col-span-2 break-all">{data.customerEmail}</span>
            
            <span className="text-gray-500 font-medium col-span-1">Phone:</span>
            <span className="text-gray-900 col-span-2">{data.customerPhone || 'N/A'}</span>

            <span className="text-gray-500 font-medium col-span-1">Address:</span>
            <span className="text-gray-900 col-span-2 whitespace-pre-line leading-relaxed">
              {data.customerAddress || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Item Table section */}
      <div className="py-8">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-brand-700 uppercase tracking-wider text-xs font-bold">
              <th className="py-3">DESCRIPTION</th>
              <th className="py-3 text-right w-16">QTY</th>
              <th className="py-3 text-right w-32">UNIT PRICE</th>
              <th className="py-3 text-right w-32">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            <tr className="align-top">
              <td className="py-5 font-semibold text-gray-900">{data.description}</td>
              <td className="py-5 text-right font-medium">{data.quantity}</td>
              <td className="py-5 text-right font-medium">₹{data.unitPrice.toLocaleString('en-IN')}</td>
              <td className="py-5 text-right font-bold text-gray-900">₹{data.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary calculations area */}
      <div className="flex justify-end pt-4 border-t border-gray-100 text-sm">
        <div className="w-full md:w-80">
          <div className="flex justify-between py-2 text-gray-600 font-medium">
            <span>Subtotal:</span>
            <span>₹{data.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-2 text-gray-600 font-medium border-b border-gray-100 pb-3">
            <span>Tax (0%):</span>
            <span>₹{data.tax.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-3 text-lg font-bold text-gray-900 mt-2">
            <span>Total Paid:</span>
            <span className="text-brand-700 text-xl font-extrabold">₹{data.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Bank Transfer Details & Terms Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100 text-xs">
        
        {/* Pay By Bank Transfer Card */}
        <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-brand-50 rounded-lg text-brand-700">
              <Landmark className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-brand-700 uppercase tracking-wider">PAY BY BANK TRANSFER</h4>
          </div>
          <div className="grid grid-cols-5 gap-y-2 text-gray-700">
            <span className="text-gray-500 font-medium col-span-2">Bank Name:</span>
            <span className="font-semibold text-gray-900 col-span-3">HDFC Bank</span>
            
            <span className="text-gray-500 font-medium col-span-2">Branch:</span>
            <span className="font-semibold text-gray-900 col-span-3">T. Nagar, Chennai</span>
            
            <span className="text-gray-500 font-medium col-span-2">IFSC Code:</span>
            <span className="font-semibold text-gray-900 col-span-3 font-mono">HDFC0001234</span>
            
            <span className="text-gray-500 font-medium col-span-2">Account Number:</span>
            <span className="font-semibold text-gray-900 col-span-3 font-mono">1234567890123</span>
            
            <span className="text-gray-500 font-medium col-span-2">Account Name:</span>
            <span className="font-semibold text-gray-900 col-span-3">Amman Communications</span>
          </div>
        </div>

        {/* Terms and conditions */}
        <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-brand-50 rounded-lg text-brand-700">
              <FileText className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-brand-700 uppercase tracking-wider">TERMS</h4>
          </div>
          <ul className="list-disc pl-4 space-y-2 text-gray-600 font-medium">
            <li>This is a system generated receipt.</li>
            <li>This receipt does not require a physical signature.</li>
            <li>For any queries, please contact our support team.</li>
          </ul>
        </div>
      </div>

      {/* Centered Thank You Signature */}
      <div className="mt-8 pt-8 border-t border-gray-100 text-center">
        <p className="text-lg font-bold text-brand-700">Thank you for your business!</p>
        <p className="text-xs text-gray-500 mt-1">Amman Communications, Tamil Nadu, India.</p>
      </div>

      {/* Footer metadata details */}
      <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left text-[11px] text-gray-500 font-medium">
        <div className="flex items-center justify-center md:justify-start gap-1.5">
          <Phone className="h-3 w-3 text-brand-600" />
          <span>+91 98765 43210</span>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-1.5">
          <Mail className="h-3 w-3 text-brand-600" />
          <span className="truncate">support@ammancomm.com</span>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-1.5">
          <Globe className="h-3 w-3 text-brand-600" />
          <span>www.ammancommunications.com</span>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-1.5">
          <MapPin className="h-3 w-3 text-brand-600" />
          <span>Tamil Nadu, India</span>
        </div>
      </div>

    </div>
  );
};
