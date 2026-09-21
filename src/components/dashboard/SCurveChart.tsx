'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PeriodChartData {
  mingguKe: number;
  label: string;
  rencanaKumulatif: number;
  realisasiJadwal?: number | null;
  realisasiRab?: number | null;
}

interface SCurveChartProps {
  data: PeriodChartData[];
}

export function SCurveChart({ data }: SCurveChartProps) {
  // Shorter labels for mobile screens: M1, M2, M3...
  const mobileFormattedData = data.map((d) => ({
    ...d,
    shortLabel: `M${d.mingguKe}`,
  }));

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-4 gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900">Kurva S — Rencana vs Realisasi (Dua Basis)</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Rencana Baseline vs Realisasi Basis Jadwal Asli & Nilai RAB
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-blue-600 inline-block"></span>
            <span className="text-slate-600">Rencana</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-600 inline-block"></span>
            <span className="text-slate-600">Jadwal</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-indigo-600 inline-block"></span>
            <span className="text-slate-600">RAB</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 border-t-2 border-dashed border-rose-600 inline-block"></span>
            <span className="text-rose-700 font-bold">13 Nov</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mobileFormattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="shortLabel" stroke="#64748B" fontSize={11} tickMargin={5} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="#64748B"
              fontSize={10}
            />
            <Tooltip
              formatter={(value: any) => [`${Number(value).toFixed(2)}%`]}
              labelFormatter={(label, payload) => {
                const item = payload[0]?.payload;
                return item ? `${item.label}` : String(label);
              }}
              contentStyle={{
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '11px',
                border: 'none',
              }}
            />
            {/* Vertical Line for Contract Deadline (M8) */}
            <ReferenceLine
              x="M8"
              stroke="#E11D48"
              strokeDasharray="4 4"
              label={{
                value: '13 Nov',
                position: 'insideTopRight',
                fill: '#E11D48',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />
            <Line
              type="monotone"
              dataKey="rencanaKumulatif"
              name="Rencana Baseline"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#2563EB' }}
            />
            <Line
              type="monotone"
              dataKey="realisasiJadwal"
              name="Realisasi (Jadwal)"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10B981' }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="realisasiRab"
              name="Realisasi (RAB)"
              stroke="#6366F1"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#6366F1' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 p-2.5 sm:p-3 bg-slate-50 rounded-xl text-[10px] sm:text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border border-slate-100">
        <div>
          <span className="font-bold text-slate-800">Dua Basis:</span> Jadwal untuk AbadiNusa &bull; RAB untuk Klaim Termin.
        </div>
        <div className="text-rose-700 font-bold">
          Minggu 7 (26 Okt - 1 Nov) memikul bobot 30,30%
        </div>
      </div>
    </div>
  );
}
