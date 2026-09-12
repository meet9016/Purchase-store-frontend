import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { ReduxProvider } from '@/redux/ReduxProvider';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Purchase Store | Enterprise Store & Payment Management',
  description: 'Purchase, Store & Vendor Payment Management System',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${jakarta.className} antialiased text-[#0F172C] bg-[#F8FAFC] tracking-normal`} suppressHydrationWarning>
        <ReduxProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}
