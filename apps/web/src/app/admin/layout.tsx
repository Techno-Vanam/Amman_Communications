export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <section><nav><strong>Amman Communications</strong> <a href="/admin/dashboard">Admin</a> <a href="/admin/documents">Documents</a></nav>{children}</section>;
}