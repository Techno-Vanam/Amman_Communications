import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-poppins',
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

import Providers from './providers';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className="font-poppins" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
