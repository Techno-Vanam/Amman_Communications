'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/customers', label: 'Customers' },
    { href: '/admin/documents', label: 'Documents' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:flex">
      <aside className="w-full bg-brand-700 p-5 text-white md:min-h-screen md:w-64 md:shrink-0">
        <Link href="/admin/dashboard" className="mb-8 block text-lg font-bold">Amman Comm</Link>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-200">Admin workspace</p>
        <nav aria-label="Admin navigation" className="grid gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-white/15 font-medium text-white shadow-sm'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}