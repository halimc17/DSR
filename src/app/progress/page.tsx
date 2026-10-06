import { getRabProgressPageData } from '@/app/actions/dsr';
import { ProgressClient } from './ProgressClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Progres Fisik Item RAB — RS Pertamina Prabumulih',
  description: 'Pemantauan persentase penyelesaian fisik dan volume terpasang 65 item pekerjaan RAB.',
};

export default async function ProgressPage() {
  const data = await getRabProgressPageData();
  return <ProgressClient data={data} />;
}
