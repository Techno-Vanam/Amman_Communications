import Link from 'next/link';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:flex">
      <aside className="w-full bg-brand-700 p-5 text-white md:min-h-screen md:w-64 md:shrink-0">
        <Link href="/admin/dashboard" className="mb-8 block text-lg font-bold">Amman Comm</Link>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-200">Admin workspace</p>
        <nav aria-label="Admin navigation" className="grid gap-1">
          <Link href="/admin/dashboard" className="rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10">Dashboard</Link>
          <Link href="/admin/services" className="rounded-lg bg-white/15 px-3 py-2 text-sm font-medium">Services</Link>
          <Link href="/admin/documents" className="rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10">Documents</Link>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}