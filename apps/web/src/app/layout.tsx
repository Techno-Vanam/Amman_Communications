import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Amman Communications | Simplify Your Service Applications',
  description:
    'Amman Communications helps you manage service applications, upload documents, and track progress — all from one secure platform.',
  openGraph: {
    title: 'Amman Communications | Simplify Your Service Applications',
    description:
      'Manage your service applications, submit documents, and track progress in one place.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Amman Communications',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans antialiased text-slate-800 bg-[#F4F6FB]" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
