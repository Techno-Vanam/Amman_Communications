'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Customers', href: '/admin/customers' },
  { name: 'Appointments', href: '/admin/appointments' },
  { name: 'Applications', href: '/admin/applications' },
  { name: 'Verification', href: '/admin/verification' },
  { name: 'Property', href: '/admin/property' },
  { name: 'Finance', href: '/admin/finance' },
  { name: 'Expenses', href: '/admin/expenses' },
  { name: 'Reports', href: '/admin/reports' },
  { name: 'Settings', href: '/admin/settings' },
  { name: 'Activity Log', href: '/admin/activity-log' },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="grid gap-1">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? 'bg-brand-900 text-white font-medium'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
