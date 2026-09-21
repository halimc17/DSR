'use client';

import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Coins 
} from 'lucide-react';
import { formatRupiah, formatPercent } from '@/lib/calculations';

interface KpiCardsProps {
  currentWeek: number;
  periodDates: string;
  actualProgressSchedule: number;
  actualProgressRab: number;
  plannedProgress: number;
  deviation: number;
  daysBehind: number;
  estimatedPenalty: number;
  workdayNumber: number;
  totalWorkdays: number;
}

export function KpiCards({
  currentWeek,
  periodDates,
  actualProgressSchedule,
  actualProgressRab,
  plannedProgress,
  deviation,
  daysBehind,
  estimatedPenalty,
  workdayNumber,
  totalWorkdays,
}: KpiCardsProps) {
  const isAhead = deviation >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Periode & Waktu */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Periode Proyek</span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-semibold text-slate-900">Minggu ke-{currentWeek} <span className="text-sm font-normal text-slate-500">/ 9</span></div>
          <p className="text-xs text-slate-500 mt-1">{periodDates}</p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
          <span>Hari Kerja ke-{workdayNumber}</span>
          <span className="font-semibold text-slate-800">Sisa {Math.max(0, totalWorkdays - workdayNumber)} hari</span>
        </div>
      </div>

      {/* 2. Realisasi vs Rencana */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progres Kumulatif</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-semibold text-slate-900">
            {formatPercent(actualProgressSchedule)}
            <span className="text-xs font-medium text-slate-500 ml-2">(Rencana: {formatPercent(plannedProgress)})</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Basis RAB (Klaim): <span className="font-semibold text-indigo-700">{formatPercent(actualProgressRab)}</span>
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Baseline Target:</span>
          <span className="font-semibold text-slate-700">{formatPercent(plannedProgress)}</span>
        </div>
      </div>

      {/* 3. Deviasi */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Deviasi</span>
          <div className={`p-2 rounded-lg ${isAhead ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {isAhead ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-semibold ${isAhead ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isAhead ? `+${formatPercent(deviation)}` : `${formatPercent(deviation)}`}
          </div>
          <p className="text-xs font-medium mt-1 text-slate-600">
            {isAhead ? (
              <span className="text-emerald-700 font-semibold">&bull; CEPAT (Ahead of Schedule)</span>
            ) : (
              <span className="text-rose-700 font-semibold">&bull; LAMBAT (Behind Schedule)</span>
            )}
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
          <span>Setara keterlambatan:</span>
          <span className={`font-semibold ${daysBehind > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
            {daysBehind > 0 ? `${daysBehind} hari kerja` : '0 hari'}
          </span>
        </div>
      </div>

      {/* 4. Resiko Denda (Pasal 9) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Eksposur Denda (Pasal 9)</span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-semibold ${estimatedPenalty > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {estimatedPenalty > 0 ? formatRupiah(estimatedPenalty) : 'Rp 0'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Tarif: 0,1%/hari (Rp 712.063/hari)</p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
          <span>Batas Kontrak:</span>
          <span className="font-bold text-rose-700">13 Nov 2026</span>
        </div>
      </div>
    </div>
  );
}
