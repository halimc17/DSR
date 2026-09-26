import Link from 'next/link';
import { getDsrList } from '@/app/actions/dsr';
import { getCurrentUser } from '@/app/actions/auth';
import { DeleteDsrButton } from '@/components/dsr/DeleteDsrButton';
import { 
  PlusCircle, 
  Calendar, 
  FileText, 
  ChevronRight, 
  Users, 
  Camera, 
  CheckCircle2, 
  Clock,
  AlertTriangle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DsrListPage() {
  const [dsrList, currentUser] = await Promise.all([
    getDsrList(),
    getCurrentUser()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Daftar Laporan Harian (DSR)</h1>
          <p className="text-xs text-slate-500">
            Arsip lengkap laporan progres fisik, cuaca, tenaga kerja, dan foto dokumentasi
          </p>
        </div>

        <Link
          href="/dsr/new"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm shadow-sm transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Input DSR Baru / Backdate
        </Link>
      </div>

      {dsrList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Belum ada laporan harian tercatat</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Pekerjaan renovasi Ruang Hemodialisa RS Pertamina Prabumulih dimulai 21 September 2026. Mulai buat laporan sekarang atau input backdate untuk tanggal sebelumnya.
          </p>
          <Link
            href="/dsr/new"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Buat Laporan Pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dsrList.map((dr) => {
            const dateObj = new Date(dr.tanggal);
            const dateStr = dateObj.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const totalWorkers = dr.manpowers.reduce((acc, m) => acc + m.jumlah, 0);

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
                    {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'PM') && (
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
