import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'motion/react';
import { TrendingUp, AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';

interface SavingsTrendChartProps {
  data: { month: string; savings: number; target: number }[];
  loading?: boolean;
  error?: string | null;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const savingsEntry = payload.find((p) => p.name === 'Savings');
  const targetEntry = payload.find((p) => p.name === 'Target');
  const isBelowTarget =
    savingsEntry && targetEntry && savingsEntry.value < targetEntry.value;

  return (
    <div className="island-shell rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 shadow-lg backdrop-blur-md">
      <p className="mb-2 text-xs font-semibold text-[var(--sea-ink)]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-[var(--sea-ink-soft)]">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-semibold tabular-nums text-[var(--sea-ink)]">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
      {isBelowTarget && (
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Below target by {formatCurrency(targetEntry!.value - savingsEntry!.value)}</span>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="demo-panel">
      <div className="mb-4 h-4 w-32 rounded bg-[color-mix(in_oklab,var(--line)_50%,transparent)]" />
      <div className="flex h-[300px] items-end gap-2 px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="fin-skeleton h-28 w-full rounded-t-md" />
            <div className="fin-skeleton mt-1 h-3 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-panel">
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Savings Trend</h3>
      <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <TrendingUp className="h-10 w-10 text-[var(--sea-ink-soft)]" />
        <p className="text-sm text-[var(--sea-ink-soft)]">No savings data available</p>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="demo-panel">
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Savings Trend</h3>
      <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-medium text-red-500">{error}</p>
      </div>
    </div>
  );
}

export default function SavingsTrendChart({
  data,
  loading = false,
  error = null,
}: SavingsTrendChartProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <motion.div
      className="demo-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Savings Trend</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 4 }}
          >
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--lagoon)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--lagoon)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--line)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
              axisLine={{ stroke: 'var(--line)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => {
                if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
                return `₹${v}`;
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--line)', strokeDasharray: '3 3' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              type="monotone"
              dataKey="savings"
              name="Savings"
              stroke="var(--lagoon)"
              strokeWidth={2.5}
              fill="url(#savingsGradient)"
              dot={{ r: 3, fill: 'var(--lagoon)', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: 'var(--lagoon)', strokeWidth: 2, stroke: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
