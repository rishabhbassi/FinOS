import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/utils';
import ProgressBar from '@/components/shared/ProgressBar';
import { AlertCircle, Wallet } from 'lucide-react';

interface BudgetUtilizationData {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}

interface BudgetUtilizationReportProps {
  data: BudgetUtilizationData[];
  loading?: boolean;
  error?: string | null;
}

function getProgressVariant(percentage: number): 'success' | 'warning' | 'danger' {
  if (percentage <= 70) return 'success';
  if (percentage <= 90) return 'warning';
  return 'danger';
}

function getStatusIndicator(percentage: number) {
  if (percentage <= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (percentage <= 90) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function LoadingSkeleton() {
  return (
    <div className="demo-panel">
      <div className="mb-4 h-4 w-40 rounded bg-[color-mix(in_oklab,var(--line)_50%,transparent)]" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="fin-skeleton h-3.5 w-24 rounded" />
              <div className="flex gap-4">
                <div className="fin-skeleton h-3.5 w-16 rounded" />
                <div className="fin-skeleton h-3.5 w-16 rounded" />
                <div className="fin-skeleton h-3.5 w-10 rounded" />
              </div>
            </div>
            <div className="fin-skeleton h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-panel">
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Budget Utilization</h3>
      <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <Wallet className="h-10 w-10 text-[var(--sea-ink-soft)]" />
        <p className="text-sm text-[var(--sea-ink-soft)]">No budget utilization data</p>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="demo-panel">
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Budget Utilization</h3>
      <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-medium text-red-500">{error}</p>
      </div>
    </div>
  );
}

export default function BudgetUtilizationReport({
  data,
  loading = false,
  error = null,
}: BudgetUtilizationReportProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <motion.div
      className="demo-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Budget Utilization</h3>
      <div className="space-y-4">
        {/* Header Row */}
        <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 px-1 text-xs font-semibold text-[var(--sea-ink-soft)] md:grid">
          <span>Category</span>
          <span className="w-24 text-right">Budget</span>
          <span className="w-24 text-right">Spent</span>
          <span className="w-14 text-right">Used</span>
        </div>

        {sortedData.map((item, index) => {
          const variant = getProgressVariant(item.percentage);
          return (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="truncate text-sm font-medium text-[var(--sea-ink)]">
                  {item.category}
                </span>
                <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span className="hidden text-[var(--sea-ink-soft)] md:inline-block w-20 text-right">
                    {formatCurrency(item.budget)}
                  </span>
                  <span className="hidden text-[var(--sea-ink-soft)] md:inline-block w-20 text-right">
                    {formatCurrency(item.spent)}
                  </span>
                  <span className={`w-12 text-right font-semibold ${getStatusIndicator(item.percentage)}`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <ProgressBar
                value={item.spent}
                max={item.budget}
                variant={variant}
                size="sm"
                showLabel={false}
              />
              {/* Mobile row: show budget/spent amounts below bar */}
              <div className="flex items-center justify-between gap-4 px-1 md:hidden">
                <span className="text-xs text-[var(--sea-ink-soft)]">
                  Budget: {formatCurrency(item.budget)}
                </span>
                <span className="text-xs text-[var(--sea-ink-soft)]">
                  Spent: {formatCurrency(item.spent)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
