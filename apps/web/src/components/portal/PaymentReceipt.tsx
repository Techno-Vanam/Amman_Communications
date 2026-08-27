import React from 'react';
import { ReceiptData } from '@/types/payment';
import { Landmark, FileText, Phone, Mail, Globe, MapPin } from 'lucide-react';

interface PaymentReceiptProps {
  data: ReceiptData;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ data }) => {
  return (
    <div className="printable-receipt-card w-full bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden p-6 md:p-10 font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          html, body {
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 14px !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .printable-receipt-card {
            font-size: 14px !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Hide non-printable elements */
          .print\\:hidden, aside, header, nav, footer {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Top Brand Banner */}
      <div className="flex flex-row justify-between items-center pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-2xl bg-[#12372A] flex items-center justify-center text-white font-extrabold text-3xl shrink-0 shadow-sm print:bg-[#12372A] print:text-white">
              A
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#12372A] leading-tight">
                Amman Communications
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-semibold mt-1">
                Customer Support: support@ammancomm.com | +91 98765 43210
              </p>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#12372A] uppercase tracking-wide">
            PAYMENT RECEIPT
          </h2>
          <span className="inline-flex items-center mt-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
            {data.paymentStatus}
          </span>
        </div>
      </div>

      {/* Side-by-Side Grid details: Receipt Details (LEFT) & Bill To (RIGHT) */}
      <div className="grid grid-cols-2 print:grid-cols-2 gap-8 py-7 border-b border-gray-200 text-sm print:text-sm">
        {/* Left Column: Receipt Details */}
        <div className="pr-4 md:pr-8 border-r border-gray-200 space-y-3">
          <h3 className="text-sm md:text-base font-extrabold text-[#12372A] uppercase tracking-wider border-b border-gray-200 pb-2">
            RECEIPT DETAILS
          </h3>
          <div className="grid grid-cols-3 gap-y-2.5 gap-x-2 text-gray-800">
            <span className="text-gray-600 font-semibold col-span-1">Receipt No:</span>
            <span className="font-extrabold text-gray-900 col-span-2 font-mono">{data.receiptNumber}</span>

            <span className="text-gray-600 font-semibold col-span-1">Payment Date:</span>
            <span className="font-bold text-gray-900 col-span-2">{data.paymentDate}</span>

            <span className="text-gray-600 font-semibold col-span-1">Application No:</span>
            <span className="font-extrabold text-gray-900 col-span-2 font-mono">{data.applicationNumber}</span>

            <span className="text-gray-600 font-semibold col-span-1">Transaction ID:</span>
            <span className="font-extrabold text-gray-900 col-span-2 font-mono break-all">{data.transactionId}</span>

            <span className="text-gray-600 font-semibold col-span-1">Payment Method:</span>
            <span className="font-bold text-gray-900 col-span-2">{data.paymentMethod}</span>
          </div>
        </div>

        {/* Right Column: Bill To */}
        <div className="pl-4 md:pl-8 space-y-3">
          <h3 className="text-sm md:text-base font-extrabold text-[#12372A] uppercase tracking-wider border-b border-gray-200 pb-2">
            BILL TO
          </h3>
          <div className="grid grid-cols-3 gap-y-2.5 gap-x-2 text-gray-800">
            <span className="text-gray-600 font-semibold col-span-1">Name:</span>
            <span className="font-extrabold text-gray-900 col-span-2">{data.customerName}</span>

            <span className="text-gray-600 font-semibold col-span-1">Email:</span>
            <span className="font-bold text-gray-900 col-span-2 break-all">{data.customerEmail}</span>

            <span className="text-gray-600 font-semibold col-span-1">Phone:</span>
            <span className="font-bold text-gray-900 col-span-2">{data.customerPhone || 'N/A'}</span>

            <span className="text-gray-600 font-semibold col-span-1">Address:</span>
            <span className="font-semibold text-gray-900 col-span-2 whitespace-pre-line leading-relaxed">
              {data.customerAddress || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Item Table section */}
      <div className="py-6">
        <table className="w-full text-left text-sm print:text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 text-[#12372A] uppercase tracking-wider text-xs md:text-sm font-extrabold bg-gray-50/80">
              <th className="py-3 px-4">DESCRIPTION</th>
              <th className="py-3 px-4 text-right w-20">QTY</th>
              <th className="py-3 px-4 text-right w-36">UNIT PRICE</th>
              <th className="py-3 px-4 text-right w-36">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            <tr className="align-top">
              <td className="py-4 px-4 font-extrabold text-gray-900">{data.description}</td>
              <td className="py-4 px-4 text-right font-bold">{data.quantity}</td>
              <td className="py-4 px-4 text-right font-bold">₹{data.unitPrice.toLocaleString('en-IN')}</td>
              <td className="py-4 px-4 text-right font-extrabold text-gray-900 text-base md:text-lg">₹{data.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary calculations area */}
      <div className="flex justify-end pt-4 border-t border-gray-200 text-sm print:text-sm">
        <div className="w-full md:w-80 space-y-2">
          <div className="flex justify-between text-gray-700 font-semibold">
            <span>Subtotal:</span>
            <span>₹{data.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-gray-700 font-semibold border-b border-gray-200 pb-2">
            <span>Tax (0%):</span>
            <span>₹{data.tax.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-2 text-base md:text-xl font-extrabold text-gray-900">
            <span>Total Paid:</span>
            <span className="text-[#12372A] text-xl md:text-2xl font-extrabold">₹{data.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Bank Transfer Details & Terms Info Panels */}
      <div className="grid grid-cols-2 print:grid-cols-2 gap-6 pt-6 border-t border-gray-200 text-xs md:text-sm print:text-sm">
        {/* Left: Pay By Bank Transfer Card */}
        <div className="p-4 md:p-5 border border-gray-200 rounded-xl bg-gray-50/60 space-y-2.5">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-[#12372A]">
              <Landmark className="h-4 w-4" />
            </div>
            <h4 className="font-extrabold text-[#12372A] uppercase tracking-wider text-xs md:text-sm">
              PAY BY BANK TRANSFER
            </h4>
          </div>
          <div className="grid grid-cols-5 gap-y-1.5 text-gray-800 text-xs md:text-sm">
            <span className="text-gray-600 font-semibold col-span-2">Bank Name:</span>
            <span className="font-extrabold text-gray-900 col-span-3">HDFC Bank</span>

            <span className="text-gray-600 font-semibold col-span-2">Branch:</span>
            <span className="font-bold text-gray-900 col-span-3">T. Nagar, Chennai</span>

            <span className="text-gray-600 font-semibold col-span-2">IFSC Code:</span>
            <span className="font-extrabold text-gray-900 col-span-3 font-mono">HDFC0001234</span>

            <span className="text-gray-600 font-semibold col-span-2">Account Number:</span>
            <span className="font-extrabold text-gray-900 col-span-3 font-mono">1234567890123</span>

            <span className="text-gray-600 font-semibold col-span-2">Account Name:</span>
            <span className="font-bold text-gray-900 col-span-3">Amman Communications</span>
          </div>
        </div>

        {/* Right: Terms and conditions */}
        <div className="p-4 md:p-5 border border-gray-200 rounded-xl bg-gray-50/60 space-y-2.5">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-[#12372A]">
              <FileText className="h-4 w-4" />
            </div>
            <h4 className="font-extrabold text-[#12372A] uppercase tracking-wider text-xs md:text-sm">
              TERMS &amp; CONDITIONS
            </h4>
          </div>
          <ul className="list-disc pl-4 space-y-1.5 text-gray-700 font-semibold text-xs md:text-sm leading-relaxed">
            <li>This is an official system generated tax invoice and payment receipt.</li>
            <li>This document does not require a physical signature.</li>
            <li>For support or verification, email support@ammancomm.com.</li>
          </ul>
        </div>
      </div>

      {/* Centered Thank You Signature */}
      <div className="mt-6 pt-5 border-t border-gray-200 text-center">
        <p className="text-lg md:text-xl font-extrabold text-[#12372A]">Thank you for your business!</p>
        <p className="text-xs md:text-sm text-gray-600 font-semibold mt-0.5">Amman Communications, Tamil Nadu, India.</p>
      </div>

      {/* Footer metadata details */}
      <div className="mt-5 pt-4 border-t border-gray-200 grid grid-cols-4 print:grid-cols-4 gap-3 text-center md:text-left text-xs md:text-sm font-semibold text-gray-700">
        <div className="flex items-center justify-center md:justify-start gap-1.5">
          <Phone className="h-4 w-4 text-[#12372A]" />
          <span>+91 98765 43210</span>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-1.5">
          <Mail className="h-4 w-4 text-[#12372A]" />
          <span className="truncate">support@ammancomm.com</span>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-1.5">
          <Globe className="h-4 w-4 text-[#12372A]" />
          <span>www.ammancommunications.com</span>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-1.5">
          <MapPin className="h-4 w-4 text-[#12372A]" />
          <span>Tamil Nadu, India</span>
        </div>
      </div>
    </div>
  );
};
