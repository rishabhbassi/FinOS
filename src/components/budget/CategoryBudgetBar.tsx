// Finance OS - Category Budget Bar Component
// Per-category budget utilization with horizontal progress bars

import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  RefreshCw,
  Wallet,
  Tag,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface CategoryBudgetData {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}

interface CategoryBudgetBarProps {
  data: CategoryBudgetData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function getProgressColor(percentage: number): string {
  if (percentage > 90) return 'bg-red-500 dark:bg-red-400';
  if (percentage > 70) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-emerald-500 dark:bg-emerald-400';
}

function getProgressTrackColor(percentage: number): string {
  if (percentage > 90) return 'bg-red-100 dark:bg-red-900/30';
  if (percentage > 70) return 'bg-amber-100 dark:bg-amber-900/30';
  return 'bg-emerald-100 dark:bg-emerald-900/30';
}

function getProgressLabelColor(percentage: number): string {
  if (percentage > 90) return 'text-red-600 dark:text-red-400';
  if (percentage > 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

export function CategoryBudgetBar({
  data,
  loading,
  error,
  onRetry,
}: CategoryBudgetBarProps) {
  // Sorted by percentage descending
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.percentage - a.percentage);
  }, [data]);

  // Error state
  if (error) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--sea-ink)]">
              Failed to load category data
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{error}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="demo-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded-lg bg-[var(--line)]" />
          <div className="h-5 w-36 animate-pulse rounded-full bg-[var(--line)]" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-24 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-3.5 w-40 animate-pulse rounded-full bg-[var(--line)]" />
              </div>
              <div className="h-2.5 animate-pulse rounded-full bg-[var(--line)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)]">
            <Tag className="h-7 w-7 text-[var(--sea-ink-soft)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--sea-ink)]">
              No categories tracked
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Set up budget categories to track spending by category.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="demo-panel rounded-2xl p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-[var(--lagoon)]" />
        <h3 className="text-sm font-semibold text-[var(--sea-ink)]">
          Budget Utilization
        </h3>
      </div>

      {/* Column headers */}
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
          Category
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Spent / Budget
          </span>
          <span className="min-w-[40px] text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Used
          </span>
        </div>
      </div>

      {/* Category Rows */}
      <div className="space-y-4">
        {sortedData.map((item, index) => {
          const safePct = Math.min(Math.max(item.percentage, 0), 100);

          return (
            <motion.div
              key={item.category}
              className="space-y-1.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.04,
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Category label row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--sea-ink)]">
                  {item.category}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono tabular-nums text-[var(--sea-ink-soft)]">
                    {formatCurrency(item.spent)}
                    <span className="mx-0.5 text-[var(--kicker)]">/</span>
                    {formatCurrency(item.budget)}
                  </span>
                  <span
                    className={cn(
                      'min-w-[40px] text-right text-xs font-bold font-mono tabular-nums',
                      getProgressLabelColor(item.percentage)
                    )}
                  >
                    {safePct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className={cn(
                  'h-2.5 overflow-hidden rounded-full',
                  getProgressTrackColor(item.percentage)
                )}
                role="progressbar"
                aria-valuenow={item.spent}
                aria-valuemin={0}
                aria-valuemax={item.budget}
                aria-label={`${item.category}: ${safePct}% utilized`}
              >
                <motion.div
                  className={cn('h-full rounded-full', getProgressColor(item.percentage))}
                  initial={{ width: 0 }}
                  animate={{ width: `${safePct}%` }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default CategoryBudgetBar;
