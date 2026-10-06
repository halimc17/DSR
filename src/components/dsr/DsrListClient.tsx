'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DeleteDsrButton } from '@/components/dsr/DeleteDsrButton';
import type { PeriodData } from '@/lib/types';
import {
  Calendar,
  PlusCircle,
  Search,
  Filter,
  Table as TableIcon,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Users,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  X,
  ExternalLink,
  CloudRain,
  TrendingUp,
  Layers,
  CalendarDays,
  CalendarRange,
  ChevronsUpDown,
  FolderOpen
} from 'lucide-react';

interface DsrListClientProps {
  dsrList: any[];
  periods?: PeriodData[];
  currentUser?: {
    id: string;
    nama: string;
    email: string;
    role: string;
  } | null;
}

interface ProgressItemAgg {
  rabItemId: string;
  kode: string;
  uraian: string;
  satuan: string;
  volumeKontrak: number;
  volumeMingguIni: number;
  bobotJadwalAsli: number;
  bobotMingguIni?: number;
  locations: string[];
}

function toYMD(d: Date | string | null | undefined): string {
  if (!d) return '';
  if (typeof d === 'string') return d.split('T')[0];
  try {
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function isDsrInPeriod(dsrTanggal: Date | string, period: PeriodData): boolean {
  const d = toYMD(dsrTanggal);
  const s = toYMD(period.tanggalMulai);
  const e = toYMD(period.tanggalSelesai);
  return d >= s && d <= e;
}

export function DsrListClient({ dsrList, periods = [], currentUser }: DsrListClientProps) {
  // Primary mode: 'DAILY' (Laporan Harian) or 'WEEKLY' (Rekap Mingguan)
  const [reportViewMode, setReportViewMode] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  // Daily mode states
  const [dailyViewType, setDailyViewType] = useState<'TABLE' | 'GRID'>('TABLE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'SUBMITTED' | 'REVISI' | 'DRAFT'>('ALL');

  // Weekly mode states
  const [weeklyFilterWithReportsOnly, setWeeklyFilterWithReportsOnly] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    // Default open weeks that have reports
    periods.forEach((p) => {
      const hasReports = dsrList.some((d) => isDsrInPeriod(d.tanggal, p));
      if (hasReports) {
        initial[p.mingguKe] = true;
      }
    });
    return initial;
  });
  const [selectedWeekSubtab, setSelectedWeekSubtab] = useState<
    Record<number, 'REPORTS' | 'PROGRESS' | 'PHOTOS' | 'ISSUES'>
  >({});
  const [photoPreview, setPhotoPreview] = useState<{ url: string; caption?: string; date?: string } | null>(null);

  const canManage = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'PM');

  // Determine active/current period
  const nowYmd = toYMD(new Date());
  const activePeriod = useMemo(() => {
    let match = periods.find((p) => {
      const s = toYMD(p.tanggalMulai);
      const e = toYMD(p.tanggalSelesai);
      return nowYmd >= s && nowYmd <= e;
    });

    if (!match && dsrList.length > 0) {
      const latestDsrDate = toYMD(dsrList[0].tanggal);
      match = periods.find((p) => {
        const s = toYMD(p.tanggalMulai);
        const e = toYMD(p.tanggalSelesai);
        return latestDsrDate >= s && latestDsrDate <= e;
      });
    }

    return match || periods[0] || null;
  }, [periods, dsrList, nowYmd]);

  // Pre-calculate weekly summaries
  const weeklySummaries = useMemo(() => {
    return periods.map((p) => {
      const dsrsInWeek = dsrList.filter((dr) => isDsrInPeriod(dr.tanggal, p));
      const sortedDsrs = [...dsrsInWeek].sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      );

      const approvedCount = dsrsInWeek.filter((d) => d.status === 'APPROVED').length;
      const submittedCount = dsrsInWeek.filter((d) => d.status === 'SUBMITTED').length;
      const revisiCount = dsrsInWeek.filter((d) => d.status === 'REVISI').length;
      const draftCount = dsrsInWeek.filter((d) => d.status === 'DRAFT').length;

      const totalWorkers = dsrsInWeek.reduce((sum, dr) => {
        return sum + dr.manpowers.reduce((mSum: number, m: any) => mSum + m.jumlah, 0);
      }, 0);
      const avgWorkers = dsrsInWeek.length > 0 ? Math.round(totalWorkers / dsrsInWeek.length) : 0;

      const totalRainHours = dsrsInWeek.reduce((sum, dr) => sum + (dr.jamTerhentiCuaca || 0), 0);

      // Aggregate progress entries from approved/submitted DSRs
      const progressMap = new Map<string, ProgressItemAgg>();

      for (const dr of dsrsInWeek) {
        if (dr.status === 'APPROVED' || dr.status === 'SUBMITTED') {
          for (const pe of dr.progressEntries || []) {
            if (!pe.isPekerjaanTambah && pe.rabItem) {
              const item = pe.rabItem;
              let existing = progressMap.get(item.id);
              if (!existing) {
                existing = {
                  rabItemId: item.id,
                  kode: item.kode,
                  uraian: item.uraian,
                  satuan: item.satuan,
                  volumeKontrak: item.volume,
                  volumeMingguIni: 0,
                  bobotJadwalAsli: item.bobotJadwalAsli,
                  locations: [],
                };
                progressMap.set(item.id, existing);
              }
              existing.volumeMingguIni += pe.volumeHariIni;
              if (pe.lokasiKerja && typeof pe.lokasiKerja === 'string') {
                if (!existing.locations.includes(pe.lokasiKerja)) {
                  existing.locations.push(pe.lokasiKerja);
                }
              }
            }
          }
        }
      }

      const progressItems: ProgressItemAgg[] = Array.from(progressMap.values()).map((item) => {
        const bobotKontribusi =
          item.volumeKontrak > 0 ? (item.volumeMingguIni / item.volumeKontrak) * item.bobotJadwalAsli : 0;
        return {
          ...item,
          bobotMingguIni: Number(bobotKontribusi.toFixed(3)),
        };
      });

      const realisasiBobotMingguIni = progressItems.reduce(
        (acc, curr) => acc + (curr.bobotMingguIni || 0),
        0
      );

      // Photos in this week
      const photos = dsrsInWeek.flatMap((dr) =>
        (dr.photos || []).map((ph: any) => ({
          ...ph,
          reportId: dr.id,
          tanggal: dr.tanggal,
          hariKerjaKe: dr.hariKerjaKe,
        }))
      );

      // Issues in this week
      const issues = dsrsInWeek.flatMap((dr) =>
        (dr.issues || []).map((iss: any) => ({
          ...iss,
          reportId: dr.id,
          tanggal: dr.tanggal,
          hariKerjaKe: dr.hariKerjaKe,
        }))
      );

      const isCurrent = activePeriod ? p.mingguKe === activePeriod.mingguKe : false;
      const isPast = activePeriod ? p.mingguKe < activePeriod.mingguKe : toYMD(p.tanggalSelesai) < nowYmd;
      const isFuture = activePeriod ? p.mingguKe > activePeriod.mingguKe : toYMD(p.tanggalMulai) > nowYmd;

      return {
        period: p,
        dsrs: sortedDsrs,
        approvedCount,
        submittedCount,
        revisiCount,
        draftCount,
        totalWorkers,
        avgWorkers,
        totalRainHours,
        progressItems,
        realisasiBobotMingguIni: Number(realisasiBobotMingguIni.toFixed(2)),
        photos,
        issues,
        isCurrent,
        isPast,
        isFuture,
      };
    });
  }, [periods, dsrList, activePeriod, nowYmd]);

  // Filtered DSRs for Daily View
  const filteredList = useMemo(() => {
    return dsrList.filter((dr) => {
      // Week filter
      if (selectedWeekFilter !== 'ALL') {
        const targetPeriod = periods.find((p) => p.mingguKe === selectedWeekFilter);
        if (targetPeriod && !isDsrInPeriod(dr.tanggal, targetPeriod)) {
          return false;
        }
      }

      // Search filter
      const dateObj = new Date(dr.tanggal);
      const dateStr = dateObj
        .toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        .toLowerCase();

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
  }, [dsrList, searchQuery, statusFilter, selectedWeekFilter, periods]);

  // Counts
  const approvedCount = dsrList.filter((d) => d.status === 'APPROVED').length;
  const submittedCount = dsrList.filter((d) => d.status === 'SUBMITTED').length;
  const revisiCount = dsrList.filter((d) => d.status === 'REVISI').length;

  const weeksWithReportsCount = weeklySummaries.filter((w) => w.dsrs.length > 0).length;

  // Toggle week accordion
  const toggleWeek = (mingguKe: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [mingguKe]: !prev[mingguKe],
    }));
  };

  const expandAllWeeks = () => {
    const allExpanded: Record<number, boolean> = {};
    periods.forEach((p) => {
      allExpanded[p.mingguKe] = true;
    });
    setExpandedWeeks(allExpanded);
  };

  const collapseAllWeeks = () => {
    setExpandedWeeks({});
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan Harian Proyek (DSR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Arsip lengkap progres fisik harian, rekap mingguan, cuaca, tenaga kerja, dan foto dokumentasi
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

      {/* Primary Mode Selector: Laporan Harian vs Rekap Mingguan */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setReportViewMode('DAILY')}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex-1 sm:flex-initial ${
              reportViewMode === 'DAILY'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Laporan Harian</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                reportViewMode === 'DAILY' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {filteredList.length}
            </span>
          </button>

          <button
            onClick={() => setReportViewMode('WEEKLY')}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex-1 sm:flex-initial ${
              reportViewMode === 'WEEKLY'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-4 h-4 text-amber-600" />
            <span>Rekap Mingguan</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                reportViewMode === 'WEEKLY' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {periods.length > 0 ? `${periods.length} Minggu` : 'Mingguan'}
            </span>
          </button>
        </div>

        <div className="flex items-center text-xs text-slate-500 px-2">
          {reportViewMode === 'DAILY' ? (
            <span>Tampilan laporan individual per hari kerja</span>
          ) : (
            <span>Tampilan agregat progres mingguan berbasis Time Schedule</span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: LAPORAN HARIAN (DAILY VIEW)                                       */}
      {/* ========================================================================= */}
      {reportViewMode === 'DAILY' && (
        <div className="space-y-4">
          {/* Control Bar: Search, Week Filter, Status Filter, View Toggle */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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

              <div className="flex flex-wrap items-center gap-2">
                {/* Week Filter Dropdown */}
                {periods.length > 0 && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                      Periode:
                    </span>
                    <select
                      value={selectedWeekFilter}
                      onChange={(e) =>
                        setSelectedWeekFilter(
                          e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                        )
                      }
                      className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      <option value="ALL">Semua Minggu (1-{periods.length})</option>
                      {periods.map((p) => {
                        const start = new Date(p.tanggalMulai).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        });
                        const end = new Date(p.tanggalSelesai).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        });
                        const isCurr = activePeriod && p.mingguKe === activePeriod.mingguKe;
                        return (
                          <option key={p.id} value={p.mingguKe}>
                            Minggu {p.mingguKe} ({start} - {end}) {isCurr ? '• Berjalan' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* View Mode Toggle Buttons (Table vs Grid) */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex-shrink-0">
                  <button
                    onClick={() => setDailyViewType('TABLE')}
                    title="Tampilan Tabel (Table View)"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dailyViewType === 'TABLE'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tabel</span>
                  </button>
                  <button
                    onClick={() => setDailyViewType('GRID')}
                    title="Tampilan Kartu Grid (Card View)"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dailyViewType === 'GRID'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kartu Grid</span>
                  </button>
                </div>
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
                {searchQuery || statusFilter !== 'ALL' || selectedWeekFilter !== 'ALL'
                  ? 'Tidak ada laporan yang cocok dengan pencarian / filter periode'
                  : 'Belum ada laporan harian tercatat'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                {searchQuery || statusFilter !== 'ALL' || selectedWeekFilter !== 'ALL'
                  ? 'Silakan coba ubah kata kunci atau reset filter periode dan status.'
                  : 'Mulai buat laporan sekarang atau input backdate untuk tanggal sebelumnya.'}
              </p>
              {searchQuery || statusFilter !== 'ALL' || selectedWeekFilter !== 'ALL' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setSelectedWeekFilter('ALL');
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                >
                  Reset Semua Filter
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
          ) : dailyViewType === 'TABLE' ? (
            /* TABLE VIEW */
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

                          <td className="p-3 text-slate-600 text-[11px]">
                            <div>
                              {dr.cuacaPagi} / {dr.cuacaSiang} / {dr.cuacaSore}
                            </div>
                            {dr.jamTerhentiCuaca > 0 && (
                              <span className="text-[10px] text-rose-600 font-bold block">
                                Hujan: {dr.jamTerhentiCuaca}j
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-center font-bold text-slate-800">
                            {totalWorkers}{' '}
                            <span className="text-[10px] font-normal text-slate-500">org</span>
                          </td>

                          <td className="p-3 text-center font-bold text-blue-700">
                            {dr.progressEntries.length}{' '}
                            <span className="text-[10px] font-normal text-slate-500">item</span>
                          </td>

                          <td className="p-3 text-center font-bold text-indigo-700">
                            {dr.photos.length}{' '}
                            <span className="text-[10px] font-normal text-slate-500">foto</span>
                          </td>

                          <td className="p-3 text-[11px] text-slate-500">
                            {dr.disetujuiPada ? (
                              <div>
                                <span className="text-emerald-700 font-semibold block flex items-center">
                                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 inline" />{' '}
                                  Disetujui PM
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

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Link
                                href={`/dsr/${dr.id}`}
                                className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors"
                              >
                                Detail
                              </Link>
                              {dr.status !== 'APPROVED' && (
                                <Link
                                  href={`/dsr/${dr.id}/edit`}
                                  className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition-colors"
                                  title="Edit Laporan"
                                >
                                  Edit
                                </Link>
                              )}
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
            /* CARD GRID VIEW */
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
                        Hari Kerja ke-{dr.hariKerjaKe} dari 60 &bull; Cuaca: {dr.cuacaPagi}/
                        {dr.cuacaSiang}/{dr.cuacaSore}
                      </p>

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
                          <span>
                            Terhenti cuaca: <b>{dr.jamTerhentiCuaca} Jam</b> (Force Majeure)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {dr.disetujuiPada ? 'Disetujui PM' : 'Menunggu Approval'}
                      </span>
                      <div className="flex items-center space-x-2">
                        {dr.status !== 'APPROVED' && (
                          <Link
                            href={`/dsr/${dr.id}/edit`}
                            className="inline-flex items-center text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            Edit
                          </Link>
                        )}
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
      )}

      {/* ========================================================================= */}
      {/* MODE 2: REKAP MINGGUAN (WEEKLY VIEW)                                      */}
      {/* ========================================================================= */}
      {reportViewMode === 'WEEKLY' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Durasi Proyek
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {periods.length} Minggu
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Baseline 60 Hari Kerja (15 Sep - 15 Nov)
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/40 shadow-sm">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Minggu Berjalan
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-950 mt-1">
                {activePeriod ? `Minggu ke-${activePeriod.mingguKe}` : '-'}
              </div>
              <p className="text-[11px] text-blue-700 mt-0.5">
                {activePeriod
                  ? `${new Date(activePeriod.tanggalMulai).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })} s/d ${new Date(activePeriod.tanggalSelesai).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}`
                  : 'Aktif'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Laporan DSR Masuk
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {dsrList.length} Laporan
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                {approvedCount} Disetujui &bull; {submittedCount} Menunggu PM
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Kumulatif Saat Ini
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                {activePeriod ? `${activePeriod.bobotKumulatifRencana.toFixed(2)}%` : '0%'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target Time Schedule s/d Minggu {activePeriod ? activePeriod.mingguKe : '-'}
              </p>
            </div>
          </div>

          {/* Weekly Filter & Collapse Controls */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setWeeklyFilterWithReportsOnly(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !weeklyFilterWithReportsOnly
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Periode ({periods.length} Minggu)
              </button>
              <button
                onClick={() => setWeeklyFilterWithReportsOnly(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  weeklyFilterWithReportsOnly
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Hanya Minggu Berisi Laporan ({weeksWithReportsCount})
              </button>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                onClick={expandAllWeeks}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Buka Semua
              </button>
              <button
                onClick={collapseAllWeeks}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Tutup Semua
              </button>
            </div>
          </div>

          {/* Weekly Cards List */}
          <div className="space-y-4">
            {weeklySummaries
              .filter((w) => (!weeklyFilterWithReportsOnly ? true : w.dsrs.length > 0))
              .map((summary) => {
                const {
                  period,
                  dsrs,
                  approvedCount: wApproved,
                  totalWorkers,
                  avgWorkers,
                  totalRainHours,
                  progressItems,
                  realisasiBobotMingguIni,
                  photos,
                  issues,
                  isCurrent,
                  isPast,
                  isFuture,
                } = summary;

                const isExpanded = !!expandedWeeks[period.mingguKe];
                const activeSubtab = selectedWeekSubtab[period.mingguKe] || 'REPORTS';

                const startStr = new Date(period.tanggalMulai).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const endStr = new Date(period.tanggalSelesai).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={period.id}
                    className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                      isCurrent
                        ? 'border-blue-400 ring-2 ring-blue-100'
                        : dsrs.length > 0
                        ? 'border-slate-300'
                        : 'border-slate-200 opacity-90'
                    }`}
                  >
                    {/* Header Row (Clickable Accordion Trigger) */}
                    <div
                      onClick={() => toggleWeek(period.mingguKe)}
                      className={`p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/40 hover:bg-blue-50/70'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Left: Week Badge, Date range, Status */}
                      <div className="flex items-start sm:items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            isCurrent
                              ? 'bg-blue-600 text-white shadow-sm'
                              : dsrs.length > 0
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          W{period.mingguKe}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              Minggu ke-{period.mingguKe}
                            </h3>

                            {isCurrent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                                Sedang Berjalan (Aktif)
                              </span>
                            )}

                            {isPast && dsrs.length > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Selesai
                              </span>
                            )}

                            {isPast && dsrs.length === 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                Tanpa Laporan
                              </span>
                            )}

                            {isFuture && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
                                Mendatang
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {startStr} &mdash; {endStr}
                          </p>
                        </div>
                      </div>

                      {/* Right: Summary Metrics Pills */}
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        {/* Target Rencana */}
                        <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-center">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">
                            Target Rencana
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            {period.bobotRencana.toFixed(2)}%
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            (Kum: {period.bobotKumulatifRencana.toFixed(2)}%)
                          </span>
                        </div>

                        {/* Realisasi Bobot */}
                        <div
                          className={`px-3 py-1.5 rounded-xl text-center ${
                            realisasiBobotMingguIni > 0
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="text-[9px] font-bold block uppercase opacity-75">
                            Realisasi
                          </span>
                          <span className="text-xs font-black">
                            {realisasiBobotMingguIni > 0 ? `+${realisasiBobotMingguIni}%` : '0%'}
                          </span>
                          <span className="text-[9px] block opacity-75">
                            {progressItems.length} Item RAB
                          </span>
                        </div>

                        {/* DSR Counts */}
                        <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-center">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">
                            Laporan DSR
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            {dsrs.length} Hari
                          </span>
                          <span className="text-[9px] text-emerald-700 block">
                            {wApproved} Approved
                          </span>
                        </div>

                        {/* Tenaga Kerja */}
                        <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-center hidden sm:block">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">
                            Tenaga Kerja
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            {totalWorkers} Org-Hari
                          </span>
                          <span className="text-[9px] text-slate-500 block">
                            avg {avgWorkers}/hari
                          </span>
                        </div>

                        {/* Rain or Issues Badge */}
                        {totalRainHours > 0 && (
                          <div
                            className="bg-rose-50 text-rose-800 px-2.5 py-1.5 rounded-xl text-center border border-rose-100"
                            title={`Hujan terhenti cuaca: ${totalRainHours} jam`}
                          >
                            <span className="text-[9px] font-bold block flex items-center justify-center">
                              <CloudRain className="w-3 h-3 mr-0.5 inline" /> Hujan
                            </span>
                            <span className="text-xs font-bold">{totalRainHours}j</span>
                          </div>
                        )}

                        {issues.length > 0 && (
                          <div
                            className="bg-amber-50 text-amber-800 px-2.5 py-1.5 rounded-xl text-center border border-amber-100"
                            title={`${issues.length} kendala dilaporkan`}
                          >
                            <span className="text-[9px] font-bold block flex items-center justify-center">
                              <AlertTriangle className="w-3 h-3 mr-0.5 inline" /> Kendala
                            </span>
                            <span className="text-xs font-bold">{issues.length}</span>
                          </div>
                        )}

                        {/* Accordion Chevron */}
                        <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Accordion Content (When Expanded) */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-white p-4 sm:p-6 space-y-4">
                        {dsrs.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-700">
                              {isFuture
                                ? `Minggu ke-${period.mingguKe} belum dimulai`
                                : `Belum ada laporan harian (DSR) tercatat pada Minggu ke-${period.mingguKe}`}
                            </p>
                            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                              Target Time Schedule untuk minggu ini adalah{' '}
                              <b>{period.bobotRencana.toFixed(2)}%</b> (target kumulatif{' '}
                              <b>{period.bobotKumulatifRencana.toFixed(2)}%</b>). Laporan harian
                              akan otomatis terakumulasi di sini setelah diinput.
                            </p>
                            <Link
                              href="/dsr/new"
                              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                              Input DSR untuk Minggu Ini
                            </Link>
                          </div>
                        ) : (
                          <>
                            {/* Inner Subtabs */}
                            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3 text-xs">
                              <button
                                onClick={() =>
                                  setSelectedWeekSubtab((prev) => ({
                                    ...prev,
                                    [period.mingguKe]: 'REPORTS',
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                                  activeSubtab === 'REPORTS'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <TableIcon className="w-3.5 h-3.5" />
                                <span>Laporan Harian ({dsrs.length})</span>
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedWeekSubtab((prev) => ({
                                    ...prev,
                                    [period.mingguKe]: 'PROGRESS',
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                                  activeSubtab === 'PROGRESS'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Progres Fisik RAB ({progressItems.length} Item)</span>
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedWeekSubtab((prev) => ({
                                    ...prev,
                                    [period.mingguKe]: 'PHOTOS',
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                                  activeSubtab === 'PHOTOS'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Foto Lapangan ({photos.length})</span>
                              </button>

                              {issues.length > 0 && (
                                <button
                                  onClick={() =>
                                    setSelectedWeekSubtab((prev) => ({
                                      ...prev,
                                      [period.mingguKe]: 'ISSUES',
                                    }))
                                  }
                                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                                    activeSubtab === 'ISSUES'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  }`}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Kendala ({issues.length})</span>
                                </button>
                              )}
                            </div>

                            {/* SUBTAB 1: DAFTAR LAPORAN HARIAN */}
                            {activeSubtab === 'REPORTS' && (
                              <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                                      <th className="p-2.5 text-center w-24">Hari Ke-</th>
                                      <th className="p-2.5 min-w-[140px]">Tanggal</th>
                                      <th className="p-2.5 text-center w-28">Status</th>
                                      <th className="p-2.5 w-28">Cuaca</th>
                                      <th className="p-2.5 text-center w-20">Pekerja</th>
                                      <th className="p-2.5 text-center w-24">Item RAB</th>
                                      <th className="p-2.5 text-center w-16">Foto</th>
                                      <th className="p-2.5 min-w-[150px]">Keterangan</th>
                                      <th className="p-2.5 text-center w-24">Aksi</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {dsrs.map((dr) => {
                                      const dObj = new Date(dr.tanggal);
                                      const dStr = dObj.toLocaleDateString('id-ID', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      });
                                      const wCount = dr.manpowers.reduce(
                                        (a: number, m: any) => a + m.jumlah,
                                        0
                                      );

                                      return (
                                        <tr key={dr.id} className="hover:bg-slate-50 transition-colors">
                                          <td className="p-2.5 text-center">
                                            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                                              Hari {dr.hariKerjaKe}
                                            </span>
                                            {dr.isBackdated && (
                                              <span className="block text-[9px] font-bold text-amber-700">
                                                Backdate
                                              </span>
                                            )}
                                          </td>

                                          <td className="p-2.5 font-semibold text-slate-900">
                                            <Link
                                              href={`/dsr/${dr.id}`}
                                              className="hover:text-blue-700 hover:underline"
                                            >
                                              {dStr}
                                            </Link>
                                            <span className="text-[10px] text-slate-400 block font-normal">
                                              {dr.jamMulai} - {dr.jamSelesai} WIB
                                            </span>
                                          </td>

                                          <td className="p-2.5 text-center">
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

                                          <td className="p-2.5 text-slate-600 text-[11px]">
                                            <div>
                                              {dr.cuacaPagi}/{dr.cuacaSiang}/{dr.cuacaSore}
                                            </div>
                                            {dr.jamTerhentiCuaca > 0 && (
                                              <span className="text-[10px] text-rose-600 font-bold block">
                                                Hujan: {dr.jamTerhentiCuaca}j
                                              </span>
                                            )}
                                          </td>

                                          <td className="p-2.5 text-center font-bold text-slate-800">
                                            {wCount} org
                                          </td>

                                          <td className="p-2.5 text-center font-bold text-blue-700">
                                            {dr.progressEntries.length} item
                                          </td>

                                          <td className="p-2.5 text-center font-bold text-indigo-700">
                                            {dr.photos.length}
                                          </td>

                                          <td className="p-2.5 text-[11px] text-slate-500">
                                            {dr.disetujuiPada ? (
                                              <span className="text-emerald-700 font-semibold flex items-center">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Disetujui PM
                                              </span>
                                            ) : dr.status === 'REVISI' ? (
                                              <span className="text-rose-700 font-semibold">
                                                Perlu Revisi
                                              </span>
                                            ) : (
                                              <span className="text-slate-400 italic">
                                                Menunggu Review PM
                                              </span>
                                            )}
                                          </td>

                                          <td className="p-2.5 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                              <Link
                                                href={`/dsr/${dr.id}`}
                                                className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800"
                                              >
                                                Detail
                                              </Link>
                                              {dr.status !== 'APPROVED' && (
                                                <Link
                                                  href={`/dsr/${dr.id}/edit`}
                                                  className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100"
                                                >
                                                  Edit
                                                </Link>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* SUBTAB 2: PROGRES FISIK RAB */}
                            {activeSubtab === 'PROGRESS' && (
                              <div className="space-y-3">
                                {progressItems.length === 0 ? (
                                  <div className="p-6 text-center text-slate-400 text-xs">
                                    Belum ada catatan volume progres pada laporan yang disetujui/disubmit minggu ini.
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                                          <th className="p-2.5 w-24">Kode</th>
                                          <th className="p-2.5 min-w-[200px]">Uraian Pekerjaan</th>
                                          <th className="p-2.5 text-right w-28">Volume Dikerjakan</th>
                                          <th className="p-2.5 text-right w-24">Vol Kontrak</th>
                                          <th className="p-2.5 text-right w-28">Kontribusi Bobot</th>
                                          <th className="p-2.5 min-w-[150px]">Lokasi Kerja</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {progressItems.map((item) => (
                                          <tr key={item.rabItemId} className="hover:bg-slate-50">
                                            <td className="p-2.5 font-mono font-bold text-slate-800">
                                              {item.kode}
                                            </td>
                                            <td className="p-2.5 text-slate-900 font-medium">
                                              {item.uraian}
                                            </td>
                                            <td className="p-2.5 text-right font-extrabold text-blue-700">
                                              {item.volumeMingguIni.toLocaleString('id-ID')} {item.satuan}
                                            </td>
                                            <td className="p-2.5 text-right text-slate-500">
                                              {item.volumeKontrak.toLocaleString('id-ID')} {item.satuan}
                                            </td>
                                            <td className="p-2.5 text-right font-bold text-emerald-700">
                                              +{item.bobotMingguIni}%
                                            </td>
                                            <td className="p-2.5 text-slate-500 text-[11px]">
                                              {item.locations.length > 0
                                                ? item.locations.join(', ')
                                                : '-'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                                          <td colSpan={4} className="p-2.5 text-right uppercase text-[11px]">
                                            Total Realisasi Bobot Minggu ke-{period.mingguKe}:
                                          </td>
                                          <td className="p-2.5 text-right text-emerald-700 text-sm font-black">
                                            +{realisasiBobotMingguIni}%
                                          </td>
                                          <td></td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* SUBTAB 3: FOTO DOKUMENTASI */}
                            {activeSubtab === 'PHOTOS' && (
                              <div>
                                {photos.length === 0 ? (
                                  <div className="p-6 text-center text-slate-400 text-xs">
                                    Belum ada foto dokumentasi yang diunggah pada minggu ini.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {photos.map((ph, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() =>
                                          setPhotoPreview({
                                            url: ph.url,
                                            caption: ph.keterangan || ph.kategori,
                                            date: new Date(ph.tanggal).toLocaleDateString('id-ID', {
                                              day: 'numeric',
                                              month: 'short',
                                              year: 'numeric',
                                            }),
                                          })
                                        }
                                        className="group relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 aspect-square cursor-pointer hover:shadow-md transition-all"
                                      >
                                        <img
                                          src={ph.thumbUrl || ph.url}
                                          alt={ph.keterangan || 'Foto Proyek'}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                        <div className="absolute top-1.5 left-1.5">
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                                            Hari {ph.hariKerjaKe}
                                          </span>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                                          <span className="text-[9px] font-semibold block truncate">
                                            {ph.kategori}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* SUBTAB 4: KENDALA */}
                            {activeSubtab === 'ISSUES' && (
                              <div className="space-y-2">
                                {issues.length === 0 ? (
                                  <div className="p-6 text-center text-slate-400 text-xs">
                                    Tidak ada kendala tercatat pada minggu ini.
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                                          <th className="p-2.5 w-24">Hari Ke-</th>
                                          <th className="p-2.5 w-32">Kategori</th>
                                          <th className="p-2.5 min-w-[200px]">Deskripsi Kendala</th>
                                          <th className="p-2.5 text-center w-28">Dampak Waktu</th>
                                          <th className="p-2.5 min-w-[150px]">Tindakan / Solusi</th>
                                          <th className="p-2.5 text-center w-24">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {issues.map((iss, idx) => (
                                          <tr key={idx} className="hover:bg-slate-50">
                                            <td className="p-2.5 font-mono font-bold text-slate-700">
                                              Hari {iss.hariKerjaKe}
                                            </td>
                                            <td className="p-2.5 font-semibold text-rose-700">
                                              {iss.kategori}
                                            </td>
                                            <td className="p-2.5 text-slate-800">
                                              {iss.deskripsi}
                                            </td>
                                            <td className="p-2.5 text-center font-bold text-slate-700">
                                              {iss.dampakJam} Jam
                                            </td>
                                            <td className="p-2.5 text-slate-600">
                                              {iss.tindakan || '-'}
                                            </td>
                                            <td className="p-2.5 text-center">
                                              <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                  iss.status === 'CLOSED'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-rose-100 text-rose-800'
                                                }`}
                                              >
                                                {iss.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {photoPreview && (
        <div
          onClick={() => setPhotoPreview(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl relative"
          >
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-semibold">
                {photoPreview.date} &bull; {photoPreview.caption}
              </span>
              <button
                onClick={() => setPhotoPreview(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-950 flex items-center justify-center max-h-[75vh]">
              <img
                src={photoPreview.url}
                alt={photoPreview.caption || 'Preview'}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
