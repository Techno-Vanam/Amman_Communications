'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logoutAction } from '../login/actions';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/customers', label: 'Customers' },
    { href: '/admin/finance', label: 'Finance' },
    { href: '/admin/documents', label: 'Documents' },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAction();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:flex">
      <aside className="w-full bg-brand-700 p-5 text-white md:w-64 md:shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto flex flex-col justify-between">
        <div>
          <Link href="/admin/dashboard" className="mb-8 block text-lg font-bold">
            Amman Comm
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-200">
            Admin workspace
          </p>
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
        </div>

        {/* Left Bottom Log Out Section */}
        <div className="pt-6 mt-8 border-t border-white/10">
          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-200 hover:bg-rose-500/20 hover:text-rose-100 transition text-left disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            <span>{loggingOut ? 'Logging out...' : 'Log Out'}</span>
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}