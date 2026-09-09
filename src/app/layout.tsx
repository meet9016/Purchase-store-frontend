import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ReduxProvider } from '@/redux/ReduxProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Purchase Store | Enterprise Store & Payment Management',
  description: 'Purchase, Store & Vendor Payment Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased text-slate-800 bg-slate-50`} suppressHydrationWarning>
        <ReduxProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}
