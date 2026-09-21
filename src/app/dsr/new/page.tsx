import { getRabItemsWithProgress } from '@/app/actions/dsr';
import { DsrForm } from '@/components/dsr/DsrForm';

export const dynamic = 'force-dynamic';

export default async function NewDsrPage() {
  const rabItems = await getRabItemsWithProgress();

  return (
    <div>
      <DsrForm rabItems={rabItems} />
    </div>
  );
}
