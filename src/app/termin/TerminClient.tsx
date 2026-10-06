'use client';

import Link from 'next/link';
import { formatRupiah, formatPercent } from '@/lib/calculations';
import { Receipt, CheckCircle2, Clock, ShieldCheck, Printer, BarChart3, Layers } from 'lucide-react';

interface TerminClientProps {
  data: any;
}

export function TerminClient({ data }: TerminClientProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Navigation Tabs Top */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 no-print">
        <Link
          href="/progress"
          className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-slate-400" />
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
          className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white shadow-xs"
        >
          <Receipt className="w-4 h-4 text-amber-400" />
          <span>Klaim Termin</span>
        </Link>
      </div>
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase mb-1">
            <Receipt className="w-4 h-4" />
            <span>Pasal 6 & 7 PKS &bull; Berkas Klaim Pembayaran</span>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            Kalkulasi Progres Fisik & Klaim Termin
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Dihitung dari volume fisik terpasang kumulatif dikalikan harga satuan RAB resmi
          </p>
        </div>

        <div className="text-left sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block">Total Klaim Terhitung</span>
          <span className="text-xl sm:text-2xl font-semibold text-slate-900">{formatRupiah(data.totalClaimRupiah)}</span>
          <span className="text-xs font-bold text-indigo-700 block mt-0.5">
            ({formatPercent(data.totalClaimPercent)} dari Nilai Kontrak)
          </span>
        </div>
      </div>

      {/* 4 Termin Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {data.termins.map((t: any) => {
          const isPaid = t.status === 'DIBAYAR';
          const isReady = t.status === 'SIAP_KLAIM';
          const isPending = t.status === 'BELUM_CAPAI';

          return (
            <div
              key={t.name}
              className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
                isPaid
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : isReady
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase text-slate-800">{t.name}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : isReady
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-semibold text-slate-900">{formatRupiah(t.nilaiRupiah)}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Target: {t.targetPercent}% Progres</p>
              </div>

              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/60 text-[11px] sm:text-xs">
                {isPaid && (
                  <span className="text-emerald-700 font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Termin 1 telah cair (30%)
                  </span>
                )}
                {isReady && (
                  <span className="text-blue-700 font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Siap Diajukan ke AbadiNusa
                  </span>
                )}
                {isPending && (
                  <span className="text-slate-500 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Belum mencapai target
                  </span>
                )}
                {t.status === 'MASA_RETENSI' && (
                  <span className="text-slate-500 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Masa Pemeliharaan
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Opname Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">Rincian Opname Fisik per Item</h2>
            <p className="text-[11px] text-slate-500">Dokumen pendukung pengajuan termin (Pasal 7 PKS)</p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Cetak Opname
          </button>
        </div>

        {/* MOBILE CARD VIEW (< md) */}
        <div className="md:hidden space-y-2.5">
          {data.items.map((it: any) => {
            const pctItem = it.volume > 0 ? Math.min(100, (it.volClaim / it.volume) * 100) : 0;
            return (
              <div key={it.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {it.kode}
                  </span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {pctItem.toFixed(1)}% Terpasang
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-xs">{it.uraian}</h3>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pctItem}%` }} />
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Volume Terpasang:</span>
                    <span className="font-bold text-slate-800">{it.volClaim} / {it.volume} {it.satuan}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nilai Klaim (Rp):</span>
                    <span className="font-mono font-semibold text-emerald-700">{formatRupiah(it.itemClaimRupiah)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP TABLE VIEW (>= md) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 text-[11px] font-bold uppercase">
                  <th className="p-2.5 w-16 text-center border border-slate-200">Kode</th>
                  <th className="p-2.5 border border-slate-200">Uraian Pekerjaan</th>
                  <th className="p-2.5 w-20 text-right border border-slate-200">Vol Kontrak</th>
                  <th className="p-2.5 w-14 text-center border border-slate-200">Sat</th>
                  <th className="p-2.5 w-20 text-right border border-slate-200 bg-blue-50/50">Vol Terpasang</th>
                  <th className="p-2.5 w-28 text-right border border-slate-200">Nilai Kontrak</th>
                  <th className="p-2.5 w-28 text-right border border-slate-200 bg-emerald-50/50 font-semibold">Nilai Klaim (Rp)</th>
                  <th className="p-2.5 w-16 text-right border border-slate-200">% Item</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((it: any) => {
                  const pctItem = it.volume > 0 ? Math.min(100, (it.volClaim / it.volume) * 100) : 0;
                  return (
                    <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center font-mono font-bold text-slate-800 border border-slate-200">
                        {it.kode}
                      </td>
                      <td className="p-2.5 border border-slate-200">
                        <div className="font-semibold text-slate-900">{it.uraian}</div>
                      </td>
                      <td className="p-2.5 text-right border border-slate-200 font-mono">{it.volume}</td>
                      <td className="p-2.5 text-center border border-slate-200 text-slate-600">{it.satuan}</td>
                      <td className="p-2.5 text-right border border-slate-200 font-mono font-bold bg-blue-50/30 text-blue-800">
                        {it.volClaim}
                      </td>
                      <td className="p-2.5 text-right border border-slate-200 font-mono text-slate-700">
                        {formatRupiah(it.totalHarga)}
                      </td>
                      <td className="p-2.5 text-right border border-slate-200 font-mono font-semibold bg-emerald-50/30 text-emerald-800">
                        {formatRupiah(it.itemClaimRupiah)}
                      </td>
                      <td className="p-2.5 text-right border border-slate-200 font-mono font-bold">
                        {pctItem.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-semibold text-xs">
                  <td colSpan={5} className="p-3 text-right">TOTAL NILAI KONTRAK & KLAIM:</td>
                  <td className="p-3 text-right font-mono">{formatRupiah(data.grandTotal)}</td>
                  <td className="p-3 text-right font-mono text-emerald-400">{formatRupiah(data.totalClaimRupiah)}</td>
                  <td className="p-3 text-right font-mono text-amber-400">{formatPercent(data.totalClaimPercent)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
