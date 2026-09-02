import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { redirect } from 'next/navigation';
import { getAuthenticatedRole } from '@/lib/server-auth';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const role = await getAuthenticatedRole();
  if (!role) redirect('/login');
  if (role !== 'ADMIN') redirect('/forbidden?area=admin');

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
