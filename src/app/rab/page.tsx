import { getRabItemsWithProgress } from '@/app/actions/dsr';
import { formatRupiah, formatPercent } from '@/lib/calculations';
import { Layers, AlertTriangle, CheckCircle2, Search, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RabReconciliationPage() {
  const items = await getRabItemsWithProgress();

  const totalNilaiRab = items.reduce((acc, i) => acc + i.totalHarga, 0);
  const totalBobotRab = items.reduce((acc, i) => acc + i.bobotPersen, 0);
  const totalBobotJadwal = items.reduce((acc, i) => acc + i.bobotJadwalAsli, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Rekonsiliasi RAB vs Time Schedule
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Laporan disparitas bobot & rekonsiliasi dua basis progres (Pasal 2, 6, & 7 PKS)
            </p>
          </div>
        </div>

        {/* Highlighted Warning from PRD */}
        <div className="mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
          <div className="flex items-center font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600 flex-shrink-0" />
            <span>Keputusan Produk: RAB Kontrak adalah Single Source of Truth</span>
          </div>
          <p className="text-[11px] sm:text-xs">
            Ditemukan disparitas pada dokumen jadwal resmi yang telah ditandatangani:
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] font-medium">
            <li>
              <b>B.1.13 (Instalasi Nurse Call)</b> bernilai Rp 3.080.000 di RAB (<b>0,43%</b>) tetapi diberi bobot <b>6,93%</b> di jadwal.
            </li>
            <li>
              <b>B.3.3 (Meja Nurse Station)</b> bernilai Rp 48.720.000 di RAB (<b>6,84%</b>) tetapi hanya diberi bobot <b>1,83%</b> di jadwal.
            </li>
          </ul>
          <p className="text-[10px] sm:text-[11px] text-amber-800 pt-1">
            <b>Solusi:</b> Sistem menampilkan <b>dua basis</b>. Basis Jadwal untuk pelaporan mingguan AbadiNusa, Basis RAB untuk klaim termin.
          </p>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl">
            <span className="text-slate-500 text-[11px] font-semibold block">Total Nilai RAB</span>
            <span className="text-base sm:text-lg font-semibold text-slate-900">{formatRupiah(totalNilaiRab)}</span>
          </div>
          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl">
            <span className="text-slate-500 text-[11px] font-semibold block">Total Bobot RAB</span>
            <span className="text-base sm:text-lg font-semibold text-indigo-700">{formatPercent(totalBobotRab)}</span>
          </div>
          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl">
            <span className="text-slate-500 text-[11px] font-semibold block">Total Bobot Jadwal</span>
            <span className="text-base sm:text-lg font-semibold text-emerald-700">{formatPercent(totalBobotJadwal)}</span>
          </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW (< md) */}
      <div className="md:hidden space-y-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
          Daftar 65 Item Pekerjaan ({items.length} Item)
        </h2>
        {items.map((it) => {
          const isDiscrepant = Math.abs(it.selisihBobot) > 0.5;
          return (
            <div
              key={it.id}
              className={`p-3.5 rounded-xl border shadow-sm space-y-2 ${
                isDiscrepant ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {it.kode}
                </span>
                {isDiscrepant ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Tertukar (Selisih {it.selisihBobot > 0 ? `+${it.selisihBobot.toFixed(2)}` : it.selisihBobot.toFixed(2)}%)
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Sesuai
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900">{it.uraian}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{it.subKategori}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block">Volume</span>
                  <span className="font-bold text-slate-800">{it.volume} {it.satuan}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Bobot RAB</span>
                  <span className="font-semibold text-indigo-700">{formatPercent(it.bobotPersen)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Bobot Jadwal</span>
                  <span className="font-semibold text-emerald-700">{formatPercent(it.bobotJadwalAsli)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[10px]">Nilai Kontrak:</span>
                <span className="font-mono font-semibold text-slate-900">{formatRupiah(it.totalHarga)}</span>
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
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3 w-16 text-center">Kode</th>
                <th className="p-3">Uraian Pekerjaan</th>
                <th className="p-3 w-24 text-right">Volume</th>
                <th className="p-3 w-16 text-center">Satuan</th>
                <th className="p-3 w-32 text-right">Total RAB (Rp)</th>
                <th className="p-3 w-24 text-right">Bobot RAB</th>
                <th className="p-3 w-24 text-right">Bobot Jadwal</th>
                <th className="p-3 w-20 text-right">Selisih</th>
                <th className="p-3 w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((it) => {
                const isDiscrepant = Math.abs(it.selisihBobot) > 0.5;

                return (
                  <tr
                    key={it.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isDiscrepant ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <td className="p-3 text-center font-mono font-bold text-slate-800">
                      {it.kode}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{it.uraian}</div>
                      <div className="text-[10px] text-slate-500">{it.subKategori}</div>
                    </td>
                    <td className="p-3 text-right font-medium">{it.volume}</td>
                    <td className="p-3 text-center text-slate-600">{it.satuan}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(it.totalHarga)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-700">
                      {formatPercent(it.bobotPersen)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      {formatPercent(it.bobotJadwalAsli)}
                    </td>
                    <td
                      className={`p-3 text-right font-mono font-semibold ${
                        isDiscrepant ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {it.selisihBobot > 0 ? `+${it.selisihBobot.toFixed(2)}` : it.selisihBobot.toFixed(2)}%
                    </td>
                    <td className="p-3 text-center">
                      {isDiscrepant ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                          Tertukar
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Cocok
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
