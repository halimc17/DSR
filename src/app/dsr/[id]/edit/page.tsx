import { notFound, redirect } from 'next/navigation';
import { getDsrById, getRabItemsWithProgress } from '@/app/actions/dsr';
import { getCurrentUser } from '@/app/actions/auth';
import { DsrForm } from '@/components/dsr/DsrForm';
import type { DsrFormData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Laporan DSR — RS Pertamina Prabumulih',
  description: 'Pengeditan laporan harian lapangan DSR.',
};

export default async function EditDsrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?redirect=/dsr/${id}/edit`);
  }

  const [report, rabItems] = await Promise.all([
    getDsrById(id),
    getRabItemsWithProgress(),
  ]);

  if (!report) {
    notFound();
  }

  // If approved and not admin, locked from editing
  if (report.status === 'APPROVED' && currentUser.role !== 'ADMIN') {
    redirect(`/dsr/${id}`);
  }

  const initialData: DsrFormData = {
    id: report.id,
    tanggal: report.tanggal.toISOString().split('T')[0],
    hariKerjaKe: report.hariKerjaKe,
    cuacaPagi: report.cuacaPagi,
    cuacaSiang: report.cuacaSiang,
    cuacaSore: report.cuacaSore,
    jamMulai: report.jamMulai,
    jamSelesai: report.jamSelesai,
    jamTerhentiCuaca: report.jamTerhentiCuaca,
    status: report.status as any,
    isBackdated: report.isBackdated,
    catatanUmum: report.catatanUmum || '',
    rencanaBesok: report.rencanaBesok || '',
    catatanK3: report.catatanK3 || '',
    adaInsidenK3: report.adaInsidenK3,
    progressEntries: report.progressEntries.map((e) => ({
      rabItemId: e.rabItemId,
      volumeHariIni: e.volumeHariIni,
      lokasiKerja: e.lokasiKerja || '',
      isPekerjaanTambah: e.isPekerjaanTambah,
      catatan: e.catatan || '',
    })),
    manpowers: report.manpowers.map((m) => ({
      kategori: m.kategori,
      jumlah: m.jumlah,
    })),
    equipments: report.equipments.map((eq) => ({
      namaAlat: eq.namaAlat,
      jumlah: eq.jumlah,
      status: eq.status as any,
    })),
    materialLogs: report.materialLogs.map((mat) => ({
      namaMaterial: mat.namaMaterial,
      jumlah: mat.jumlah,
      satuan: mat.satuan,
      noSuratJalan: mat.noSuratJalan || '',
      pemasok: mat.pemasok || '',
      fotoSuratJalan: mat.fotoSuratJalan || '',
    })),
    issues: report.issues.map((iss) => ({
      kategori: iss.kategori,
      deskripsi: iss.deskripsi,
      dampakJam: iss.dampakJam,
      tindakan: iss.tindakan || '',
      status: iss.status as any,
      pic: iss.pic || '',
    })),
    photos: report.photos.map((p) => ({
      rabItemId: p.rabItemId || undefined,
      url: p.url,
      thumbUrl: p.thumbUrl || undefined,
      kategori: p.kategori as any,
      keterangan: p.keterangan || '',
      lat: p.lat || undefined,
      lng: p.lng || undefined,
    })),
  };

  return (
    <div>
      <DsrForm rabItems={rabItems} initialData={initialData} />
    </div>
  );
}
