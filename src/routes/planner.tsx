// Finance OS - Planner Page Route
import { useState, useMemo, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { IncomeSection } from '@/components/planner/IncomeSection';
import { FixedExpensesSection } from '@/components/planner/FixedExpensesSection';
import { VariableBudgetSection } from '@/components/planner/VariableBudgetSection';
import { PlannerSummary as PlannerSummaryCard } from '@/components/planner/PlannerSummary';
import { useBudget } from '@/hooks/use-budget';
import { cn } from '@/lib/utils';
import type {
  PlannerIncomeEntry,
  PlannerExpenseEntry,
  PlannerVariableEntry,
  PlannerSummary,
} from '@/types/app';

export const Route = createFileRoute('/planner')({
  component: PlannerPage,
});

// ── Default mock data ──────────────────────────────────────────────────

function getDefaultIncome(): PlannerIncomeEntry[] {
  return [
    { categoryId: 'inc-salary', categoryName: 'Salary', planned: 59000, actual: 59000 },
    { categoryId: 'inc-bonus', categoryName: 'Bonus', planned: 0, actual: 0 },
    { categoryId: 'inc-freelance', categoryName: 'Freelancing', planned: 5000, actual: 3000 },
    { categoryId: 'inc-interest', categoryName: 'Interest', planned: 500, actual: 500 },
  ];
}

function getDefaultFixedExpenses(): PlannerExpenseEntry[] {
  return [
    { categoryId: 'exp-rent', categoryName: 'Rent', planned: 21000, actual: 21000, isRecurring: true },
    { categoryId: 'exp-electricity', categoryName: 'Electricity', planned: 1200, actual: 1200, isRecurring: true },
    { categoryId: 'exp-internet', categoryName: 'Internet', planned: 1000, actual: 1000, isRecurring: true },
    { categoryId: 'exp-sip', categoryName: 'SIP', planned: 7000, actual: 7000, isRecurring: true },
  ];
}

function getDefaultVariableCategories(): PlannerVariableEntry[] {
  return [
    { categoryId: 'var-food', categoryName: 'Food', dailyLimit: 300, monthlyBudget: 9000, spent: 4200, remaining: 4800 },
    { categoryId: 'var-fuel', categoryName: 'Fuel', dailyLimit: 200, monthlyBudget: 6000, spent: 2800, remaining: 3200 },
    { categoryId: 'var-shopping', categoryName: 'Shopping', dailyLimit: 200, monthlyBudget: 6000, spent: 1500, remaining: 4500 },
    { categoryId: 'var-entertainment', categoryName: 'Entertainment', dailyLimit: 150, monthlyBudget: 4500, spent: 1200, remaining: 3300 },
  ];
}

// ── Page Component ─────────────────────────────────────────────────────

function PlannerPage() {
  const { loading: budgetLoading, error: budgetError, refresh: refetchBudget } = useBudget();

  // State for all planner entries
  const [incomeEntries, setIncomeEntries] = useState<PlannerIncomeEntry[]>(getDefaultIncome);
  const [fixedExpenses, setFixedExpenses] = useState<PlannerExpenseEntry[]>(getDefaultFixedExpenses);
  const [variableCategories, setVariableCategories] = useState<PlannerVariableEntry[]>(getDefaultVariableCategories);
  const [isQuarterEnd, setIsQuarterEnd] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Compute the summary from current entries
  const summary: PlannerSummary = useMemo(() => {
    const adjustedIncome = isQuarterEnd
      ? incomeEntries.map((e) =>
          e.categoryName === 'Salary'
            ? { ...e, planned: 59000 }
            : e
        )
      : incomeEntries.map((e) =>
          e.categoryName === 'Salary'
            ? { ...e, planned: 49000 }
            : e
        );

    const totalIncome = adjustedIncome.reduce((sum, e) => sum + e.planned, 0);
    const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.planned, 0);

    const totalVariable = variableCategories.reduce(
      (sum, c) => sum + c.monthlyBudget,
      0
    );

    const projectedSavings = totalIncome - totalFixed - totalVariable;
    const savingsRate = totalIncome > 0 ? (projectedSavings / totalIncome) * 100 : 0;

    const daysInMonth = 30;

    return {
      totalIncome,
      totalFixed,
      totalVariable,
      projectedSavings,
      savingsRate: Math.round(savingsRate * 10) / 10,
      dailyBudget: Math.round(totalVariable / daysInMonth),
      weeklyBudget: Math.round((totalVariable / daysInMonth) * 7),
      remainingBudget: Math.round(
        totalVariable -
          variableCategories.reduce((sum, c) => sum + c.spent, 0)
      ),
    };
  }, [incomeEntries, fixedExpenses, variableCategories, isQuarterEnd]);

  function handleScenarioChange(quarterEnd: boolean) {
    setIsQuarterEnd(quarterEnd);
  }

  // Page-level error state
  if (budgetError) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--sea-ink)]">
                Something went wrong
              </h1>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                We couldn't load your planner data. Please try again.
              </p>
              <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                {budgetError}
              </p>
            </div>
            <button
              onClick={refetchBudget}
              className="demo-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Page-level loading state
  if (budgetLoading || pageLoading) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14">
        <div className="mx-auto max-w-5xl">
          {/* Title skeleton */}
          <div className="mb-6">
            <div className="mb-2 h-8 w-40 animate-pulse rounded-full bg-[var(--line)]" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-[var(--line)]" />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left column skeleton */}
            <div className="space-y-6 lg:col-span-3">
              <div className="demo-panel h-64 animate-pulse rounded-2xl bg-[var(--line)]/50" />
              <div className="demo-panel h-72 animate-pulse rounded-2xl bg-[var(--line)]/50" />
              <div className="demo-panel h-80 animate-pulse rounded-2xl bg-[var(--line)]/50" />
            </div>
            {/* Right column skeleton */}
            <div className="lg:col-span-2">
              <div className="demo-panel h-[600px] animate-pulse rounded-2xl bg-[var(--line)]/50" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[var(--lagoon)]" />
            <h1 className="text-xl font-bold text-[var(--sea-ink)]">
              Monthly Planner
            </h1>
          </div>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            Plan your income, track fixed expenses, and set variable budget limits.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left column — form sections */}
          <div className="space-y-6 lg:col-span-3">
            <motion.div
              className="rise-in"
              style={{ animationDelay: '50ms' }}
            >
              <IncomeSection
                entries={incomeEntries}
                onUpdate={setIncomeEntries}
              />
            </motion.div>

            <motion.div
              className="rise-in"
              style={{ animationDelay: '120ms' }}
            >
              <FixedExpensesSection
                entries={fixedExpenses}
                onUpdate={setFixedExpenses}
              />
            </motion.div>

            <motion.div
              className="rise-in"
              style={{ animationDelay: '190ms' }}
            >
              <VariableBudgetSection
                categories={variableCategories}
                onUpdate={setVariableCategories}
              />
            </motion.div>
          </div>

          {/* Right column — summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <motion.div
                className="rise-in"
                style={{ animationDelay: '260ms' }}
              >
                <PlannerSummaryCard
                  summary={summary}
                  onScenarioChange={handleScenarioChange}
                />
              </motion.div>

              {/* Scenario info banner */}
              <motion.div
                className={cn(
                  'mt-4 rounded-xl border px-4 py-3 transition-all',
                  isQuarterEnd
                    ? 'border-[var(--lagoon)]/30 bg-[var(--lagoon)]/5'
                    : 'border-[var(--line)] bg-[var(--surface)]'
                )}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <p className="text-xs font-medium text-[var(--sea-ink)]">
                  {isQuarterEnd
                    ? 'Quarter-End Scenario'
                    : 'Normal Month Scenario'}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--sea-ink-soft)]">
                  {isQuarterEnd
                    ? 'Salary adjusted to ₹59,000 with bonus income.'
                    : 'Salary set to ₹49,000 with typical income.'}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PlannerPage;
