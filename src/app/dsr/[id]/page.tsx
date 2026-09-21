import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDsrById, approveDsr, requestRevisionDsr } from '@/app/actions/dsr';
import { DsrDetailClient } from './DsrDetailClient';

export const dynamic = 'force-dynamic';

export default async function DsrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getDsrById(id);

  if (!report) {
    notFound();
  }

  return <DsrDetailClient report={report} />;
}
