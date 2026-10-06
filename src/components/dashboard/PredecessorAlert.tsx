import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PredecessorAlertProps {
  items: {
    kode: string;
    uraian: string;
    percentDone: number;
  }[];
}

export function PredecessorAlert({ items }: PredecessorAlertProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-sm font-bold text-amber-900">
              Peringatan Kesiapan Predecessor Menjelang Minggu ke-7
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
              Beban Minggu 7: 30,30%
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-1">
            Pekerjaan minggu ke-7 memiliki beban tertinggi. Item-item persiapan dan sipil dari minggu 1–6 berikut harus dipastikan tuntas agar tidak menghambat pelaksanaan:
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((it) => (
              <div
                key={it.kode}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-100 text-xs"
              >
                <div className="truncate mr-2">
                  <span className="font-bold text-slate-800 mr-1.5">{it.kode}</span>
                  <span className="text-slate-600 truncate">{it.uraian}</span>
                </div>
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <span className="font-bold text-amber-700">{it.percentDone}%</span>
                  <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, it.percentDone)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-3 pt-1 border-t border-amber-200/60">
            <Link
              href="/rab"
              className="inline-flex items-center text-xs font-medium text-amber-800 hover:text-amber-950 hover:underline"
            >
              Rekonsiliasi Bobot
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center text-xs font-bold text-amber-950 hover:underline bg-amber-200/80 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              Lihat Progress Bar Seluruh 65 Item RAB
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
