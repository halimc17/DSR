'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Layers, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  CircleDashed, 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  ListTree, 
  Table as TableIcon,
  ChevronRight,
  ExternalLink,
  Calendar,
  AlertTriangle,
  History,
  X,
  PlusCircle,
  FileText
} from 'lucide-react';
import { formatRupiah, formatPercent } from '@/lib/calculations';
import type { RabProgressPageData, RabProgressItemDetail } from '@/lib/types';

interface ProgressClientProps {
  data: RabProgressPageData;
}

export function ProgressClient({ data }: ProgressClientProps) {
  const { summary, categories, items } = data;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL');
  const [sortBy, setSortBy] = useState<'URUTAN' | 'PROGRESS_DESC' | 'PROGRESS_ASC' | 'BOBOT_DESC' | 'NILAI_DESC'>('URUTAN');
  const [viewMode, setViewMode] = useState<'COMPACT' | 'GROUPED' | 'TABLE'>('TABLE');
  
  // History Modal State
  const [selectedItemHistory, setSelectedItemHistory] = useState<RabProgressItemDetail | null>(null);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      const matchSearch =
        item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.uraian.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subKategori.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && item.kategori !== selectedCategory) {
        return false;
      }

      // Status filter
      const pct = item.percentCumulative ?? 0;
      if (statusFilter === 'COMPLETED' && pct < 99.9) return false;
      if (statusFilter === 'IN_PROGRESS' && (pct < 0.1 || pct >= 99.9)) return false;
      if (statusFilter === 'NOT_STARTED' && pct >= 0.1) return false;

      return true;
    }).sort((a, b) => {
      const pctA = a.percentCumulative ?? 0;
      const pctB = b.percentCumulative ?? 0;

      switch (sortBy) {
        case 'PROGRESS_DESC':
          return pctB - pctA || a.urutan - b.urutan;
        case 'PROGRESS_ASC':
          return pctA - pctB || a.urutan - b.urutan;
        case 'BOBOT_DESC':
          return b.bobotPersen - a.bobotPersen;
        case 'NILAI_DESC':
          return b.totalHarga - a.totalHarga;
        case 'URUTAN':
        default:
          return a.urutan - b.urutan;
      }
    });
  }, [items, searchQuery, selectedCategory, statusFilter, sortBy]);

  // Grouped by Subkategori (for GROUPED view)
  const groupedItems = useMemo(() => {
    const groups: Record<string, { subKategori: string; kategori: string; items: RabProgressItemDetail[] }> = {};
    
    filteredItems.forEach((item) => {
      const key = `${item.kategori} - ${item.subKategori}`;
      if (!groups[key]) {
        groups[key] = {
          subKategori: item.subKategori,
          kategori: item.kategori,
          items: [],
        };
      }
      groups[key].items.push(item);
    });

    return Object.values(groups);
  }, [filteredItems]);

  // Color helper for progress bar
  const getProgressBarColor = (pct: number) => {
    if (pct >= 99.9) return 'bg-emerald-500';
    if (pct >= 70) return 'bg-blue-600';
    if (pct >= 25) return 'bg-amber-500';
    if (pct > 0) return 'bg-orange-500';
    return 'bg-slate-200';
  };

  const getProgressTextColor = (pct: number) => {
    if (pct >= 99.9) return 'text-emerald-700';
    if (pct >= 70) return 'text-blue-700';
    if (pct >= 25) return 'text-amber-700';
    if (pct > 0) return 'text-orange-700';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Navigation Tabs Top */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <Link
          href="/progress"
          className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white shadow-xs"
        >
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span>Progres Fisik RAB</span>
        </Link>
        <Link
          href="/rab"
          className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Layers className="w-4 h-4 text-slate-400" />
          <span>Rekonsiliasi Bobot</span>
        </Link>
        <Link
          href="/termin"
          className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Receipt className="w-4 h-4 text-slate-400" />
          <span>Klaim Termin</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Monitoring Fisik Terpasang &bull; 65 Item RAB</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Progres Fisik Item RAB
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pantau persentase penyelesaian (%) dan akumulasi volume terpasang setiap item dari laporan harian DSR
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/dsr/new"
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Input Progres Baru</span>
            </Link>
          </div>
        </div>

        {/* KPI Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t border-slate-100">
          {/* Card 1: Total Progres Fisik */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-3.5 sm:p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">
                Total Progres Fisik
              </span>
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {formatPercent(summary.totalProgressSchedule)}
              </span>
              <span className="text-[11px] font-medium text-slate-500">Basis Jadwal</span>
            </div>
            <div className="text-[10px] text-blue-700 font-medium mt-1">
              Basis RAB: <b>{formatPercent(summary.totalProgressRab)}</b>
            </div>
          </div>

          {/* Card 2: Status Item Selesai */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Pekerjaan Selesai
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                {summary.completedItems}
              </span>
              <span className="text-xs text-slate-500">dari {summary.totalItems} item</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(summary.completedItems / summary.totalItems) * 100}%` }}
              />
            </div>
          </div>

          {/* Card 3: Sedang Berjalan & Belum Mulai */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Sedang Dikerjakan
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black text-amber-700">
                {summary.inProgressItems}
              </span>
              <span className="text-xs text-slate-500">item aktif</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Belum dimulai: <span className="font-semibold text-slate-700">{summary.notStartedItems} item</span>
            </div>
          </div>

          {/* Card 4: Nilai Fisik Terpasang */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Nilai Terpasang (RAB)
              </span>
              <Receipt className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2">
              <span className="text-lg sm:text-xl font-bold text-slate-900 block truncate">
                {formatRupiah(summary.totalNilaiTerpasang)}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Kontrak: {formatRupiah(summary.totalNilaiRab)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category Filter, Status Filter, Sort, View Switcher */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode (misal A.1.3) atau uraian pekerjaan..."
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

          {/* Controls Right: Sort & View Modes */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="URUTAN">Urutan RAB</option>
                <option value="PROGRESS_DESC">Progres Tertinggi (% ↓)</option>
                <option value="PROGRESS_ASC">Progres Terendah (% ↑)</option>
                <option value="BOBOT_DESC">Bobot RAB Terbesar</option>
                <option value="NILAI_DESC">Nilai Kontrak Terbesar</option>
              </select>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('TABLE')}
                title="Tampilan Tabel Detail (Default)"
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'TABLE'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
              <button
                onClick={() => setViewMode('COMPACT')}
                title="Tampilan Kartu Ringkas"
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'COMPACT'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kartu</span>
              </button>
              <button
                onClick={() => setViewMode('GROUPED')}
                title="Tampilan Kelompok Subkategori"
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'GROUPED'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kelompok</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills: Categories & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center">
              <Filter className="w-3 h-3 mr-1" /> Kategori:
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({items.length})
            </button>
            {categories.map((c) => {
              const count = items.filter((i) => i.kategori === c.name).length;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === c.name
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name.split('.')[1] || c.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                statusFilter === 'ALL' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Semua Status
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                statusFilter === 'COMPLETED' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Selesai ({summary.completedItems})
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                statusFilter === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Berjalan ({summary.inProgressItems})
            </button>
            <button
              onClick={() => setStatusFilter('NOT_STARTED')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                statusFilter === 'NOT_STARTED' ? 'bg-slate-200 text-slate-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Belum ({summary.notStartedItems})
            </button>
          </div>
        </div>
      </div>

      {/* RESULT COUNT NOTICE */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Menampilkan <b>{filteredItems.length}</b> dari {items.length} item RAB
          {selectedCategory !== 'ALL' && ` &bull; ${selectedCategory}`}
          {searchQuery && ` &bull; Pencarian: "${searchQuery}"`}
        </span>
        {filteredItems.length === 0 && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setStatusFilter('ALL');
            }}
            className="text-blue-600 hover:underline font-semibold"
          >
            Reset Semua Filter
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: COMPACT CARD VIEW (MIRIP DENGAN WIDGET YANG DITAMPILKAN USER)     */}
      {/* ========================================================================= */}
      {viewMode === 'COMPACT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-2.5 sm:gap-3">
          {filteredItems.map((it) => {
            const pct = it.percentCumulative ?? 0;
            const vol = it.volumeCumulative ?? 0;
            const isDone = pct >= 99.9;
            const hasProgress = pct > 0;

            return (
              <div
                key={it.id}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all hover:shadow-md flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : hasProgress
                    ? 'bg-white border-amber-200/90 shadow-2xs'
                    : 'bg-white border-slate-200 opacity-90'
                }`}
              >
                <div>
                  {/* Top Bar: Code, Subcategory, Status badge */}
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-amber-400 px-2 py-0.5 rounded">
                        {it.kode}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium truncate">
                        {it.subKategori}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {isDone ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Selesai
                        </span>
                      ) : hasProgress ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 mr-1 text-amber-600" />
                          Berjalan
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          Belum Mulai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title / Description */}
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {it.uraian}
                  </h3>
                </div>

                {/* Progress Bar & Volume Numbers */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[11px] text-slate-500">
                      Volume: <b className="text-slate-800 font-semibold">{vol}</b> / {it.volume} {it.satuan}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className={`font-mono font-extrabold text-sm ${getProgressTextColor(pct)}`}>
                        {pct.toFixed(pct % 1 === 0 ? 0 : 1)}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 sm:h-2.5 rounded-full overflow-hidden flex items-center">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(pct)}`}
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>

                  {/* Footer Stats & Riwayat Button */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center space-x-2">
                      <span>Bobot: <b className="text-indigo-700">{formatPercent(it.bobotPersen)}</b></span>
                      <span>&bull;</span>
                      <span>Nilai: <b className="text-slate-700">{formatRupiah(it.totalHarga)}</b></span>
                    </div>

                    {it.entriesCount > 0 ? (
                      <button
                        onClick={() => setSelectedItemHistory(it)}
                        className="inline-flex items-center text-blue-700 hover:text-blue-900 font-semibold hover:underline"
                      >
                        <History className="w-3 h-3 mr-1" />
                        {it.entriesCount}x DSR
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Belum ada entri</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: GROUPED VIEW (DIKELOMPOKKAN PER SUBKATEGORI)                      */}
      {/* ========================================================================= */}
      {viewMode === 'GROUPED' && (
        <div className="space-y-6">
          {groupedItems.map((group) => {
            const totalVol = group.items.reduce((acc, i) => acc + i.volume, 0);
            const avgProgress =
              group.items.reduce((acc, i) => acc + (i.percentCumulative ?? 0), 0) / group.items.length;
            const completedCount = group.items.filter((i) => (i.percentCumulative ?? 0) >= 99.9).length;

            return (
              <div
                key={`${group.kategori}-${group.subKategori}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Group Header */}
                <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      {group.kategori}
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      {group.subKategori}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {group.items.length} item pekerjaan &bull; {completedCount} selesai
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 bg-white px-3 py-2 rounded-xl border border-slate-200 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rata-rata Subkategori</span>
                      <span className="text-xs sm:text-sm font-black text-slate-800">
                        {avgProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-16 sm:w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarColor(avgProgress)}`}
                        style={{ width: `${Math.min(100, avgProgress)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Subcategory Items List */}
                <div className="divide-y divide-slate-100">
                  {group.items.map((it) => {
                    const pct = it.percentCumulative ?? 0;
                    const vol = it.volumeCumulative ?? 0;
                    const isDone = pct >= 99.9;

                    return (
                      <div
                        key={it.id}
                        className="p-3 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                              {it.kode}
                            </span>
                            {isDone && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Selesai
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                            {it.uraian}
                          </h4>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                            <span>Kontrak: {it.volume} {it.satuan}</span>
                            <span>&bull;</span>
                            <span>Nilai: {formatRupiah(it.totalHarga)}</span>
                            <span>&bull;</span>
                            <span>Bobot: {formatPercent(it.bobotPersen)}</span>
                          </div>
                        </div>

                        {/* Progress Bar Column */}
                        <div className="w-full md:w-64 flex-shrink-0">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[11px] text-slate-500">
                              Terpasang: <b className="text-slate-800">{vol} {it.satuan}</b>
                            </span>
                            <span className={`font-mono font-extrabold ${getProgressTextColor(pct)}`}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getProgressBarColor(pct)}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <div className="flex justify-end mt-1">
                            {it.entriesCount > 0 ? (
                              <button
                                onClick={() => setSelectedItemHistory(it)}
                                className="text-[10px] font-semibold text-blue-700 hover:underline flex items-center"
                              >
                                <History className="w-3 h-3 mr-0.5" /> Riwayat DSR ({it.entriesCount})
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Belum ada DSR</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: TABLE VIEW (TABEL LENGKAP & KOMPREHENSIF)                         */}
      {/* ========================================================================= */}
      {viewMode === 'TABLE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-3 w-16 text-center">Kode</th>
                  <th className="p-3 min-w-[200px]">Uraian Pekerjaan</th>
                  <th className="p-3 w-32 text-right">Vol Terpasang / Kontrak</th>
                  <th className="p-3 w-44">Persentase Selesai</th>
                  <th className="p-3 w-24 text-right">Bobot RAB</th>
                  <th className="p-3 w-32 text-right">Nilai Kontrak</th>
                  <th className="p-3 w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((it) => {
                  const pct = it.percentCumulative ?? 0;
                  const vol = it.volumeCumulative ?? 0;
                  const isDone = pct >= 99.9;

                  return (
                    <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        {it.kode}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{it.uraian}</div>
                        <div className="text-[10px] text-slate-500">{it.subKategori}</div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-bold text-slate-800">{vol}</span>
                        <span className="text-slate-400"> / {it.volume} {it.satuan}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getProgressBarColor(pct)}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className={`w-14 text-right font-mono font-bold ${getProgressTextColor(pct)}`}>
                            {pct.toFixed(pct % 1 === 0 ? 0 : 1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-indigo-700">
                        {formatPercent(it.bobotPersen)}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-900">
                        <span className="font-semibold block">{formatRupiah(it.totalHarga)}</span>
                        {it.nilaiTerpasang > 0 && (
                          <span className="text-[10px] font-medium text-emerald-700 block">
                            Terpasang: {formatRupiah(it.nilaiTerpasang)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {it.entriesCount > 0 ? (
                          <button
                            onClick={() => setSelectedItemHistory(it)}
                            className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <History className="w-3 h-3 mr-1" />
                            {it.entriesCount}x DSR
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL RIWAYAT LAPORAN DSR PER ITEM                                        */}
      {/* ========================================================================= */}
      {selectedItemHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div>
                <span className="font-mono font-bold text-xs bg-slate-900 text-amber-400 px-2 py-0.5 rounded">
                  {selectedItemHistory.kode}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5">
                  {selectedItemHistory.uraian}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Volume Kontrak: {selectedItemHistory.volume} {selectedItemHistory.satuan} &bull; Terpasang:{' '}
                  <b>{selectedItemHistory.volumeCumulative} {selectedItemHistory.satuan}</b> ({selectedItemHistory.percentCumulative}%)
                </p>
              </div>
              <button
                onClick={() => setSelectedItemHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Riwayat Pelaporan di DSR ({selectedItemHistory.history.length} Laporan)
              </h4>

              {selectedItemHistory.history.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Belum ada catatan progres di laporan DSR.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedItemHistory.history.map((h, idx) => (
                    <div
                      key={`${h.reportId}-${idx}`}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">{h.tanggal}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                            Hari Ke-{h.hariKerjaKe}
                          </span>
                        </div>
                        {h.lokasiKerja && (
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Lokasi: <span className="font-medium text-slate-800">{h.lokasiKerja}</span>
                          </div>
                        )}
                        {h.catatan && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            "{h.catatan}"
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-mono font-bold text-sm text-emerald-700 block">
                          +{h.volumeHariIni} {selectedItemHistory.satuan}
                        </span>
                        <Link
                          href={`/dsr/${h.reportId}`}
                          className="inline-flex items-center text-[10px] text-blue-600 hover:underline mt-1 font-semibold"
                        >
                          Lihat DSR <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedItemHistory(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
