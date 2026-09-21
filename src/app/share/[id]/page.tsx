import { notFound } from 'next/navigation';
import { getDsrById } from '@/app/actions/dsr';
import { DsrPrintView } from '@/components/dsr/DsrPrintView';
import { Building2, ShieldCheck, Printer } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PublicShareDsrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getDsrById(id);

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Public Banner */}
      <div className="no-print bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Tautan Publik Resmi (Read-Only)
            </span>
            <h1 className="text-sm font-extrabold text-white">
              Daily Site Report &bull; Proyek Renovasi RS Pertamina Prabumulih
            </h1>
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') window.print();
          }}
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-colors"
        >
          <Printer className="w-3.5 h-3.5 mr-1" />
          Cetak Dokumen
        </button>
      </div>

      <DsrPrintView report={report} />
    </div>
  );
}
