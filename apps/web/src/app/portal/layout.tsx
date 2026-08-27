import PortalLayout from '@/components/layout/PortalLayout';

export default function AppPortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}