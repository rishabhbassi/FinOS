// Finance OS - Month View Component
// Week-by-week monthly budget overview

import { motion } from 'motion/react';
import {
  Calendar,
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import type { BudgetMonth } from '@/types/app';
import { formatCurrency, cn } from '@/lib/utils';
import ProgressBar from '@/components/shared/ProgressBar';

interface MonthViewProps {
  month: BudgetMonth | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function MonthView({ month, loading, error, onRetry }: MonthViewProps) {
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
              Failed to load month data
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
          <div className="h-5 w-40 animate-pulse rounded-full bg-[var(--line)]" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3">
                <div className="h-4 w-16 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--line)]" />
              </div>
              {i < 5 && (
                <div className="flex justify-center">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-[var(--line)]" />
                </div>
              )}
              {/* Progress bar skeleton */}
              <div className="h-2 animate-pulse rounded-full bg-[var(--line)]" />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
          <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="h-4 w-28 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!month || !month.weeks || month.weeks.length === 0) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)]">
            <Wallet className="h-7 w-7 text-[var(--sea-ink-soft)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--sea-ink)]">
              No budget data for this month
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Set your monthly plan to see a week-by-week breakdown.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format month label from YYYY-MM format
  const [yearStr, monthStr] = month.month.split('-');
  const monthDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
  const monthLabel = monthDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      className="demo-panel rounded-2xl p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-[var(--lagoon)]" />
        <h3 className="text-sm font-semibold text-[var(--sea-ink)]">
          {monthLabel}
        </h3>
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-center">
          <p className="text-[10px] text-[var(--sea-ink-soft)]">Income</p>
          <p className="mt-0.5 text-xs font-bold tabular-nums text-[var(--lagoon-deep)]">
            {formatCurrency(month.totalIncome)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-center">
          <p className="text-[10px] text-[var(--sea-ink-soft)]">Spent</p>
          <p className="mt-0.5 text-xs font-bold tabular-nums text-[var(--sea-ink)]">
            {formatCurrency(month.totalSpent)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-center">
          <p className="text-[10px] text-[var(--sea-ink-soft)]">Savings</p>
          <p
            className={cn(
              'mt-0.5 text-xs font-bold tabular-nums',
              month.savings >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
            )}
          >
            {formatCurrency(month.savings)}
          </p>
        </div>
      </div>

      {/* Week rows */}
      <div className="space-y-2">
        {month.weeks.map((week, index) => {
          const weekSpentPct =
            week.totalBudget > 0
              ? Math.round((week.totalSpent / week.totalBudget) * 100)
              : 0;

          const progressVariant =
            weekSpentPct > 90
              ? 'danger'
              : weekSpentPct > 70
                ? 'warning'
                : 'success';

          return (
            <div key={week.weekNumber}>
              <motion.div
                className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Week label */}
                <span className="min-w-[52px] text-xs font-semibold text-[var(--sea-ink)]">
                  Week {week.weekNumber}
                </span>

                {/* Budget */}
                <span className="min-w-[72px] text-xs tabular-nums text-[var(--sea-ink-soft)]">
                  {formatCurrency(week.totalBudget)}
                </span>

                {/* Spent */}
                <span className="min-w-[72px] text-xs font-medium tabular-nums text-[var(--sea-ink)]">
                  {formatCurrency(week.totalSpent)}
                </span>

                {/* Surplus */}
                <span
                  className={cn(
                    'min-w-[72px] text-xs font-semibold tabular-nums',
                    week.surplus >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-500 dark:text-red-400'
                  )}
                >
                  {week.surplus >= 0 ? '+' : ''}
                  {formatCurrency(week.surplus)}
                </span>

                {/* Carry to next week */}
                <span className="min-w-[80px] text-right text-xs font-semibold tabular-nums text-[var(--lagoon-deep)]">
                  {formatCurrency(week.carryForward)}
                </span>
              </motion.div>

              {/* Progress bar for this week */}
              <div className="px-1 py-1.5">
                <ProgressBar
                  value={week.totalSpent}
                  max={week.totalBudget || 1}
                  variant={progressVariant}
                  size="sm"
                  showLabel
                />
              </div>

              {/* Arrow between weeks */}
              {index < month.weeks.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--sea-ink-soft)]/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Monthly totals */}
      <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4">
        <span className="text-xs font-bold text-[var(--sea-ink)]">Monthly Total</span>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-[var(--sea-ink-soft)]">Budget</p>
            <p className="text-xs font-bold tabular-nums text-[var(--sea-ink)]">
              {formatCurrency(month.variableBudget)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--sea-ink-soft)]">Spent</p>
            <p className="text-xs font-bold tabular-nums text-[var(--sea-ink)]">
              {formatCurrency(month.totalSpent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--sea-ink-soft)]">Savings Rate</p>
            <p
              className={cn(
                'text-xs font-bold tabular-nums',
                month.savingsRate >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              )}
            >
              {month.savingsRate.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MonthView;
