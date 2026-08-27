import { Metadata } from 'next';
import Link from 'next/link';
import { BookAppointmentForm } from '../../../../components/appointments/BookAppointmentForm';
import { ChevronLeft, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book Appointment | Amman Communications',
  description: 'Schedule an office visit or online consultation for document & clearance services.',
};

export default function BookAppointmentPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal/appointments"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Appointments</span>
        </Link>

        <span className="border border-blue-200 text-blue-600 bg-blue-50 text-xs font-semibold px-3 py-1 rounded-full">
          CUSTOMER PORTAL
        </span>
      </div>

      {/* Navy Header Banner */}
      <div className="bg-gradient-to-r from-[#0B1638] to-[#16234F] text-white rounded-2xl p-6 md:p-8 shadow-card relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="bg-white/10 p-3 rounded-xl shrink-0">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl md:text-2xl font-bold">
              Book an Appointment
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Schedule an in-person office visit or a remote consultation with our{' '}
              <span className="underline decoration-blue-300">document clearance specialists</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container Card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6 md:p-8">
        <BookAppointmentForm />
      </div>
    </div>
  );
}
