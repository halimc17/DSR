import Link from 'next/link';
import { getDashboardData } from '@/app/actions/dsr';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { SCurveChart } from '@/components/dashboard/SCurveChart';
import { PredecessorAlert } from '@/components/dashboard/PredecessorAlert';
import { getWorkdayNumber, formatPercent } from '@/lib/calculations';
import { 
  PlusCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  FileText,
  Building2,
  Users
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();
  const workdayNumber = getWorkdayNumber(new Date());

  // Prepare chart data for 9 periods
  const chartData = data.project.periods.map((p) => {
    // Labels matching period format: M1 (15-20 Sep), M2 (21-27 Sep)
    const startStr = new Date(p.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const endStr = new Date(p.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const label = `M${p.mingguKe} (${startStr}-${endStr})`;

    // If current period or past, show actual data
    let realisasiJadwal: number | null = null;
    let realisasiRab: number | null = null;
    if (p.mingguKe <= (data.currentPeriod?.mingguKe || 1)) {
      realisasiJadwal = data.totalActualProgressSchedule;
      realisasiRab = data.totalActualProgressRab;
    }

    return {
      mingguKe: p.mingguKe,
      label,
      rencanaKumulatif: Number(p.bobotKumulatifRencana.toFixed(2)),
      realisasiJadwal,
      realisasiRab,
    };
  });

  const periodDates = data.currentPeriod
    ? `${new Date(data.currentPeriod.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – ${new Date(data.currentPeriod.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : '15 – 20 Sep 2026';

  return (
    <div className="space-y-6">
      {/* Top Banner: Project Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>PT Mitra Bangun Mahakarya</span>
            <span>&bull;</span>
            <span>Klien: PT Abadinusa Usahasemesta</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Renovasi Ruang Hemodialisa &bull; RS Umum Pertamina Prabumulih
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Jl. Kesehatan No. 100, Komperta Prabumulih &bull; Nilai Kontrak: Rp 712.063.413,- &bull; 60 Hari Kerja
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dsr/new"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Input DSR Hari Ini / Backdate
          </Link>
          <Link
            href="/dsr"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-all"
          >
            <FileText className="w-4 h-4 mr-2" />
            Daftar DSR ({data.recentDsr.length})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards
        currentWeek={data.currentPeriod?.mingguKe || 1}
        periodDates={periodDates}
        actualProgressSchedule={data.totalActualProgressSchedule}
        actualProgressRab={data.totalActualProgressRab}
        plannedProgress={data.plannedCumulative}
        deviation={data.deviation}
        daysBehind={data.daysBehind}
        estimatedPenalty={data.estimatedPenalty}
        workdayNumber={workdayNumber}
        totalWorkdays={data.project.hariKerja}
      />

      {/* Predecessor readiness alert */}
      <PredecessorAlert items={data.predecessorWarningItems} />

      {/* S-Curve Chart */}
      <SCurveChart data={chartData} />

      {/* Bottom Section: Recent DSRs & Open Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Daily Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Laporan DSR Terbaru</h3>
              <p className="text-xs text-slate-500">Daftar laporan harian yang telah diinput lapangan</p>
            </div>
            <Link
              href="/dsr"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {data.recentDsr.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Belum ada Laporan DSR</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Pekerjaan fisik dimulai Senin, 21 September 2026. Anda dapat menginput laporan hari ini atau entri backdate untuk tanggal sebelumnya.
              </p>
              <Link
                href="/dsr/new"
                className="inline-flex items-center px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Mulai Input DSR Pertama
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentDsr.map((dr) => {
                const dateFormatted = new Date(dr.tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <div key={dr.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50 rounded-lg px-2 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/dsr/${dr.id}`} className="text-sm font-bold text-slate-900 hover:text-blue-700">
                            {dateFormatted}
                          </Link>
                          {dr.isBackdated && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              Backdate
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Hari ke-{dr.hariKerjaKe} &bull; Cuaca: {dr.cuacaPagi}/{dr.cuacaSiang}/{dr.cuacaSore} &bull; {dr.progressEntries.length} item dikerjakan &bull; {dr.photos.length} foto
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
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
                      <Link
                        href={`/dsr/${dr.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Open Issues & Obstacles */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Kendala & Isu Lapangan</h3>
              <p className="text-xs text-slate-500">Bukti penunjang force majeure / perpanjangan waktu</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {data.openIssues.length} Aktif
            </span>
          </div>

          {data.openIssues.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Tidak ada kendala aktif</p>
              <p className="text-xs text-slate-500 mt-1">
                Semua kendala operasional lapangan telah tertangani atau belum dilaporkan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.openIssues.map((iss) => (
                <div key={iss.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                      {iss.kategori}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {iss.dampakJam > 0 ? `Dampak: ${iss.dampakJam} Jam` : 'Tidak berdampak jam'}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">{iss.deskripsi}</p>
                  {iss.tindakan && (
                    <p className="text-slate-500 mt-1 italic">
                      <span className="font-semibold text-slate-600">Tindakan:</span> {iss.tindakan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
