'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DsrPrintView } from '@/components/dsr/DsrPrintView';
import { WhatsAppShareModal } from '@/components/dsr/WhatsAppShareModal';
import { DeleteDsrButton } from '@/components/dsr/DeleteDsrButton';
import { approveDsr, requestRevisionDsr } from '@/app/actions/dsr';
import {
  Printer,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CloudSun,
  Users,
  HardHat,
  Camera,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

interface DsrDetailClientProps {
  report: any;
  currentUser?: {
    id: string;
    nama: string;
    email: string;
    role: string;
  } | null;
}

export function DsrDetailClient({ report, currentUser }: DsrDetailClientProps) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRevisionInputOpen, setIsRevisionInputOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  const canApprove = currentUser && (currentUser.role === 'PM' || currentUser.role === 'ADMIN');
  const canDelete = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'PM');

  const handleApprove = async () => {
    if (!confirm('Apakah Anda yakin menyetujui laporan DSR ini? Laporan yang disetujui akan terkunci dan masuk ke perhitungan klaim termin.')) {
      return;
    }
    setIsApproving(true);
    try {
      await approveDsr(report.id);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Gagal menyetujui laporan');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      alert('Mohon masukkan catatan revisi');
      return;
    }
    setIsApproving(true);
    try {
      await requestRevisionDsr(report.id, revisionNotes);
      setIsRevisionInputOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Gagal mengirim permintaan revisi');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/dsr"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-slate-900">
                Laporan DSR &bull; Hari ke-{report.hariKerjaKe}
              </h1>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  report.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : report.status === 'SUBMITTED'
                    ? 'bg-blue-100 text-blue-800'
                    : report.status === 'REVISI'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {report.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {new Date(report.tanggal).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp share */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Share WhatsApp
          </button>

          {/* Print PDF */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak / Simpan PDF
          </button>

          {/* Delete DSR (Admin & PM only) */}
          {canDelete && (
            <DeleteDsrButton
              id={report.id}
              reportTitle={`Laporan DSR Hari ke-${report.hariKerjaKe}`}
              redirectTo="/dsr"
              variant="button"
            />
          )}

          {/* PM Approval buttons */}
          {report.status === 'SUBMITTED' && canApprove && (
            <>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                <FileCheck className="w-4 h-4 mr-1.5" />
                {isApproving ? 'Memproses...' : 'Setujui Laporan (PM)'}
              </button>
              <button
                onClick={() => setIsRevisionInputOpen(!isRevisionInputOpen)}
                className="inline-flex items-center px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200"
              >
                Minta Revisi
              </button>
            </>
          )}
        </div>
      </div>

      {/* Revision notes input if opened */}
      {isRevisionInputOpen && (
        <div className="no-print bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-2">
          <label className="block text-xs font-bold text-rose-900">Catatan Revisi untuk Pengawas Lapangan</label>
          <textarea
            rows={2}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="Contoh: Mohon lengkapi foto sebelum dan sesudah pembongkaran dinding..."
            className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-xs"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsRevisionInputOpen(false)}
              className="px-3 py-1 text-xs text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              onClick={handleRequestRevision}
              className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Kirim Catatan Revisi
            </button>
          </div>
        </div>
      )}

      {/* Official Print View (also serves as preview on desktop) */}
      <DsrPrintView report={report} />

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        report={report}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
