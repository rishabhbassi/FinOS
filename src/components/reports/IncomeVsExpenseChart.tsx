import {
  ComposedChart,
  Bar,
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
import { TrendingUp, AlertCircle } from 'lucide-react';

interface IncomeVsExpenseChartProps {
  data: { month: string; income: number; expenses: number; savings: number }[];
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
          <span className="font-semibold font-mono tabular-nums text-[var(--sea-ink)]">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="demo-panel">
      <div className="mb-4 h-4 w-36 rounded bg-[color-mix(in_oklab,var(--line)_50%,transparent)]" />
      <div className="flex h-[300px] items-end gap-2 px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="fin-skeleton h-24 w-full rounded-t-md" />
            <div className="fin-skeleton h-16 w-full rounded-t-md" />
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
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Income vs Expenses</h3>
      <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <TrendingUp className="h-10 w-10 text-[var(--sea-ink-soft)]" />
        <p className="text-sm text-[var(--sea-ink-soft)]">No data available for this period</p>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="demo-panel">
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Income vs Expenses</h3>
      <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-medium text-red-500">{error}</p>
      </div>
    </div>
  );
}

export default function IncomeVsExpenseChart({
  data,
  loading = false,
  error = null,
}: IncomeVsExpenseChartProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <motion.div
      className="demo-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Income vs Expenses</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 4 }}
            barGap={4}
          >
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
              cursor={{ fill: 'color-mix(in oklab, var(--line) 30%, transparent)' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#4fb8b2"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Line
              type="monotone"
              dataKey="savings"
              name="Savings"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
