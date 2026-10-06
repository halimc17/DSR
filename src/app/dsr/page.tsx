import { getDsrList } from '@/app/actions/dsr';
import { getCurrentUser } from '@/app/actions/auth';
import { DsrListClient } from '@/components/dsr/DsrListClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Daftar Laporan Harian (DSR) — RS Pertamina Prabumulih',
  description: 'Arsip lengkap laporan progres fisik harian, cuaca, tenaga kerja, dan dokumentasi foto.',
};

export default async function DsrListPage() {
  const [dsrList, currentUser] = await Promise.all([
    getDsrList(),
    getCurrentUser()
  ]);

  return <DsrListClient dsrList={dsrList} currentUser={currentUser} />;
}
