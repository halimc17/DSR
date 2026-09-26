import { redirect } from 'next/navigation';
import { getRabItemsWithProgress } from '@/app/actions/dsr';
import { getCurrentUser } from '@/app/actions/auth';
import { DsrForm } from '@/components/dsr/DsrForm';

export const dynamic = 'force-dynamic';

export default async function NewDsrPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login?redirect=/dsr/new');
  }

  const rabItems = await getRabItemsWithProgress();

  return (
    <div>
      <DsrForm rabItems={rabItems} />
    </div>
  );
}
