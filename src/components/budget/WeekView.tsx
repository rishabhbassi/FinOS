// FinOS - Week View Component
// Day-by-day budget tracking for the current week

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowRight,
  Pencil,
  Check,
  X,
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
  // Weekly planning state
  const [editMode, setEditMode] = useState(false);
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const [savedBudgets, setSavedBudgets] = useState<Record<string, number>>({});

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

        {/* Column headers skeleton */}
        <div className="mb-2 flex items-center gap-3 px-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-3 w-16 animate-pulse rounded-full bg-[var(--line)]"
            />
          ))}
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
  const weekTotalBudget =
    Object.keys(savedBudgets).length > 0
      ? week.days.reduce(
          (sum, d) => sum + (savedBudgets[d.date] ?? d.baseBudget),
          0,
        )
      : week.totalBudget;
  const weekRemaining = weekTotalBudget - weekTotalSpent;

  function handleEnterEditMode() {
    if (!week || !week.days) return;
    const inputs: Record<string, string> = {};
    week.days.forEach((day) => {
      inputs[day.date] = String(savedBudgets[day.date] ?? day.baseBudget);
    });
    setBudgetInputs(inputs);
    setEditMode(true);
  }

  function handleSaveBudgets() {
    const parsed: Record<string, number> = {};
    for (const [date, val] of Object.entries(budgetInputs)) {
      const num = Number(val);
      if (!isFinite(num) || num < 0) return;
      parsed[date] = Math.round(num);
    }
    setSavedBudgets(parsed);
    setEditMode(false);
  }

  function handleCancelEdit() {
    setEditMode(false);
    setBudgetInputs({});
  }

  return (
    <motion.div
      className="demo-panel rounded-2xl p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header with plan/edit controls */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[var(--lagoon)]" />
          <h3 className="text-sm font-semibold text-[var(--sea-ink)]">
            Week {week.weekNumber} &mdash; {week.startDate} to {week.endDate}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleSaveBudgets}
                className="demo-button inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="demo-button-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEnterEditMode}
              className="demo-button-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <Pencil className="h-3.5 w-3.5" />
              Plan Week
            </button>
          )}
        </div>
      </div>

      {/* Column headers — hidden on mobile */}
      <div className="mb-2 hidden items-center gap-3 px-3 sm:flex">
        <span className="min-w-[44px] text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
          Day
        </span>
        <span className="min-w-[72px] text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
          Budget
        </span>
        <span className="min-w-[72px] text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
          Spent
        </span>
        <span className="min-w-[80px] text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
          Remaining
        </span>
        <span className="min-w-[88px] text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
          Carry Fwd
        </span>
      </div>

      {/* Edit mode banner */}
      {editMode && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-[var(--lagoon)]/30 bg-[var(--lagoon)]/5 px-3 py-2 text-xs text-[var(--lagoon-deep)]">
          <Pencil className="h-3 w-3 shrink-0" />
          Adjust daily budgets below, then save your changes.
        </div>
      )}

      {/* Day rows */}
      <div className="space-y-2">
        {week.days.map((day, index) => {
          const isToday = day.date === todayStr;
          const effectiveBudget = savedBudgets[day.date] ?? day.baseBudget;
          const carryDisplay = day.carryForward - day.baseBudget;
          const isSurplus = carryDisplay >= 0;

          return (
            <div key={day.date}>
              <motion.div
                className={cn(
                  'rounded-xl border p-3 transition-all',
                  isToday
                    ? 'border-[var(--lagoon)]/40 bg-[var(--lagoon)]/5 shadow-[0_0_12px_var(--lagoon)/0.08]'
                    : 'border-[var(--line)]',
                )}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Mobile: card layout */}
                <div className="flex flex-col gap-1 sm:hidden">
                  <div className="flex items-center justify-between">
                    <span className={cn('text-sm font-bold', isToday ? 'text-[var(--lagoon-deep)]' : 'text-[var(--sea-ink)]')}>
                      {day.dayName}
                    </span>
                    {isToday && (
                      <span className="demo-pill rounded-full px-2 py-0.5 text-[10px] font-semibold text-[var(--lagoon-deep)]">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-[var(--sea-ink-soft)]">Budget</span>
                    <span className="font-mono tabular-nums text-right font-medium text-[var(--sea-ink)]">
                      {editMode ? (
                        <input
                          type="number"
                          value={budgetInputs[day.date] ?? String(effectiveBudget)}
                          onChange={(e) =>
                            setBudgetInputs((prev) => ({ ...prev, [day.date]: e.target.value }))
                          }
                          className="w-20 rounded border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-xs font-mono tabular-nums outline-none focus:border-[var(--lagoon)]"
                          min="0"
                        />
                      ) : (
                        formatCurrency(effectiveBudget)
                      )}
                    </span>
                    <span className="text-[var(--sea-ink-soft)]">Spent</span>
                    <span className="font-mono tabular-nums text-right font-medium">{formatCurrency(day.spent)}</span>
                    <span className="text-[var(--sea-ink-soft)]">Remaining</span>
                    <span className={cn('font-mono tabular-nums text-right font-semibold', day.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                      {formatCurrency(day.remaining)}
                    </span>
                    <span className="text-[var(--sea-ink-soft)]">Carry Fwd</span>
                    <span className={cn('font-mono tabular-nums text-right font-semibold', isSurplus ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                      {isSurplus ? '+' : ''}{formatCurrency(carryDisplay)}
                    </span>
                  </div>
                </div>

                {/* Desktop: row layout */}
                <div className="hidden items-center gap-3 sm:flex">
                  {/* Day name */}
                  <span className={cn('min-w-[44px] text-xs font-semibold', isToday ? 'text-[var(--lagoon-deep)]' : 'text-[var(--sea-ink)]')}>
                    {day.dayName}
                  </span>

                  {/* Budget */}
                  {editMode ? (
                    <input
                      type="number"
                      value={budgetInputs[day.date] ?? String(effectiveBudget)}
                      onChange={(e) => setBudgetInputs((prev) => ({ ...prev, [day.date]: e.target.value }))}
                      className="min-w-[72px] rounded border border-[var(--line)] bg-[var(--surface)] px-1.5 py-1 text-xs font-mono tabular-nums outline-none focus:border-[var(--lagoon)] focus:ring-1 focus:ring-[var(--lagoon)]/30"
                      min="0" step="1"
                    />
                  ) : (
                    <span className="min-w-[72px] text-xs font-mono tabular-nums text-[var(--sea-ink-soft)]">{formatCurrency(effectiveBudget)}</span>
                  )}

                  {/* Spent */}
                  <span className="min-w-[72px] text-xs font-medium font-mono tabular-nums text-[var(--sea-ink)]">{formatCurrency(day.spent)}</span>

                  {/* Remaining */}
                  <span className={cn('min-w-[80px] text-right text-xs font-semibold font-mono tabular-nums', day.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                    {formatCurrency(day.remaining)}
                  </span>

                  {/* Carry Forward */}
                  <span className={cn('min-w-[88px] text-xs font-semibold font-mono tabular-nums', isSurplus ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                    {isSurplus ? '+' : ''}{formatCurrency(carryDisplay)}
                  </span>

                  {/* Today indicator */}
                  {isToday && (
                    <span className="demo-pill rounded-full px-2 py-0.5 text-[10px] font-semibold text-[var(--lagoon-deep)]">Today</span>
                  )}
                </div>
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
        <span className="text-xs font-bold text-[var(--sea-ink)]">
          Week Total
        </span>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-[var(--sea-ink-soft)]">Budget</p>
            <p className="text-xs font-bold font-mono tabular-nums text-[var(--sea-ink)]">
              {formatCurrency(weekTotalBudget)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--sea-ink-soft)]">Spent</p>
            <p className="text-xs font-bold font-mono tabular-nums text-[var(--sea-ink)]">
              {formatCurrency(weekTotalSpent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--sea-ink-soft)]">
              Remaining
            </p>
            <p
              className={cn(
                'text-xs font-bold font-mono tabular-nums',
                weekRemaining >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400',
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
