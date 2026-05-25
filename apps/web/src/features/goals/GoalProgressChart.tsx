import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { GoalContribution } from '@fluxo/shared';

interface GoalProgressChartProps {
  contributions: GoalContribution[];
  targetAmount: string;
  color?: string | null;
}

interface ChartPoint {
  date: string;
  label: string;
  cumulative: number;
}

function buildCumulativeData(contributions: GoalContribution[]): ChartPoint[] {
  // Contributions arrive newest-first; sort oldest-first for the timeline
  const sorted = [...contributions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  let running = 0;
  return sorted.map((c) => {
    running += Number.parseFloat(c.amount);
    return {
      date: c.date,
      label: new Date(c.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      }),
      cumulative: Number(running.toFixed(2)),
    };
  });
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-gray-600">
        Saved: <span className="font-semibold">€{payload[0]!.value.toFixed(2)}</span>
      </p>
    </div>
  );
}

export function GoalProgressChart({ contributions, targetAmount, color }: GoalProgressChartProps) {
  const data = buildCumulativeData(contributions);
  const target = Number.parseFloat(targetAmount);
  const chartColor = color ?? '#2563eb';

  // Need at least 2 points for a meaningful line
  if (data.length < 2) {
    return (
      <p className="py-4 text-center text-xs text-gray-400">
        Add a few contributions to see your progress chart
      </p>
    );
  }

  return (
    <div className="mt-3 h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id={`grad-${chartColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={[0, target]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={45}
            tickFormatter={(value: number) => `€${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={target}
            stroke="#10b981"
            strokeDasharray="4 4"
            label={{
              value: 'Target',
              position: 'insideTopRight',
              fontSize: 10,
              fill: '#10b981',
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={chartColor}
            strokeWidth={2}
            fill={`url(#grad-${chartColor})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
