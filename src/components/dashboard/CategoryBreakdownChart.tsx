import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryBreakdownProps {
  data: { name: string; amount: number; color: string; percentage: number }[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function Skeleton() {
  return (
    <div className="demo-panel animate-pulse">
      <div className="mb-4 h-4 w-36 rounded bg-[var(--line)]" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-[var(--line)]" />
            <div className="h-4 flex-1 rounded-full bg-[var(--line)]" />
            <div className="h-4 w-16 rounded bg-[var(--line)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-panel flex flex-col items-center gap-3 py-10 text-center">
      <PieChart className="h-10 w-10 text-[var(--sea-ink-soft)] opacity-50" />
      <p className="demo-muted m-0 text-sm font-medium">No category data yet.</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="demo-panel flex flex-col items-center gap-3 py-8 text-center">
      <AlertCircle className="h-10 w-10 text-red-500/70" />
      <p className="m-0 text-sm font-medium text-red-600 dark:text-red-400">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="demo-button mt-1">
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { name: string; color: string } }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs shadow-lg backdrop-blur-md">
      <span className="font-semibold text-[var(--sea-ink)]">{item.payload.name}</span>
      <span className="ml-2 text-[var(--sea-ink-soft)]">{formatCurrency(item.value)}</span>
    </div>
  );
}

export default function CategoryBreakdownChart({
  data,
  loading = false,
  error = null,
  onRetry,
}: CategoryBreakdownProps) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!data || data.length === 0) return <EmptyState />;

  // Merge small categories into "Other" if more than 5 items
  let chartData = data;
  if (data.length > 5) {
    const top5 = data.slice(0, 5);
    const other = data.slice(5);
    const otherTotal = other.reduce((sum, cat) => sum + cat.amount, 0);
    const otherPercentage = other.reduce((sum, cat) => sum + cat.percentage, 0);
    chartData = [
      ...top5,
      {
        name: 'Other',
        amount: otherTotal,
        color: '#6b7280',
        percentage: otherPercentage,
      },
    ];
  }

  // Sort by amount descending (already sorted from engine, but ensure)
  chartData = [...chartData].sort((a, b) => b.amount - a.amount);

  return (
    <motion.div
      className="demo-panel rise-in"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    >
      <span className="island-kicker mb-4 block">Category Breakdown</span>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 48, bottom: 0, left: 0 }}
            barSize={20}
            barGap={4}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
              axisLine={false}
              tickLine={false}
              hide
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: 'var(--sea-ink)' }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'color-mix(in oklab, var(--lagoon), transparent 92%)' }} />
            <Bar
              dataKey="amount"
              radius={[0, 6, 6, 0]}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with percentages */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        {chartData.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm"
              style={{ backgroundColor: cat.color }}
            />
            <span className="flex-1 truncate text-[var(--sea-ink-soft)]">{cat.name}</span>
            <span className="font-semibold text-[var(--sea-ink)]">{cat.percentage}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
