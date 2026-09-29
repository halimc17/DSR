'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Edit2,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Crown,
  HardHat,
  Briefcase
} from 'lucide-react';
import { UserModal } from './UserModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { toggleUserStatus, deleteUser } from '@/app/actions/user';
import type { SessionUser } from '@/types/auth';

interface UserData {
  id: string;
  nama: string;
  email: string;
  role: string;
  isActive: boolean;
  telepon: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count: {
    laporanDibuat: number;
    laporanDisetujui: number;
  };
}

interface UserManagementClientProps {
  users: UserData[];
  currentUser: SessionUser;
}

export function UserManagementClient({ users: initialUsers, currentUser }: UserManagementClientProps) {
  const router = useRouter();
  const isAdmin = currentUser.role === 'ADMIN';

  const [users, setUsers] = useState<UserData[]>(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'ADMIN' | 'PM' | 'FIELD'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<{ id: string; nama: string; email: string } | null>(null);

  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserData | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.telepon && u.telepon.includes(searchQuery));

    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ACTIVE' && u.isActive) ||
      (selectedStatus === 'INACTIVE' && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Metrics
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const pmCount = users.filter((u) => u.role === 'PM').length;
  const fieldCount = users.filter((u) => u.role === 'FIELD').length;

  const handleToggleStatus = async (user: UserData) => {
    if (!isAdmin) return;
    setIsActionLoading(true);
    setActionError(null);

    const res = await toggleUserStatus(user.id, !user.isActive);
    setIsActionLoading(false);

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
      router.refresh();
    } else {
      setActionError(res.error || 'Gagal mengubah status pengguna.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser || !isAdmin) return;
    setIsActionLoading(true);
    setActionError(null);

    const res = await deleteUser(deleteConfirmUser.id);
    setIsActionLoading(false);

    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmUser.id));
      setDeleteConfirmUser(null);
      router.refresh();
    } else {
      setActionError(res.error || 'Gagal menghapus pengguna.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Crown className="w-3 h-3 mr-1" />
            ADMIN
          </span>
        );
      case 'PM':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Briefcase className="w-3 h-3 mr-1" />
            PM (Kingking)
          </span>
        );
      case 'FIELD':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <HardHat className="w-3 h-3 mr-1" />
            FIELD (Pengawas)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              RBAC Proyek
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola hak akses personil proyek RS Umum Pertamina Prabumulih (PT Mitra Bangun Mahakarya)
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              setEditingUser(null);
              setIsUserModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Pengguna Baru
          </button>
        ) : (
          <div className="text-xs text-slate-500 italic bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            Mode Tinjau (Hanya Administrator yang dapat menambah/mengubah data)
          </div>
        )}
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">Total Pengguna</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-400">Akun</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-purple-700 block uppercase">Administrator</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-purple-900">{adminCount}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">Full</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-700 block uppercase">Project Manager</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-amber-900">{pmCount}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">Approval</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-blue-700 block uppercase">Pengawas Lapangan</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-blue-900">{fieldCount}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">Input DSR</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau no. telepon..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Role:</span>
            {(['ALL', 'ADMIN', 'PM', 'FIELD'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedRole === r
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'Semua' : r}
              </button>
            ))}

            <span className="text-[11px] text-slate-400 font-semibold ml-2 mr-1">Status:</span>
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedStatus === s
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'ALL' ? 'Semua' : s === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Content: Desktop Table & Mobile Cards */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Tidak ada pengguna yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Coba ubah kata kunci pencarian atau bersihkan filter role dan status di atas.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Nama & Kontak</th>
                  <th className="px-5 py-3.5">Peran (Role)</th>
                  <th className="px-5 py-3.5">Aktivitas Laporan DSR</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 text-sm">{user.nama}</div>
                      <div className="flex items-center space-x-3 text-slate-500 mt-0.5">
                        <span className="flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {user.email}
                        </span>
                        {user.telepon && (
                          <span className="flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {user.telepon}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">{getRoleBadge(user.role)}</td>

                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="space-y-0.5">
                        <div>
                          Dibuat:{' '}
                          <span className="font-semibold text-slate-800">
                            {user._count.laporanDibuat} laporan
                          </span>
                        </div>
                        <div>
                          Disetujui:{' '}
                          <span className="font-semibold text-slate-800">
                            {user._count.laporanDisetujui} laporan
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {user.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    {isAdmin && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Edit data pengguna"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setResetTargetUser(user);
                              setIsResetModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Reset kata sandi"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.isActive
                                ? 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={user.isActive ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                          >
                            {user.isActive ? (
                              <XCircle className="w-4 h-4 text-slate-400 hover:text-rose-600" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>

                          <button
                            onClick={() => setDeleteConfirmUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{user.nama}</h3>
                    <p className="text-xs text-slate-500 truncate flex items-center mt-0.5">
                      <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                      {user.email}
                    </p>
                    {user.telepon && (
                      <p className="text-xs text-slate-500 truncate flex items-center mt-0.5">
                        <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                        {user.telepon}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getRoleBadge(user.role)}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg flex items-center justify-between border border-slate-100">
                  <span>
                    Dibuat: <b>{user._count.laporanDibuat}</b> lap.
                  </span>
                  <span>
                    Disetujui: <b>{user._count.laporanDisetujui}</b> lap.
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-end space-x-1 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setIsUserModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setResetTargetUser(user);
                        setIsResetModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold inline-flex items-center"
                    >
                      <KeyRound className="w-3.5 h-3.5 mr-1" /> Reset Sandi
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center ${
                        user.isActive
                          ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmUser(user)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
        initialData={editingUser}
      />

      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
        user={resetTargetUser}
      />

      {/* Delete User Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Hapus Akun Pengguna</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun{' '}
              <strong className="text-slate-900 font-semibold">{deleteConfirmUser.nama}</strong> ({deleteConfirmUser.email})?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isActionLoading ? 'Menghapus...' : 'Ya, Hapus Pengguna'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
