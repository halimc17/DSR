'use client';

import React from 'react';
import { formatPercent } from '@/lib/calculations';

interface DsrPrintViewProps {
  report: any;
}

export function DsrPrintView({ report }: DsrPrintViewProps) {
  const dateFormatted = new Date(report.tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalWorkers = report.manpowers.reduce((acc: number, m: any) => acc + m.jumlah, 0);

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto border border-slate-300 print:border-none print:p-0 font-sans text-xs">
      {/* Official Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-slate-900">
            PT MITRA BANGUN MAHAKARYA
          </h1>
          <p className="text-[10px] text-slate-600">
            Menara Bidakara 2 Annex Building (Bina Sentra) Lantai 4, Jl. Gatot Subroto Kav. 73, Tebet, Jakarta Selatan 12870
          </p>
          <p className="text-[10px] text-slate-600">
            Email: info@mbm.co.id &bull; Telp/CP: 082113708280
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider rounded">
            DAILY SITE REPORT
          </span>
          <p className="text-[10px] font-bold text-slate-700 mt-1">
            LAPORAN HARIAN PROYEK
          </p>
        </div>
      </div>

      {/* Project & Report Info Table */}
      <table className="w-full border-collapse border border-slate-400 mb-4 text-[11px]">
        <tbody>
          <tr>
            <td className="border border-slate-400 p-1.5 bg-slate-100 font-bold w-1/4">Nama Proyek</td>
            <td className="border border-slate-400 p-1.5 w-1/4 font-semibold">Renovasi Ruang Hemodialisa</td>
            <td className="border border-slate-400 p-1.5 bg-slate-100 font-bold w-1/4">Hari / Tanggal</td>
            <td className="border border-slate-400 p-1.5 w-1/4 font-semibold">{dateFormatted}</td>
          </tr>
          <tr>
            <td className="border border-slate-400 p-1.5 bg-slate-100 font-bold">Lokasi</td>
            <td className="border border-slate-400 p-1.5">RS Umum Pertamina Prabumulih</td>
            <td className="border border-slate-400 p-1.5 bg-slate-100 font-bold">Hari Kerja Ke-</td>
            <td className="border border-slate-400 p-1.5 font-bold">{report.hariKerjaKe} dari 60 Hari</td>
          </tr>
          <tr>
            <td className="border border-slate-400 p-1.5 bg-slate-100 font-bold">Pemberi Kerja</td>
            <td className="border border-slate-400 p-1.5 font-semibold">PT Abadinusa Usahasemesta</td>
            <td className="border border-slate-400 p-1.5 bg-slate-100 font-bold">Jam Kerja</td>
            <td className="border border-slate-400 p-1.5">{report.jamMulai} - {report.jamSelesai} WIB</td>
          </tr>
          <tr>
            <td className="border border-slate-400 p-1.5 bg-slate-100 font-bold">Kontraktor</td>
            <td className="border border-slate-400 p-1.5 font-semibold">PT Mitra Bangun Mahakarya</td>
            <td className="border border-slate-400 p-1.5 bg-slate-100 font-bold text-rose-800">Jam Berhenti (Cuaca)</td>
            <td className="border border-slate-400 p-1.5 font-bold text-rose-800">{report.jamTerhentiCuaca} Jam</td>
          </tr>
          <tr>
            <td className="border border-slate-400 p-1.5 bg-slate-100 font-bold">Kondisi Cuaca</td>
            <td colSpan={3} className="border border-slate-400 p-1.5">
              Pagi: <b>{report.cuacaPagi}</b> &bull; Siang: <b>{report.cuacaSiang}</b> &bull; Sore: <b>{report.cuacaSore}</b>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 1. Manpower Table */}
      <div className="mb-4">
        <h3 className="font-bold text-xs uppercase tracking-wide bg-slate-800 text-white px-2 py-1 mb-1">
          I. Tenaga Kerja Lapangan (Total: {totalWorkers} Orang)
        </h3>
        <div className="grid grid-cols-4 gap-1 border border-slate-400 p-2 bg-slate-50 text-[10px]">
          {report.manpowers.map((m: any) => (
            <div key={m.id} className="flex justify-between border-b border-slate-200 py-0.5 px-1">
              <span>{m.kategori}:</span>
              <span className="font-bold">{m.jumlah} org</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Progress Table */}
      <div className="mb-4">
        <h3 className="font-bold text-xs uppercase tracking-wide bg-slate-800 text-white px-2 py-1 mb-1">
          II. Progres Pekerjaan Fisik (Terhubung Item RAB)
        </h3>
        <table className="w-full border-collapse border border-slate-400 text-[10px]">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold text-center">
              <th className="border border-slate-400 p-1 w-10">No.</th>
              <th className="border border-slate-400 p-1 w-14">Kode</th>
              <th className="border border-slate-400 p-1 text-left">Uraian Pekerjaan</th>
              <th className="border border-slate-400 p-1 w-16">Vol Kontrak</th>
              <th className="border border-slate-400 p-1 w-10">Sat</th>
              <th className="border border-slate-400 p-1 w-16">Vol Hari Ini</th>
              <th className="border border-slate-400 p-1 w-20">Lokasi</th>
            </tr>
          </thead>
          <tbody>
            {report.progressEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-slate-400 p-2 text-center text-slate-500 italic">
                  Tidak ada progres pekerjaan terpasang hari ini
                </td>
              </tr>
            ) : (
              report.progressEntries.map((e: any, idx: number) => (
                <tr key={e.id}>
                  <td className="border border-slate-400 p-1 text-center">{idx + 1}</td>
                  <td className="border border-slate-400 p-1 font-bold text-center">{e.rabItem?.kode}</td>
                  <td className="border border-slate-400 p-1">{e.rabItem?.uraian}</td>
                  <td className="border border-slate-400 p-1 text-right">{e.rabItem?.volume}</td>
                  <td className="border border-slate-400 p-1 text-center">{e.rabItem?.satuan}</td>
                  <td className="border border-slate-400 p-1 text-right font-bold bg-slate-50">{e.volumeHariIni}</td>
                  <td className="border border-slate-400 p-1 text-center">{e.lokasiKerja || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Material & Equipment */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <h3 className="font-bold text-[11px] uppercase tracking-wide bg-slate-800 text-white px-2 py-1 mb-1">
            III. Material Masuk di Lokasi
          </h3>
          <table className="w-full border-collapse border border-slate-400 text-[10px]">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-400 p-1 text-left">Nama Material</th>
                <th className="border border-slate-400 p-1 w-12 text-center">Qty</th>
                <th className="border border-slate-400 p-1 text-left">No. Surat Jalan</th>
              </tr>
            </thead>
            <tbody>
              {report.materialLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="border border-slate-400 p-1 text-center text-slate-500 italic">
                    Nihil
                  </td>
                </tr>
              ) : (
                report.materialLogs.map((m: any) => (
                  <tr key={m.id}>
                    <td className="border border-slate-400 p-1">{m.namaMaterial}</td>
                    <td className="border border-slate-400 p-1 text-center font-semibold">{m.jumlah} {m.satuan}</td>
                    <td className="border border-slate-400 p-1">{m.noSuratJalan || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-bold text-[11px] uppercase tracking-wide bg-slate-800 text-white px-2 py-1 mb-1">
            IV. Peralatan di Lokasi
          </h3>
          <table className="w-full border-collapse border border-slate-400 text-[10px]">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-400 p-1 text-left">Nama Alat</th>
                <th className="border border-slate-400 p-1 w-12 text-center">Jumlah</th>
                <th className="border border-slate-400 p-1 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.equipments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="border border-slate-400 p-1 text-center text-slate-500 italic">
                    Nihil
                  </td>
                </tr>
              ) : (
                report.equipments.map((eq: any) => (
                  <tr key={eq.id}>
                    <td className="border border-slate-400 p-1">{eq.namaAlat}</td>
                    <td className="border border-slate-400 p-1 text-center">{eq.jumlah} unit</td>
                    <td className="border border-slate-400 p-1 text-center font-bold">{eq.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Kendala & Masalah (Pasal 9) */}
      <div className="mb-4">
        <h3 className="font-bold text-xs uppercase tracking-wide bg-slate-800 text-white px-2 py-1 mb-1">
          V. Kendala Lapangan & Mitigasi (Data Penunjang Pasal 9)
        </h3>
        <table className="w-full border-collapse border border-slate-400 text-[10px]">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-slate-400 p-1 w-24 text-left">Kategori</th>
              <th className="border border-slate-400 p-1 text-left">Deskripsi Kendala</th>
              <th className="border border-slate-400 p-1 w-16 text-center">Dampak</th>
              <th className="border border-slate-400 p-1 text-left">Tindakan Mitigasi</th>
              <th className="border border-slate-400 p-1 w-14 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {report.issues.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-slate-400 p-1.5 text-center text-slate-500 italic">
                  Tidak ada kendala operasional lapangan hari ini
                </td>
              </tr>
            ) : (
              report.issues.map((iss: any) => (
                <tr key={iss.id}>
                  <td className="border border-slate-400 p-1 font-bold">{iss.kategori}</td>
                  <td className="border border-slate-400 p-1">{iss.deskripsi}</td>
                  <td className="border border-slate-400 p-1 text-center">{iss.dampakJam} Jam</td>
                  <td className="border border-slate-400 p-1">{iss.tindakan || '-'}</td>
                  <td className="border border-slate-400 p-1 text-center font-bold">{iss.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Catatan K3 & Rencana Besok */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border border-slate-400 p-2 text-[10px]">
          <span className="font-bold block mb-1">VI. Catatan K3 (CSMS Pertamina):</span>
          <p>{report.catatanK3 || 'Penerapan standar APD CSMS Pertamina berjalan baik. Nihil insiden.'}</p>
        </div>
        <div className="border border-slate-400 p-2 text-[10px]">
          <span className="font-bold block mb-1">VII. Rencana Kerja Besok:</span>
          <p>{report.rencanaBesok || 'Melanjutkan pekerjaan sesuai time schedule.'}</p>
        </div>
      </div>

      {/* Signature Block */}
      <div className="grid grid-cols-3 gap-4 text-center text-[10px] pt-4 border-t border-slate-300">
        <div>
          <p className="font-bold text-slate-700">Pemberi Kerja / Pengawas</p>
          <p className="text-slate-500">PT Abadinusa / RS Pertamina</p>
          <div className="h-16"></div>
          <p className="font-bold border-t border-slate-400 mx-6 pt-1">( ........................................ )</p>
        </div>

        <div>
          <p className="font-bold text-slate-700">Diperiksa & Disetujui</p>
          <p className="text-slate-500">Project Manager MBM</p>
          <div className="h-16 flex items-center justify-center">
            {report.status === 'APPROVED' && (
              <span className="text-emerald-700 font-bold border border-emerald-600 px-2 py-0.5 rounded uppercase text-[9px]">
                APPROVED (DISETUJUI)
              </span>
            )}
          </div>
          <p className="font-bold border-t border-slate-400 mx-6 pt-1">Kingking Firdaus ST</p>
        </div>

        <div>
          <p className="font-bold text-slate-700">Dibuat Oleh</p>
          <p className="text-slate-500">Site Supervisor Lapangan</p>
          <div className="h-16"></div>
          <p className="font-bold border-t border-slate-400 mx-6 pt-1">( Pengawas Lapangan )</p>
        </div>
      </div>

      {/* Photo Attachments (Page 2 on print) */}
      {report.photos.length > 0 && (
        <div className="mt-8 pt-8 border-t-2 border-slate-900 break-before-page">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-900">
            Lampiran Dokumentasi Foto Lapangan Ber-Watermark (Pasal 8 PKS)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {report.photos.map((ph: any) => (
              <div key={ph.id} className="border border-slate-300 rounded overflow-hidden">
                <img src={ph.url} alt="Dokumentasi" className="w-full h-56 object-cover" />
                <div className="p-2 bg-slate-50 text-[9px]">
                  <span className="font-bold block text-slate-800">{ph.kategori}: {ph.keterangan || 'Dokumentasi pekerjaan'}</span>
                  {ph.rabItem && (
                    <span className="text-slate-500 block">Item: {ph.rabItem.kode} - {ph.rabItem.uraian}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
