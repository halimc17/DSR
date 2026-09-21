'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ClipboardList, 
  BarChart3, 
  Layers, 
  Receipt, 
  PlusCircle, 
  Building2,
  Calendar,
  Home
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Laporan DSR', href: '/dsr', icon: ClipboardList },
    { label: 'Rekonsiliasi', href: '/rab', icon: Layers },
    { label: 'Klaim Termin', href: '/termin', icon: Receipt },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo & Project Title */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0 mr-2 flex-1 sm:flex-initial">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-900 text-amber-400 font-bold shadow-sm flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight truncate">
                    PT MITRA BANGUN MAHAKARYA
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 flex-shrink-0">
                    RS Pertamina
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate hidden xs:block sm:block">
                  Daily Site Report &bull; Hemodialisa Prabumulih
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Quick Action */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/dsr/new"
                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                <span>Input DSR</span>
              </Link>
            </div>

            {/* Mobile Top Action Button */}
            <div className="md:hidden flex items-center flex-shrink-0">
              <Link
                href="/dsr/new"
                className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <span>Input DSR</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (App-like Feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl py-1 px-2 no-print safe-area-bottom">
        <div className="grid grid-cols-4 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
