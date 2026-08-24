import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
