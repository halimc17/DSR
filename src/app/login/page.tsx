'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/app/actions/auth';
import { Building2, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, HardHat, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Silakan masukkan email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await loginUser(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push(redirectUrl);
      router.refresh();
    } else {
      setError(res.error || 'Login gagal.');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    if (demoEmail === 'admin@mbm.co.id') {
      setPassword('K4lil4791355R');
    } else {
      setPassword('password123');
    }
    setError(null);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 shadow-md mb-1">
          <Building2 className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Masuk ke Sistem DSR</h1>
        <p className="text-xs text-slate-500">
          Renovasi Ruang Hemodialisa &bull; RS Umum Pertamina Prabumulih
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start space-x-2">
          <span className="text-rose-600 font-bold">&bull;</span>
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@mbm.co.id"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kata Sandi</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <span>Memverifikasi...</span>
          ) : (
            <>
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Credentials */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
          Akses Cepat Pengujian (Demo):
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@mbm.co.id')}
            className="p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-left transition-colors"
          >
            <span className="block text-[10px] font-extrabold text-purple-800 uppercase">Admin</span>
            <span className="text-[11px] text-purple-950 font-medium truncate block">Full Access</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('pm@mbm.co.id')}
            className="p-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-left transition-colors"
          >
            <span className="block text-[10px] font-extrabold text-amber-800 uppercase">PM</span>
            <span className="text-[11px] text-amber-950 font-medium truncate block">Kingking Firdaus</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('site1@mbm.co.id')}
            className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-left transition-colors"
          >
            <span className="block text-[10px] font-extrabold text-blue-800 uppercase">Field</span>
            <span className="text-[11px] text-blue-950 font-medium truncate block">Pengawas Lap.</span>
          </button>
        </div>
      </div>

      {/* Back to Home as Guest */}
      <div className="text-center pt-1">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          &larr; Kembali ke Dashboard (Mode Tamu)
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="text-sm font-semibold text-slate-500">Memuat halaman login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
