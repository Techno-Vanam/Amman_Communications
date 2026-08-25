import Link from 'next/link';

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col">
      {/* Slim Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-card">
        <Link href="/portal/appointments" className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <span className="font-serif text-lg">Amman Communications</span>
          <span className="text-xs font-semibold text-slate-500">Portal Documents</span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <Link href="/portal/appointments" className="hover:text-blue-600 transition-colors">
            My Appointments
          </Link>
          <Link href="/portal/appointments/book" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            + Book Appointment
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  );
}