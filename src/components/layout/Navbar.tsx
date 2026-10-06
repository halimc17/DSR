'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  Layers, 
  Receipt, 
  PlusCircle, 
  Building2, 
  Home,
  User,
  Users,
  LogOut,
  LogIn,
  ChevronDown,
  Shield,
  Briefcase,
  HardHat,
  Crown,
  BarChart3,
} from 'lucide-react';
import { getCurrentUser, logoutUser } from '@/app/actions/auth';
import type { SessionUser } from '@/types/auth';

interface NavbarProps {
  initialUser?: SessionUser | null;
}

export function Navbar({ initialUser = null }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Laporan DSR', href: '/dsr', icon: ClipboardList },
    { label: 'Progres RAB', href: '/progress', icon: BarChart3 },
    { label: 'Rekonsiliasi', href: '/rab', icon: Layers },
    { label: 'Klaim Termin', href: '/termin', icon: Receipt },
  ];

  // If user is Admin or PM, also show Users in nav
  const isManagement = user && (user.role === 'ADMIN' || user.role === 'PM');

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800">
            <Crown className="w-2.5 h-2.5 mr-0.5" /> ADMIN
          </span>
        );
      case 'PM':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">
            <Briefcase className="w-2.5 h-2.5 mr-0.5" /> PM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
            <HardHat className="w-2.5 h-2.5 mr-0.5" /> FIELD
          </span>
        );
    }
  };

  return (
    <>
      {/* Top Header */}
      <header ref={navRef} className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs no-print">
        <div className="max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 xl:gap-6">
            {/* Brand Logo & Project Title */}
            <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0 group">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-amber-400 font-bold shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight whitespace-nowrap">
                    PT MITRA BANGUN MAHAKARYA
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 flex-shrink-0 whitespace-nowrap">
                    RS Pertamina
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium whitespace-nowrap hidden xs:block sm:block">
                  Daily Site Report &bull; Hemodialisa Prabumulih
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 flex-shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1.5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {isManagement && (
                <Link
                  href="/users"
                  className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap ${
                    pathname === '/users'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className={`w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1.5 flex-shrink-0 ${pathname === '/users' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Pengguna</span>
                </Link>
              )}
            </nav>

            {/* Desktop Action & User Profile */}
            <div className="hidden lg:flex items-center space-x-2.5 xl:space-x-3 flex-shrink-0">
              <Link
                href="/dsr/new"
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <PlusCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>Input DSR</span>
              </Link>

              <div className="h-5 w-px bg-slate-200 flex-shrink-0" />

              {/* User Session Dropdown */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 pl-2 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex-shrink-0"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {user.nama.charAt(0)}
                    </div>
                    <div className="text-left leading-tight hidden xl:block">
                      <div className="text-xs font-semibold text-slate-900 max-w-[120px] truncate">{user.nama}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{user.role}</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span>Masuk</span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {isMenuOpen && user && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.nama}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                    </div>

                    {isManagement && (
                      <Link
                        href="/users"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Users className="w-4 h-4 mr-2.5 text-slate-400" />
                        Manajemen Pengguna
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
                      Keluar (Logout)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile & Tablet Action Buttons */}
            <div className="lg:hidden flex items-center space-x-1.5 flex-shrink-0">
              <Link
                href="/dsr/new"
                className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <span>Input DSR</span>
              </Link>

              {user ? (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0"
                  title={user.nama}
                >
                  {user.nama.charAt(0)}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="p-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 flex-shrink-0"
                  title="Masuk ke Sistem"
                >
                  <LogIn className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile & Tablet User Dropdown Sheet */}
        {isMenuOpen && user && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">{user.nama}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div>{getRoleBadge(user.role)}</div>
            </div>

            {isManagement && (
              <Link
                href="/users"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-xl bg-slate-50 text-xs font-semibold text-slate-800"
              >
                <Users className="w-4 h-4 mr-2 text-slate-600" />
                Kelola Pengguna (RBAC)
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 rounded-xl bg-rose-50 text-xs font-semibold text-rose-700"
            >
              <LogOut className="w-4 h-4 mr-2 text-rose-500" />
              Keluar (Logout)
            </button>
          </div>
        )}
      </header>

      {/* Mobile & Tablet Fixed Bottom Navigation Bar (App-like Feel) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl py-1 px-2 no-print safe-area-bottom">
        <div className={`grid ${isManagement ? 'grid-cols-6' : 'grid-cols-5'} items-center`}>
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
                <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}

          {isManagement && (
            <Link
              href="/users"
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                pathname === '/users'
                  ? 'text-purple-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${pathname === '/users' ? 'bg-purple-50' : ''}`}>
                <Users className={`w-5 h-5 ${pathname === '/users' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">Pengguna</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
