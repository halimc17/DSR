import { getTerminClaimData } from '@/app/actions/dsr';
import { TerminClient } from './TerminClient';

export const dynamic = 'force-dynamic';

export default async function TerminPage() {
  const data = await getTerminClaimData();
  return <TerminClient data={data} />;
}
