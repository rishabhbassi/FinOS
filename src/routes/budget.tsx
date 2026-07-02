// Finance OS - Budget Page Route
// Full budget page with weekly/monthly views and category utilization

import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { Layers, CalendarDays, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { cn, formatCurrency, toDateString } from '@/lib/utils';
import { calculateMonthlyBudget, calculateBudgetUtilization } from '@/lib/budget-engine';
import { useBudget } from '@/hooks/use-budget';
import WeekView from '@/components/budget/WeekView';
import MonthView from '@/components/budget/MonthView';
import CategoryBudgetBar from '@/components/budget/CategoryBudgetBar';
import type { Transaction, BudgetRule } from '@/types/database';

export const Route = createFileRoute('/budget')({
  component: BudgetPage,
});

// ── Page Component ──────────────────────────────────────────────

function BudgetPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const { loading, error, refresh } = useBudget();

  // Compute budget data synchronously using the engine.
  // The hook's loading/error/refresh handle async state; we pass those
  // down to child components which render their own loading/error/empty states.
  const budgetData = useMemo(() => {
    const today = new Date();
    const income = 0;
    const fixedExpenses = 0;
    const rules: BudgetRule[] = [];
    const transactions: Transaction[] = [];

    const monthData = calculateMonthlyBudget(income, fixedExpenses, transactions, rules, today);
    const categoryData = calculateBudgetUtilization(rules, transactions, today);

    // Find current week
    const todayStr = toDateString(today);
    const currentWeek =
      monthData.weeks.find(
        (w) => todayStr >= w.startDate && todayStr <= w.endDate,
      ) ?? monthData.weeks[0] ?? null;

    return { monthData, currentWeek, categoryData };
  }, []);

  return (
    <motion.main
      className="page-wrap px-4 pb-8 pt-14"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
    >
      {/* ── Summary stat tiles ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={<PiggyBank className="h-4 w-4" />}
          label="Monthly Savings"
          value={budgetData.monthData.savings}
        />
        <StatTile
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total Income"
          value={budgetData.monthData.totalIncome}
        />
        <StatTile
          icon={<TrendingDown className="h-4 w-4" />}
          label="Fixed Expenses"
          value={budgetData.monthData.fixedExpenses}
        />
        <StatTile
          icon={<CalendarDays className="h-4 w-4" />}
          label="Daily Budget"
          value={budgetData.monthData.dailyBudget}
        />
      </div>

      {/* ── Tabs (segmented control) ── */}
      <div className="mb-5 flex items-center gap-1.5 rounded-xl bg-[color-mix(in_oklab,var(--lagoon),transparent_88%)] p-1 w-fit">
        <button
          onClick={() => setActiveTab('weekly')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
            activeTab === 'weekly'
              ? 'bg-[var(--surface-strong)] text-[var(--sea-ink)] shadow-sm'
              : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
          )}
        >
          <CalendarDays className="h-4 w-4" />
          Weekly
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
            activeTab === 'monthly'
              ? 'bg-[var(--surface-strong)] text-[var(--sea-ink)] shadow-sm'
              : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
          )}
        >
          <Layers className="h-4 w-4" />
          Monthly
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-5 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ── Refreshing indicator ── */}
      {loading && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-[color-mix(in_oklab,var(--lagoon),transparent_90%)] px-5 py-3 text-sm text-[var(--sea-ink-soft)]">
          <svg
            className="h-4 w-4 animate-spin text-[var(--lagoon)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Refreshing budget data&hellip;
        </div>
      )}

      {/* ── Active view ── */}
      <div className="mb-5">
        {activeTab === 'weekly' ? (
          <WeekView
            week={budgetData.currentWeek}
            loading={loading}
            error={error}
            onRetry={refresh}
          />
        ) : (
          <MonthView
            month={budgetData.monthData}
            loading={loading}
            error={error}
            onRetry={refresh}
          />
        )}
      </div>

      {/* ── Category budget bars ── */}
      <CategoryBudgetBar
        data={budgetData.categoryData}
        loading={loading}
        error={error}
        onRetry={refresh}
      />
    </motion.main>
  );
}

// ── Stat Tile ───────────────────────────────────────────────────

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const formatted = formatCurrency(value);

  return (
    <div className="island-shell rounded-2xl px-4 py-3.5">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
        {icon}
        {label}
      </div>
      <div className="font-mono tabular-nums text-lg font-bold text-[var(--sea-ink)] sm:text-xl">
        {formatted}
      </div>
    </div>
  );
}

export default BudgetPage;
