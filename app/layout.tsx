import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const cairo = Cairo({ subsets: ['arabic'] });

export const metadata: Metadata = {
  title: 'منصة تعزيز الوعي المجتمعي',
  description: 'منصة تعزيز الوعي المجتمعي - لوحة التحكم',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cairo.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
