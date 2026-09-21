'use client';

import { useState } from 'react';
import { Copy, Check, MessageSquare, X } from 'lucide-react';

interface WhatsAppShareModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppShareModal({ report, isOpen, onClose }: WhatsAppShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const dateStr = new Date(report.tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalWorkers = report.manpowers.reduce((acc: number, m: any) => acc + m.jumlah, 0);

  // Generate WhatsApp formatted text
  let waText = `*DAILY SITE REPORT (DSR)*\n`;
  waText += `*Proyek:* Renovasi Ruang Hemodialisa RS Pertamina Prabumulih\n`;
  waText += `*Kontraktor:* PT Mitra Bangun Mahakarya\n`;
  waText += `*Hari / Tanggal:* ${dateStr}\n`;
  waText += `*Hari Kerja ke:* ${report.hariKerjaKe} dari 60 Hari\n`;
  waText += `*Cuaca:* Pagi (${report.cuacaPagi}) | Siang (${report.cuacaSiang}) | Sore (${report.cuacaSore})\n`;
  if (report.jamTerhentiCuaca > 0) {
    waText += `*Jam Terhenti Cuaca:* ${report.jamTerhentiCuaca} Jam (Force Majeure)\n`;
  }
  waText += `\n*1. TENAGA KERJA (${totalWorkers} Orang):*\n`;
  report.manpowers
    .filter((m: any) => m.jumlah > 0)
    .forEach((m: any) => {
      waText += `• ${m.kategori}: ${m.jumlah} org\n`;
    });

  waText += `\n*2. PEKERJAAN HARI INI:*\n`;
  if (report.progressEntries.length === 0) {
    waText += `• Belum ada progres fisik terpasang\n`;
  } else {
    report.progressEntries.forEach((e: any) => {
      waText += `• [${e.rabItem?.kode}] ${e.rabItem?.uraian}: ${e.volumeHariIni} ${e.rabItem?.satuan} (${e.lokasiKerja || '-'})\n`;
    });
  }

  if (report.issues.length > 0) {
    waText += `\n*3. KENDALA LAPANGAN:*\n`;
    report.issues.forEach((iss: any) => {
      waText += `• [${iss.kategori}] ${iss.deskripsi} (${iss.dampakJam} Jam) - Status: ${iss.status}\n`;
    });
  }

  if (report.rencanaBesok) {
    waText += `\n*4. RENCANA BESOK:*\n${report.rencanaBesok}\n`;
  }

  waText += `\n_Laporan resmi & foto ber-watermark dapat diakses melalui aplikasi DSR._`;

  const handleCopy = () => {
    navigator.clipboard.writeText(waText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(waText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Format Ringkasan WhatsApp</h3>
              <p className="text-xs text-slate-500">Siap dikirim ke grup koordinasi proyek</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 max-h-72 overflow-y-auto whitespace-pre-wrap">
          {waText}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? 'Tersalin!' : 'Salin Teks'}
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Buka WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
