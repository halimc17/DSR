'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DeleteDsrButton } from '@/components/dsr/DeleteDsrButton';
import {
  Calendar,
  PlusCircle,
  Search,
  Filter,
  Table as TableIcon,
  LayoutGrid,
  ChevronRight,
  AlertTriangle,
  Users,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  X,
  ExternalLink
} from 'lucide-react';

interface DsrListClientProps {
  dsrList: any[];
  currentUser?: {
    id: string;
    nama: string;
    email: string;
    role: string;
  } | null;
}

export function DsrListClient({ dsrList, currentUser }: DsrListClientProps) {
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'SUBMITTED' | 'REVISI' | 'DRAFT'>('ALL');

  const canManage = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'PM');

  // Filtered DSRs
  const filteredList = useMemo(() => {
    return dsrList.filter((dr) => {
      // Search filter
      const dateObj = new Date(dr.tanggal);
      const dateStr = dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).toLowerCase();

      const searchLower = searchQuery.toLowerCase();
      const matchSearch =
        searchQuery === '' ||
        `hari ke-${dr.hariKerjaKe}`.includes(searchLower) ||
        `hari ${dr.hariKerjaKe}`.includes(searchLower) ||
        `${dr.hariKerjaKe}` === searchLower ||
        dateStr.includes(searchLower) ||
        (dr.catatanUmum && dr.catatanUmum.toLowerCase().includes(searchLower)) ||
        (dr.rencanaBesok && dr.rencanaBesok.toLowerCase().includes(searchLower));

      if (!matchSearch) return false;

      // Status filter
      if (statusFilter !== 'ALL' && dr.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [dsrList, searchQuery, statusFilter]);

  // Counts
  const approvedCount = dsrList.filter((d) => d.status === 'APPROVED').length;
  const submittedCount = dsrList.filter((d) => d.status === 'SUBMITTED').length;
  const revisiCount = dsrList.filter((d) => d.status === 'REVISI').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Daftar Laporan Harian (DSR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Arsip lengkap laporan progres fisik, cuaca, tenaga kerja, dan foto dokumentasi
          </p>
        </div>

        <Link
          href="/dsr/new"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Input DSR Baru / Backdate
        </Link>
      </div>

      {/* Control Bar: Search, Status Filter, View Toggle */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari hari ke-N, tanggal, atau catatan..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex-shrink-0">
            <button
              onClick={() => setViewMode('TABLE')}
              title="Tampilan Tabel (Table View)"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              title="Tampilan Kartu Grid (Card View)"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'GRID'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu Grid</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs by Status */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1" /> Status:
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({dsrList.length})
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Disetujui ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('SUBMITTED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'SUBMITTED'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Menunggu PM ({submittedCount})
          </button>
          {revisiCount > 0 && (
            <button
              onClick={() => setStatusFilter('REVISI')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'REVISI'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Revisi ({revisiCount})
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Tidak ada laporan yang cocok dengan pencarian/filter'
              : 'Belum ada laporan harian tercatat'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Silakan coba ubah kata kunci atau reset filter status.'
              : 'Mulai buat laporan sekarang atau input backdate untuk tanggal sebelumnya.'}
          </p>
          {searchQuery || statusFilter !== 'ALL' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
            >
              Reset Filter
            </button>
          ) : (
            <Link
              href="/dsr/new"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Buat Laporan Pertama
            </Link>
          )}
        </div>
      ) : viewMode === 'TABLE' ? (
        /* ========================================================================= */
        /* TABLE VIEW                                                                */
        /* ========================================================================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-3 w-24 text-center">Hari Ke-</th>
                  <th className="p-3 min-w-[150px]">Tanggal</th>
                  <th className="p-3 w-28 text-center">Status</th>
                  <th className="p-3 w-32">Cuaca</th>
                  <th className="p-3 w-24 text-center">Pekerja</th>
                  <th className="p-3 w-24 text-center">Item RAB</th>
                  <th className="p-3 w-20 text-center">Foto</th>
                  <th className="p-3 min-w-[160px]">Keterangan / Approval</th>
                  <th className="p-3 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.map((dr) => {
                  const dateObj = new Date(dr.tanggal);
                  const dateStr = dateObj.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const totalWorkers = dr.manpowers.reduce((acc: number, m: any) => acc + m.jumlah, 0);

                  return (
                    <tr key={dr.id} className="hover:bg-slate-50 transition-colors">
                      {/* Hari Ke */}
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          Hari {dr.hariKerjaKe}
                        </span>
                        {dr.isBackdated && (
                          <span className="block text-[9px] font-bold text-amber-700 mt-1">
                            Backdate
                          </span>
                        )}
                      </td>

                      {/* Tanggal */}
                      <td className="p-3 font-semibold text-slate-900">
                        <Link
                          href={`/dsr/${dr.id}`}
                          className="hover:text-blue-700 hover:underline flex items-center"
                        >
                          {dateStr}
                        </Link>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {dr.jamMulai} - {dr.jamSelesai} WIB
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            dr.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : dr.status === 'SUBMITTED'
                              ? 'bg-blue-100 text-blue-800'
                              : dr.status === 'REVISI'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {dr.status}
                        </span>
                      </td>

                      {/* Cuaca */}
                      <td className="p-3 text-slate-600 text-[11px]">
                        <div>{dr.cuacaPagi} / {dr.cuacaSiang} / {dr.cuacaSore}</div>
                        {dr.jamTerhentiCuaca > 0 && (
                          <span className="text-[10px] text-rose-600 font-bold block">
                            Hujan: {dr.jamTerhentiCuaca}j
                          </span>
                        )}
                      </td>

                      {/* Pekerja */}
                      <td className="p-3 text-center font-bold text-slate-800">
                        {totalWorkers} <span className="text-[10px] font-normal text-slate-500">org</span>
                      </td>

                      {/* Item Progres */}
                      <td className="p-3 text-center font-bold text-blue-700">
                        {dr.progressEntries.length} <span className="text-[10px] font-normal text-slate-500">item</span>
                      </td>

                      {/* Foto */}
                      <td className="p-3 text-center font-bold text-indigo-700">
                        {dr.photos.length} <span className="text-[10px] font-normal text-slate-500">foto</span>
                      </td>

                      {/* Approval / Pembuat */}
                      <td className="p-3 text-[11px] text-slate-500">
                        {dr.disetujuiPada ? (
                          <div>
                            <span className="text-emerald-700 font-semibold block flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 inline" /> Disetujui PM
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Oleh {dr.disetujuiOleh?.nama || 'Project Manager'}
                            </span>
                          </div>
                        ) : dr.status === 'REVISI' ? (
                          <span className="text-rose-700 font-semibold block">
                            Perlu Revisi
                          </span>
                        ) : (
                          <span className="text-slate-400 italic block">
                            Menunggu Review PM
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Link
                            href={`/dsr/${dr.id}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors"
                          >
                            Detail
                          </Link>
                          {canManage && (
                            <DeleteDsrButton
                              id={dr.id}
                              reportTitle={`Laporan Hari ke-${dr.hariKerjaKe} (${dateStr})`}
                              variant="icon"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CARD GRID VIEW (TAMPILAN KARTU)                                           */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((dr) => {
            const dateObj = new Date(dr.tanggal);
            const dateStr = dateObj.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const totalWorkers = dr.manpowers.reduce((acc: number, m: any) => acc + m.jumlah, 0);

            return (
              <div
                key={dr.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        dr.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dr.status === 'SUBMITTED'
                          ? 'bg-blue-100 text-blue-800'
                          : dr.status === 'REVISI'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {dr.status}
                    </span>

                    {dr.isBackdated && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Backdate
                      </span>
                    )}
                  </div>

                  <Link href={`/dsr/${dr.id}`} className="block">
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {dateStr}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hari Kerja ke-{dr.hariKerjaKe} dari 60 &bull; Cuaca: {dr.cuacaPagi}/{dr.cuacaSiang}/{dr.cuacaSore}
                  </p>

                  {/* Highlights */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-semibold">PEKERJA</span>
                      <span className="font-extrabold text-slate-800">{totalWorkers} Org</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-semibold">ITEM PROGRES</span>
                      <span className="font-extrabold text-blue-700">{dr.progressEntries.length} Item</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-semibold">FOTO</span>
                      <span className="font-extrabold text-indigo-700">{dr.photos.length} Foto</span>
                    </div>
                  </div>

                  {dr.jamTerhentiCuaca > 0 && (
                    <div className="mt-3 p-2 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-800 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600 flex-shrink-0" />
                      <span>Terhenti cuaca: <b>{dr.jamTerhentiCuaca} Jam</b> (Force Majeure)</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {dr.disetujuiPada ? 'Disetujui PM' : 'Menunggu Approval'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {canManage && (
                      <DeleteDsrButton
                        id={dr.id}
                        reportTitle={`Laporan Hari ke-${dr.hariKerjaKe} (${dateStr})`}
                        variant="icon"
                      />
                    )}
                    <Link
                      href={`/dsr/${dr.id}`}
                      className="inline-flex items-center text-xs font-bold text-slate-900 group-hover:text-blue-700"
                    >
                      Detail <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
