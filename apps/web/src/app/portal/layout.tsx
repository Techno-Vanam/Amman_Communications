export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <section><nav><strong>Amman Communications</strong> <a href="/portal/dashboard">Portal</a> <a href="/portal/documents">Documents</a></nav>{children}</section>;
}