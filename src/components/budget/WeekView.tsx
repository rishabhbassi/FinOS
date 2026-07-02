// Finance OS - Week View Component
// Day-by-day budget tracking for the current week

import { motion } from 'motion/react';
import {
  CalendarDays,
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import type { BudgetWeek } from '@/types/app';
import { formatCurrency, cn, getTodayDateString } from '@/lib/utils';

interface WeekViewProps {
  week: BudgetWeek | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function WeekView({ week, loading, error, onRetry }: WeekViewProps) {
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
              Failed to load week data
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
        {/* Header skeleton */}
        <div className="mb-5 flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded-lg bg-[var(--line)]" />
          <div className="h-5 w-52 animate-pulse rounded-full bg-[var(--line)]" />
        </div>

        {/* Day rows skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3">
                <div className="h-4 w-14 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--line)]" />
              </div>
              {i < 7 && (
                <div className="flex justify-center">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-[var(--line)]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Totals skeleton */}
        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
          <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="h-4 w-28 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!week || !week.days || week.days.length === 0) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)]">
            <Wallet className="h-7 w-7 text-[var(--sea-ink-soft)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--sea-ink)]">
              No budget data for this week
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Start planning to see your daily budget breakdown.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const todayStr = getTodayDateString();
  const weekTotalSpent = week.totalSpent;
  const weekTotalBudget = week.totalBudget;
  const weekRemaining = weekTotalBudget - weekTotalSpent;

  return (
    <motion.div
      className="demo-panel rounded-2xl p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-[var(--lagoon)]" />
        <h3 className="text-sm font-semibold text-[var(--sea-ink)]">
          Week {week.weekNumber} &mdash; {week.startDate} to {week.endDate}
        </h3>
      </div>

      {/* Day rows */}
      <div className="space-y-2">
        {week.days.map((day, index) => {
          const isToday = day.date === todayStr;
          const carryDisplay = day.carryForward - day.baseBudget;
          const isSurplus = carryDisplay >= 0;

          return (
            <div key={day.date}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 transition-all',
                  isToday
                    ? 'border-[var(--lagoon)]/40 bg-[var(--lagoon)]/5 shadow-[0_0_12px_var(--lagoon)/0.08]'
                    : 'border-[var(--line)]'
                )}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Day name */}
                <span
                  className={cn(
                    'min-w-[44px] text-xs font-semibold',
                    isToday ? 'text-[var(--lagoon-deep)]' : 'text-[var(--sea-ink)]'
                  )}
                >
                  {day.dayName}
                </span>

                {/* Budget */}
                <span className="min-w-[72px] text-xs tabular-nums text-[var(--sea-ink-soft)]">
                  {formatCurrency(day.baseBudget)}
                </span>

                {/* Spent */}
                <span className="min-w-[72px] text-xs font-medium tabular-nums text-[var(--sea-ink)]">
                  {formatCurrency(day.spent)}
                </span>

                {/* Carry Forward */}
                <span
                  className={cn(
                    'min-w-[88px] text-xs font-semibold tabular-nums',
                    isSurplus
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-500 dark:text-red-400'
                  )}
                >
                  {isSurplus ? '+' : ''}
                  {formatCurrency(carryDisplay)}
                </span>

                {/* Available */}
                <span className="min-w-[80px] text-right text-xs font-semibold tabular-nums text-[var(--sea-ink)]">
                  {formatCurrency(day.available)}
                </span>

                {/* Today indicator */}
                {isToday && (
                  <span className="demo-pill rounded-full px-2 py-0.5 text-[10px] font-semibold text-[var(--lagoon-deep)]">
                    Today
                  </span>
                )}
              </motion.div>

              {/* Arrow between days */}
              {index < week.days.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--sea-ink-soft)]/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Week totals */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
        <span className="text-xs font-bold text-[var(--sea-ink)]">Week Total</span>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-[var(--sea-ink-soft)]">Budget</p>
            <p className="text-xs font-bold tabular-nums text-[var(--sea-ink)]">
              {formatCurrency(weekTotalBudget)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--sea-ink-soft)]">Spent</p>
            <p className="text-xs font-bold tabular-nums text-[var(--sea-ink)]">
              {formatCurrency(weekTotalSpent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--sea-ink-soft)]">Remaining</p>
            <p
              className={cn(
                'text-xs font-bold tabular-nums',
                weekRemaining >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              )}
            >
              {formatCurrency(weekRemaining)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default WeekView;
