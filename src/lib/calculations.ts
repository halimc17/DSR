export const PROJECT_CONFIG = {
  contractValue: 712063413,
  startDate: new Date('2026-09-14T00:00:00.000Z'),
  contractDeadline: new Date('2026-11-13T00:00:00.000Z'),
  baselineEndDate: new Date('2026-11-15T00:00:00.000Z'),
  totalWorkdays: 60,
  dailyPenaltyRate: 0.001, // 0.1% per day = Rp 712,063 / day
  maxPenaltyRate: 0.1, // Max 10% = Rp 71,206,341
};

export function calculateDailyPenalty(daysLate: number): number {
  if (daysLate <= 0) return 0;
  const rawPenalty = daysLate * PROJECT_CONFIG.contractValue * PROJECT_CONFIG.dailyPenaltyRate;
  const maxPenalty = PROJECT_CONFIG.contractValue * PROJECT_CONFIG.maxPenaltyRate;
  return Math.min(rawPenalty, maxPenalty);
}

/**
 * Calculates item contribution to total project progress:
 * - Schedule basis: (volume / contractVolume) * bobotJadwalAsli
 * - RAB basis: (volume / contractVolume) * bobotPersen
 */
export function calculateItemContribution(
  volume: number,
  contractVolume: number,
  bobot: number
): number {
  if (contractVolume <= 0) return 0;
  return (volume / contractVolume) * bobot;
}

/**
 * Computes work day number (hari kerja ke-N) from start date (Monday-Saturday or standard workday)
 */
export function getWorkdayNumber(targetDate: Date): number {
  const start = new Date(PROJECT_CONFIG.startDate);
  start.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  if (target < start) return 1;

  let count = 0;
  const cur = new Date(start);
  while (cur <= target) {
    const dayOfWeek = cur.getDay(); // 0 is Sunday
    // Assuming 6-day work week (Monday - Saturday) for construction
    if (dayOfWeek !== 0) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return Math.min(count, PROJECT_CONFIG.totalWorkdays);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(val: number, decimals: number = 2): string {
  return `${val.toFixed(decimals)}%`;
}
