import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedRole } from '@/lib/server-auth';

export default async function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const role = await getAuthenticatedRole();
  if (!role) redirect('/login');
  if (role !== 'CUSTOMER') redirect('/forbidden?area=portal');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:flex">
      <aside className="w-full bg-brand-700 p-5 text-white md:min-h-screen md:w-64 md:shrink-0">
        <Link href="/portal/dashboard" className="mb-8 block text-lg font-bold">Amman Comm</Link>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-200">Customer portal</p>
        <nav aria-label="Customer navigation" className="grid gap-1">
          <Link href="/portal/dashboard" className="rounded-lg bg-white/15 px-3 py-2 text-sm">Dashboard</Link>
          <Link href="/portal/documents" className="rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10">My documents</Link>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}