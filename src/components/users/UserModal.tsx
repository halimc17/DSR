'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { createUser, updateUser, UserFormData } from '@/app/actions/user';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    nama: string;
    email: string;
    role: string;
    telepon?: string | null;
    isActive: boolean;
  } | null;
}

export function UserModal({ isOpen, onClose, onSuccess, initialData }: UserModalProps) {
  const isEdit = Boolean(initialData);

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'PM' | 'FIELD'>('FIELD');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama);
      setEmail(initialData.email);
      setTelepon(initialData.telepon || '');
      setRole(initialData.role as any);
      setIsActive(initialData.isActive);
      setPassword('');
    } else {
      setNama('');
      setEmail('');
      setTelepon('');
      setRole('FIELD');
      setPassword('');
      setIsActive(true);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) {
      setError('Nama dan email wajib diisi.');
      return;
    }

    if (!isEdit && (!password || password.length < 6)) {
      setError('Kata sandi awal minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    setError(null);

    let res;
    if (isEdit && initialData) {
      res = await updateUser(initialData.id, {
        nama,
        email,
        role,
        telepon: telepon || undefined,
        isActive,
      });
    } else {
      res = await createUser({
        nama,
        email,
        role,
        password,
        telepon: telepon || undefined,
        isActive,
      });
    }

    setIsLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Terjadi kesalahan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isEdit ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEdit ? `ID: ${initialData?.id}` : 'Daftarkan personil proyek ke sistem DSR'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center space-x-2">
              <span className="font-bold">&bull;</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap & Tituler</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Kingking Firdaus ST"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@mbm.co.id"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="08123456789"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Peran dalam Proyek (Role)</label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex flex-col p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  role === 'ADMIN'
                    ? 'border-purple-500 bg-purple-50/70 text-purple-900 ring-2 ring-purple-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  className="sr-only"
                />
                <span className="text-xs font-extrabold uppercase">ADMIN</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Kontrol Penuh</span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  role === 'PM'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="PM"
                  checked={role === 'PM'}
                  onChange={() => setRole('PM')}
                  className="sr-only"
                />
                <span className="text-xs font-extrabold uppercase">PM</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Project Manager</span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  role === 'FIELD'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="FIELD"
                  checked={role === 'FIELD'}
                  onChange={() => setRole('FIELD')}
                  className="sr-only"
                />
                <span className="text-xs font-extrabold uppercase">FIELD</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Pengawas Lap.</span>
              </label>
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Awal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required={!isEdit}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Akun Aktif (Dapat Login & Melakukan Tindakan)</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Pengguna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
