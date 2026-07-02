import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'motion/react';
import { PieChart, AlertCircle } from 'lucide-react';

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface CategoryBreakdownReportProps {
  data: CategoryData[];
  loading?: boolean;
  error?: string | null;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: CategoryData }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  return (
    <div className="island-shell rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 shadow-lg backdrop-blur-md">
      <p className="mb-1 text-xs font-semibold text-[var(--sea-ink)]">{label}</p>
      <div className="flex items-center justify-between gap-6 text-xs">
        <span className="text-[var(--sea-ink-soft)]">Amount</span>
        <span className="font-semibold font-mono tabular-nums text-[var(--sea-ink)]">
          {formatCurrency(entry.value)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-6 text-xs">
        <span className="text-[var(--sea-ink-soft)]">% of Total</span>
        <span className="font-semibold font-mono tabular-nums text-[var(--sea-ink)]">
          {entry.payload.percentage}%
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="demo-panel">
      <div className="mb-4 h-4 w-44 rounded bg-[color-mix(in_oklab,var(--line)_50%,transparent)]" />
      <div className="space-y-3 px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="fin-skeleton h-4 w-28 rounded" />
            <div className="fin-skeleton h-4 flex-1 rounded" />
            <div className="fin-skeleton h-4 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-panel">
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Category Breakdown</h3>
      <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <PieChart className="h-10 w-10 text-[var(--sea-ink-soft)]" />
        <p className="text-sm text-[var(--sea-ink-soft)]">No category data available</p>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="demo-panel">
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Category Breakdown</h3>
      <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-medium text-red-500">{error}</p>
      </div>
    </div>
  );
}

export default function CategoryBreakdownReport({
  data,
  loading = false,
  error = null,
}: CategoryBreakdownReportProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  const displayData = data.slice(0, 10);

  return (
    <motion.div
      className="demo-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Category Breakdown</h3>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayData}
            layout="vertical"
            margin={{ top: 4, right: 48, left: 4, bottom: 4 }}
            barCategoryGap={6}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--line)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => {
                if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
                return `₹${v}`;
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--sea-ink)' }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'color-mix(in oklab, var(--line) 30%, transparent)' }}
            />
            <Bar
              dataKey="amount"
              name="Amount"
              radius={[0, 4, 4, 0]}
              maxBarSize={18}
              label={{
                position: 'right',
                fontSize: 10,
                fill: 'var(--sea-ink-soft)',
              }}
            >
              {displayData.map((entry, index) => (
                <Cell key={index} fill={entry.color || '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
