import PortalLayout from '@/components/layout/PortalLayout';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
