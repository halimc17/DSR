import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { getCurrentUser } from '@/app/actions/auth';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0F172A',
};

export const metadata: Metadata = {
  title: 'Daily Site Report — RS Pertamina Prabumulih',
  description: 'Aplikasi Pelaporan Harian Lapangan & Pembuktian Termin — PT Mitra Bangun Mahakarya',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MBM DSR',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900`}>
        <Navbar initialUser={currentUser} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 hidden lg:block no-print">
          &copy; {new Date().getFullYear()} PT Mitra Bangun Mahakarya &bull; Proyek Renovasi Hemodialisa RS Pertamina Prabumulih
        </footer>
      </body>
    </html>
  );
}
