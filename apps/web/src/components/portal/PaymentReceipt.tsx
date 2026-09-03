import React from 'react';
import { ReceiptData } from '@/types/payment';
import { Landmark, FileText, Phone, Mail, Globe, MapPin } from 'lucide-react';

interface PaymentReceiptProps {
  data: ReceiptData;
  isPdfDownload?: boolean;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ data, isPdfDownload = false }) => {
  if (isPdfDownload) {
    return (
      <div className="printable-receipt-card w-[794px] min-h-[1050px] bg-white p-10 font-sans space-y-7 border-none shadow-none text-gray-900 leading-normal box-border flex flex-col justify-between">
        {/* Top Content Group */}
        <div className="space-y-6 flex-1">
          {/* Top Brand Banner */}
          <div>
            <div className="flex flex-row justify-between items-center gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <svg className="w-14 h-14 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="48" rx="14" fill="#12372A"/>
                    <path d="M24 11L14.5 35H19.8L21.8 29.5H26.2L28.2 35H33.5L24 11ZM23 25L24 20.8L25 25H23Z" fill="white"/>
                  </svg>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[#12372A] leading-tight">
                      Amman Communications
                    </h1>
                    <p className="text-xs text-gray-600 font-bold mt-1">
                      Customer Support: support@ammancomm.com | +91 98765 43210
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <h2 className="text-2xl font-extrabold text-[#12372A] uppercase tracking-wider leading-none">
                  PAYMENT RECEIPT
                </h2>
              </div>
            </div>

            {/* Explicit Separator Line */}
            <div className="w-full h-[2px] bg-gray-300 mt-5" />
          </div>

          {/* Details Grid: Receipt Details (LEFT) & Bill To (RIGHT) */}
          <div className="grid grid-cols-2 gap-8 py-4 border-b-2 border-gray-300 text-sm">
            {/* Left Column: Receipt Details */}
            <div className="pr-6 border-r-2 border-gray-200 space-y-3">
              <h3 className="text-xs font-extrabold text-[#12372A] uppercase tracking-wider border-b-2 border-gray-200 pb-2">
                RECEIPT DETAILS
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="w-[130px] shrink-0 text-gray-600 font-bold">Receipt No:</span>
                  <span className="font-extrabold text-gray-900 font-mono text-sm">{data.receiptNumber}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-[130px] shrink-0 text-gray-600 font-bold">Payment Date:</span>
                  <span className="font-bold text-gray-900 text-sm">{data.paymentDate}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-[130px] shrink-0 text-gray-600 font-bold">Application No:</span>
                  <span className="font-extrabold text-gray-900 font-mono text-sm">{data.applicationNumber}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-[130px] shrink-0 text-gray-600 font-bold">Transaction ID:</span>
                  <span className="font-extrabold text-gray-900 font-mono text-sm break-all">{data.transactionId}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-[130px] shrink-0 text-gray-600 font-bold">Payment Method:</span>
                  <span className="font-bold text-gray-900 text-sm">{data.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Bill To */}
            <div className="pl-6 space-y-3">
              <h3 className="text-xs font-extrabold text-[#12372A] uppercase tracking-wider border-b-2 border-gray-200 pb-2">
                BILL TO
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="w-[80px] shrink-0 text-gray-600 font-bold">Name:</span>
                  <span className="font-extrabold text-gray-900 text-sm">{data.customerName}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-[80px] shrink-0 text-gray-600 font-bold">Email:</span>
                  <span className="font-bold text-gray-900 text-sm break-all">{data.customerEmail}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-[80px] shrink-0 text-gray-600 font-bold">Phone:</span>
                  <span className="font-bold text-gray-900 text-sm">{data.customerPhone || 'N/A'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-[80px] shrink-0 text-gray-600 font-bold">Address:</span>
                  <span className="font-semibold text-gray-900 text-sm leading-relaxed">{data.customerAddress || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item Table section */}
          <div className="py-3">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 text-[#12372A] uppercase tracking-wider text-xs font-extrabold bg-gray-100/90">
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-4 text-right w-16">QTY</th>
                  <th className="py-3 px-4 text-right w-36">UNIT PRICE</th>
                  <th className="py-3 px-4 text-right w-36">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                <tr className="align-top">
                  <td className="py-4 px-4 font-extrabold text-gray-900 text-base">{data.description}</td>
                  <td className="py-4 px-4 text-right font-bold text-base">{data.quantity}</td>
                  <td className="py-4 px-4 text-right font-bold text-base">₹{data.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4 text-right font-extrabold text-gray-900 text-lg">₹{data.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            {/* Summary calculations area */}
            <div className="flex justify-end pt-4 border-t-2 border-gray-200 text-sm mt-4">
              <div className="w-96 space-y-2">
                <div className="flex justify-between text-gray-700 font-bold text-base">
                  <span>Invoice Subtotal:</span>
                  <span>₹{data.subtotal.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between text-gray-700 font-bold text-base border-b-2 border-gray-200 pb-2">
                  <span>Tax (0%):</span>
                  <span>₹{data.tax.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-extrabold text-gray-900">
                  <span>Invoice Total Paid:</span>
                  <span className="text-[#12372A] text-2xl font-extrabold">₹{data.totalAmount.toLocaleString('en-IN')}.00</span>
                </div>

                {data.pendingBalance !== undefined && data.pendingBalance > 0 && (
                  <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-xl space-y-1.5 mt-3 text-xs">
                    <div className="flex justify-between text-gray-900 font-extrabold text-sm">
                      <span>Remaining Balance Due Later:</span>
                      <span className="text-gray-900 font-mono font-extrabold text-base">₹{data.pendingBalance.toLocaleString('en-IN')}.00</span>
                    </div>
                    <p className="text-xs text-gray-700 font-bold leading-relaxed">
                      (50% Initial Partition Payment Billed &amp; Received. Balance due before receiving final information.)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details & Terms Cards */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-gray-300 text-xs">
            {/* Left: Pay By Bank Transfer */}
            <div className="p-4 border-2 border-gray-300 rounded-2xl bg-gray-50 space-y-2.5">
              <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
                <div className="p-1 bg-gray-200 rounded-md text-[#12372A]">
                  <Landmark className="h-4 w-4" />
                </div>
                <h4 className="font-extrabold text-[#12372A] uppercase tracking-wider text-xs">
                  PAY BY BANK TRANSFER
                </h4>
              </div>
              <div className="space-y-1.5 text-xs text-gray-800">
                <div className="flex items-center gap-2">
                  <span className="w-[120px] shrink-0 text-gray-600 font-bold">Bank Name:</span>
                  <span className="font-extrabold text-gray-900">HDFC Bank</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[120px] shrink-0 text-gray-600 font-bold">Branch:</span>
                  <span className="font-bold text-gray-900">T. Nagar, Chennai</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[120px] shrink-0 text-gray-600 font-bold">IFSC Code:</span>
                  <span className="font-extrabold text-gray-900 font-mono">HDFC0001234</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[120px] shrink-0 text-gray-600 font-bold">Account Number:</span>
                  <span className="font-extrabold text-gray-900 font-mono">1234567890123</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[120px] shrink-0 text-gray-600 font-bold">Account Name:</span>
                  <span className="font-bold text-gray-900">Amman Communications</span>
                </div>
              </div>
            </div>

            {/* Right: Terms and conditions */}
            <div className="p-4 border-2 border-gray-200 rounded-2xl bg-gray-50/80 space-y-2.5">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <div className="p-1 bg-emerald-100 rounded-md text-[#12372A]">
                  <FileText className="h-4 w-4" />
                </div>
                <h4 className="font-extrabold text-[#12372A] uppercase tracking-wider text-xs">
                  TERMS &amp; CONDITIONS
                </h4>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-gray-700 font-bold text-xs leading-relaxed">
                <li>This is an official system generated tax invoice and payment receipt.</li>
                <li>This document does not require a physical signature.</li>
                <li>For support or verification, email support@ammancomm.com.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer Signature & Metadata */}
        <div className="pt-4 mt-auto space-y-4">
          <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300">
            <div>
              <p className="text-lg font-extrabold text-[#12372A]">Thank you for your business!</p>
              <p className="text-xs text-gray-600 font-bold mt-0.5">Amman Communications Financial Services Division, Tamil Nadu, India.</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">SECURITY REF: SHA256-RECEIPT-{data.receiptNumber}</p>
            </div>

            <div className="border-2 border-dashed border-[#12372A] rounded-xl px-4 py-2 bg-emerald-50/80 text-center">
              <p className="text-xs font-black text-[#12372A] uppercase tracking-wider">AMMAN COMMUNICATIONS</p>
              <p className="text-[11px] font-extrabold text-emerald-700 my-0.5">✓ SYSTEM VERIFIED RECEIPT</p>
              <p className="text-[9px] font-semibold text-gray-500">Valid Without Signature</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-700">
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-[#12372A]" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-[#12372A]" />
              <span>support@ammancomm.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-[#12372A]" />
              <span>www.ammancommunications.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#12372A]" />
              <span>Tamil Nadu, India</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="printable-receipt-card w-full bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden p-6 md:p-10 font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:w-full min-h-0 flex flex-col justify-between">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 8mm 8mm;
          }
          html, body {
            height: 100% !important;
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
            min-height: 270mm !important;
            height: 270mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            border: none !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
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

      {/* Main Top & Content Section */}
      <div className="space-y-5 print:space-y-6 flex-1">
        {/* Top Brand Banner */}
        <div>
          <div className="flex flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <svg className="w-12 h-12 print:w-14 print:h-14 shrink-0 print:bg-transparent" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="14" fill="#12372A"/>
                  <path d="M24 11L14.5 35H19.8L21.8 29.5H26.2L28.2 35H33.5L24 11ZM23 25L24 20.8L25 25H23Z" fill="white"/>
                </svg>
                <div>
                  <h1 className="text-xl md:text-2xl print:text-2xl font-extrabold tracking-tight text-[#12372A] leading-tight">
                    Amman Communications
                  </h1>
                  <p className="text-xs print:text-sm text-gray-600 font-semibold mt-0.5">
                    Customer Support: support@ammancomm.com | +91 98765 43210
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end shrink-0">
              <h2 className="text-xl md:text-2xl print:text-2xl font-extrabold text-[#12372A] uppercase tracking-wide leading-none">
                PAYMENT RECEIPT
              </h2>
            </div>
          </div>

          {/* Explicit Separator Line */}
          <div className="w-full h-[1px] print:h-[2px] bg-gray-200 print:bg-gray-300 mt-4 print:mt-5" />
        </div>

        {/* Side-by-Side Grid details: Receipt Details (LEFT) & Bill To (RIGHT) */}
        <div className="grid grid-cols-2 print:grid-cols-2 gap-6 py-4 print:py-6 border-b border-gray-200 print:border-b-2 print:border-gray-300 text-xs md:text-sm print:text-sm">
          {/* Left Column: Receipt Details */}
          <div className="pr-4 md:pr-6 print:pr-8 border-r border-gray-200 print:border-r-2 space-y-2.5 print:space-y-3">
            <h3 className="text-xs md:text-sm font-extrabold text-[#12372A] uppercase tracking-wider border-b border-gray-200 print:border-b-2 pb-1.5 print:pb-2">
              RECEIPT DETAILS
            </h3>
            <div className="grid grid-cols-3 gap-y-2 print:gap-y-3 gap-x-2 text-gray-800">
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
          <div className="pl-4 md:pl-6 print:pl-8 space-y-2.5 print:space-y-3">
            <h3 className="text-xs md:text-sm font-extrabold text-[#12372A] uppercase tracking-wider border-b border-gray-200 print:border-b-2 pb-1.5 print:pb-2">
              BILL TO
            </h3>
            <div className="grid grid-cols-3 gap-y-2 print:gap-y-3 gap-x-2 text-gray-800">
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
        <div className="py-3 print:py-5">
          <table className="w-full text-left text-xs md:text-sm print:text-base">
            <thead>
              <tr className="border-b-2 border-gray-200 print:border-b-2 print:border-gray-300 text-[#12372A] uppercase tracking-wider text-xs font-extrabold bg-gray-50/80 print:bg-gray-100">
                <th className="py-3 px-3 print:py-4 print:px-4">DESCRIPTION</th>
                <th className="py-3 px-3 print:py-4 print:px-4 text-right w-16">QTY</th>
                <th className="py-3 px-3 print:py-4 print:px-4 text-right w-32 print:w-40">UNIT PRICE</th>
                <th className="py-3 px-3 print:py-4 print:px-4 text-right w-32 print:w-40">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 print:divide-y-2 print:divide-gray-200 text-gray-800">
              <tr className="align-top">
                <td className="py-4 px-3 print:py-5 print:px-4 font-extrabold text-gray-900 print:text-lg">{data.description}</td>
                <td className="py-4 px-3 print:py-5 print:px-4 text-right font-bold print:text-lg">{data.quantity}</td>
                <td className="py-4 px-3 print:py-5 print:px-4 text-right font-bold print:text-lg">₹{data.unitPrice.toLocaleString('en-IN')}</td>
                <td className="py-4 px-3 print:py-5 print:px-4 text-right font-extrabold text-gray-900 text-sm md:text-base print:text-xl">₹{data.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary calculations area */}
        <div className="flex justify-end pt-3 print:pt-5 border-t border-gray-200 print:border-t-2 print:border-gray-300 text-xs md:text-sm print:text-base">
          <div className="w-full sm:w-80 print:w-96 space-y-2 print:space-y-2.5">
            <div className="flex justify-between text-gray-700 font-semibold print:text-base">
              <span>Invoice Subtotal:</span>
              <span>₹{data.subtotal.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="flex justify-between text-gray-700 font-semibold border-b border-gray-200 print:border-b-2 print:border-gray-300 pb-1.5 print:pb-2">
              <span>Tax (0%):</span>
              <span>₹{data.tax.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="flex justify-between py-1.5 print:py-2 text-sm md:text-base print:text-xl font-extrabold text-gray-900">
              <span>Invoice Total Paid:</span>
              <span className="text-[#12372A] text-lg md:text-xl print:text-2xl font-extrabold">₹{data.totalAmount.toLocaleString('en-IN')}.00</span>
            </div>

            {data.pendingBalance !== undefined && data.pendingBalance > 0 && (
              <div className="p-3 print:p-4 bg-amber-50 border border-amber-200 print:border-2 print:border-amber-300 rounded-xl space-y-1 mt-2 text-xs">
                <div className="flex justify-between text-amber-950 font-bold print:text-sm">
                  <span>Remaining Balance Due Later:</span>
                  <span className="text-rose-700 font-mono font-extrabold print:text-base">₹{data.pendingBalance.toLocaleString('en-IN')}.00</span>
                </div>
                <p className="text-[10px] print:text-xs text-amber-800 font-semibold leading-tight">
                  (50% Initial Partition Payment Billed &amp; Received. Balance due before receiving final information.)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side-by-Side Bank Transfer Details & Terms Info Panels */}
        <div className="grid grid-cols-2 print:grid-cols-2 gap-4 print:gap-6 pt-4 print:pt-6 border-t border-gray-200 print:border-t-2 print:border-gray-300 text-xs print:text-sm">
          {/* Left: Pay By Bank Transfer Card */}
          <div className="p-3.5 print:p-5 border border-gray-200 print:border-2 print:border-gray-300 rounded-xl print:rounded-2xl bg-gray-50/60 print:bg-gray-50 space-y-2 print:space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 print:border-b-2 pb-1.5 print:pb-2">
              <div className="p-1 bg-emerald-100 rounded-md text-[#12372A]">
                <Landmark className="h-3.5 w-3.5 print:h-4 print:w-4" />
              </div>
              <h4 className="font-extrabold text-[#12372A] uppercase tracking-wider text-xs print:text-sm">
                PAY BY BANK TRANSFER
              </h4>
            </div>
            <div className="grid grid-cols-5 gap-y-1 print:gap-y-2 text-gray-800 text-xs print:text-sm">
              <span className="text-gray-600 font-semibold col-span-2">Bank Name:</span>
              <span className="font-extrabold text-gray-900 col-span-3">HDFC Bank</span>

              <span className="text-gray-600 font-semibold col-span-2">Branch:</span>
              <span className="font-bold text-gray-900 col-span-3">T. Nagar, Chennai</span>

              <span className="text-gray-600 font-semibold col-span-2">IFSC Code:</span>
              <span className="font-extrabold text-gray-900 font-mono">HDFC0001234</span>

              <span className="text-gray-600 font-semibold col-span-2">Account Number:</span>
              <span className="font-extrabold text-gray-900 font-mono">1234567890123</span>

              <span className="text-gray-600 font-semibold col-span-2">Account Name:</span>
              <span className="font-bold text-gray-900 col-span-3">Amman Communications</span>
            </div>
          </div>

          {/* Right: Terms and conditions */}
          <div className="p-3.5 print:p-5 border border-gray-200 print:border-2 print:border-gray-300 rounded-xl print:rounded-2xl bg-gray-50/60 print:bg-gray-50 space-y-2 print:space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 print:border-b-2 pb-1.5 print:pb-2">
              <div className="p-1 bg-emerald-100 rounded-md text-[#12372A]">
                <FileText className="h-3.5 w-3.5 print:h-4 print:w-4" />
              </div>
              <h4 className="font-extrabold text-[#12372A] uppercase tracking-wider text-xs print:text-sm">
                TERMS &amp; CONDITIONS
              </h4>
            </div>
            <ul className="list-disc pl-3.5 print:pl-4 space-y-1 print:space-y-2 text-gray-700 font-semibold text-xs print:text-sm leading-relaxed">
              <li>This is an official system generated tax invoice and payment receipt.</li>
              <li>This document does not require a physical signature.</li>
              <li>For support or verification, email support@ammancomm.com.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section (Pinned to bottom of printed page) */}
      <div className="pt-4 print:pt-6 mt-auto">
        <div className="pt-3 print:pt-4 border-t border-gray-200 print:border-t-2 print:border-gray-300 text-center">
          <p className="text-base md:text-lg print:text-xl font-extrabold text-[#12372A]">Thank you for your business!</p>
          <p className="text-xs print:text-sm text-gray-600 font-semibold mt-0.5">Amman Communications, Tamil Nadu, India.</p>
        </div>

        <div className="mt-3 print:mt-4 pt-3 print:pt-4 border-t border-gray-200 print:border-t-2 flex flex-wrap items-center justify-between gap-2 text-xs print:text-sm font-semibold text-gray-700">
          <div className="flex items-center gap-1.5 shrink-0">
            <Phone className="h-3.5 w-3.5 print:h-4 print:w-4 text-[#12372A] shrink-0" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Mail className="h-3.5 w-3.5 print:h-4 print:w-4 text-[#12372A] shrink-0" />
            <span>support@ammancomm.com</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Globe className="h-3.5 w-3.5 print:h-4 print:w-4 text-[#12372A]" />
            <span>www.ammancommunications.com</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <MapPin className="h-3.5 w-3.5 print:h-4 print:w-4 text-[#12372A]" />
            <span>Tamil Nadu, India</span>
          </div>
        </div>
      </div>
    </div>
  );
};
