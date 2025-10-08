import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { AntdProvider } from '@/components/providers/AntdProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookingApp - Manage Your Bookings',
  description: 'A premium booking management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <AntdProvider>
            {children}
          </AntdProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
