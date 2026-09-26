import { notFound } from 'next/navigation';
import { getDsrById } from '@/app/actions/dsr';
import { getCurrentUser } from '@/app/actions/auth';
import { DsrDetailClient } from './DsrDetailClient';

export const dynamic = 'force-dynamic';

export default async function DsrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [report, currentUser] = await Promise.all([
    getDsrById(id),
    getCurrentUser(),
  ]);

  if (!report) {
    notFound();
  }

  return <DsrDetailClient report={report} currentUser={currentUser} />;
}
