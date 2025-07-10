import type { Metadata } from 'next';
import { Providers } from './providers'; // استيراد الـ Providers
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/shared/components/Sidebar'; // استيراد الشريط الجانبي

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Internal Linking Analyzer Pro',
  description: 'Enterprise-grade SEO analysis tools.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <Providers> {/* <-- بداية التغليف */}
          <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex-1">{children}</div>
          </div>
        </Providers> {/* <-- نهاية التغليف */}
      </body>
    </html>
  );
}