// Finance OS - Variable Budget Section
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import type { PlannerVariableEntry } from '@/types/app';
import { formatCurrency, cn } from '@/lib/utils';
import ProgressBar from '@/components/shared/ProgressBar';

interface VariableBudgetSectionProps {
  categories: PlannerVariableEntry[];
  onUpdate: (categories: PlannerVariableEntry[]) => void;
}

const DEFAULT_DAILY_LIMITS: { name: string; daily: number }[] = [
  { name: 'Food', daily: 300 },
  { name: 'Fuel', daily: 200 },
  { name: 'Shopping', daily: 200 },
  { name: 'Entertainment', daily: 150 },
];

export function VariableBudgetSection({ categories, onUpdate }: VariableBudgetSectionProps) {
  const [localCategories, setLocalCategories] = useState<PlannerVariableEntry[]>(categories);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalMonthlyBudget = useMemo(
    () => localCategories.reduce((sum, c) => sum + c.monthlyBudget, 0),
    [localCategories]
  );

  const totalSpent = useMemo(
    () => localCategories.reduce((sum, c) => sum + c.spent, 0),
    [localCategories]
  );

  function handleDailyLimitChange(categoryId: string, value: string) {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      const updated = localCategories.map((c) =>
        c.categoryId === categoryId
          ? { ...c, dailyLimit: parsed, monthlyBudget: parsed * 30 }
          : c
      );
      setLocalCategories(updated);
      onUpdate(updated);
    }
  }

  function getProgressVariant(
    percentage: number
  ): 'success' | 'warning' | 'danger' {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  }

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const defaults: PlannerVariableEntry[] = DEFAULT_DAILY_LIMITS.map((d, i) => ({
        categoryId: `var-${i}`,
        categoryName: d.name,
        dailyLimit: d.daily,
        monthlyBudget: d.daily * 30,
        spent: Math.round(d.daily * 30 * (Math.random() * 0.5 + 0.25)),
        remaining: 0,
      }));
      const withRemaining = defaults.map((c) => ({
        ...c,
        remaining: c.monthlyBudget - c.spent,
      }));
      setLocalCategories(withRemaining);
      onUpdate(withRemaining);
      setIsLoading(false);
    }, 600);
  }

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
              Failed to load variable budget
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="demo-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="mb-4 h-5 w-32 animate-pulse rounded-full bg-[var(--line)]" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--line)] p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="h-4 w-16 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--line)]" />
              </div>
              <div className="h-2.5 w-full animate-pulse rounded-full bg-[var(--line)]" />
              <div className="mt-2 flex justify-between">
                <div className="h-3 w-20 animate-pulse rounded-full bg-[var(--line)]" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-[var(--line)]" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
          <div className="h-4 w-28 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="h-6 w-28 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
      </div>
    );
  }

  // Empty state
  if (localCategories.length === 0) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)]">
            <Wallet className="h-7 w-7 text-[var(--sea-ink-soft)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--sea-ink)]">
              No variable budget categories yet
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Set daily limits for food, fuel, shopping, and other variable expenses.
            </p>
          </div>
          <button
            onClick={handleRetry}
            className="demo-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Add Default Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="demo-panel rounded-2xl p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--sea-ink)]">Variable Budget</h3>
        <span className="text-xs text-[var(--sea-ink-soft)]">Daily Limits</span>
      </div>

      <div className="space-y-3">
        {localCategories.map((category, index) => {
          const spentPct =
            category.monthlyBudget > 0
              ? Math.min((category.spent / category.monthlyBudget) * 100, 100)
              : 0;
          const variant = getProgressVariant(spentPct);
          const remaining = category.monthlyBudget - category.spent;

          return (
            <motion.div
              key={category.categoryId}
              className="rounded-xl border border-[var(--line)] p-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--sea-ink)]">
                  {category.categoryName}
                </span>
                <div className="relative w-20">
                  <label className="sr-only" htmlFor={`daily-${category.categoryId}`}>
                    Daily limit for {category.categoryName}
                  </label>
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--sea-ink-soft)]">
                    {'₹'}
                  </span>
                  <input
                    id={`daily-${category.categoryId}`}
                    type="number"
                    min={0}
                    value={category.dailyLimit || ''}
                    onChange={(e) =>
                      handleDailyLimitChange(category.categoryId, e.target.value)
                    }
                    className="demo-input w-full rounded-lg py-1 pl-5 pr-2 text-[11px] font-semibold tabular-nums"
                    placeholder="0"
                  />
                </div>
              </div>

              <ProgressBar
                value={category.spent}
                max={category.monthlyBudget}
                variant={variant}
                size="sm"
                showLabel
              />

              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="tabular-nums text-[var(--sea-ink-soft)]">
                  Budget: {formatCurrency(category.monthlyBudget)}
                </span>
                <span className="tabular-nums text-[var(--sea-ink-soft)]">
                  Spent: {formatCurrency(category.spent)}
                </span>
                <span
                  className={cn(
                    'tabular-nums font-semibold',
                    remaining < 0
                      ? 'text-red-500'
                      : remaining < category.monthlyBudget * 0.1
                        ? 'text-amber-500'
                        : 'text-[var(--lagoon-deep)]'
                  )}
                >
                  {remaining >= 0 ? 'Left: ' : 'Over: '}
                  {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-[var(--line)] pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--sea-ink)]">
            Total Variable Budget
          </span>
          <span className="text-sm font-bold text-[var(--sea-ink)] tabular-nums">
            {formatCurrency(totalMonthlyBudget)}
          </span>
        </div>
        {totalSpent > 0 && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] text-[var(--sea-ink-soft)]">
              Total Spent
            </span>
            <span className="text-[11px] font-medium text-[var(--sea-ink-soft)] tabular-nums">
              {formatCurrency(totalSpent)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default VariableBudgetSection;
