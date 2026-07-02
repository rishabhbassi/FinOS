import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { BarChart3, RefreshCw, AlertCircle as AlertCircleIcon } from 'lucide-react';
import type { Transaction } from '@/types/database';

import ReportFilters, {
  type ReportFiltersState,
} from '@/components/reports/ReportFilters';
import IncomeVsExpenseChart from '@/components/reports/IncomeVsExpenseChart';
import CategoryBreakdownReport from '@/components/reports/CategoryBreakdownReport';
import SavingsTrendChart from '@/components/reports/SavingsTrendChart';
import BudgetUtilizationReport from '@/components/reports/BudgetUtilizationReport';
import TopExpensesTable from '@/components/reports/TopExpensesTable';

export const Route = createFileRoute('/reports')({ component: ReportsPage });

// ─── Demo Mock Data ───────────────────────────────────────────────────────────

const MONTHLY_TREND = [
  { month: 'Jan', income: 59000, expenses: 32000, savings: 27000 },
  { month: 'Feb', income: 59000, expenses: 35800, savings: 23200 },
  { month: 'Mar', income: 59000, expenses: 41000, savings: 18000 },
  { month: 'Apr', income: 59000, expenses: 38900, savings: 20100 },
  { month: 'May', income: 64500, expenses: 45200, savings: 19300 },
  { month: 'Jun', income: 59000, expenses: 47800, savings: 11200 },
];

const CATEGORY_BREAKDOWN = [
  { name: 'Rent', amount: 15000, color: '#4fb8b2', percentage: 28 },
  { name: 'Food', amount: 8500, color: '#f59e0b', percentage: 16 },
  { name: 'Shopping', amount: 7200, color: '#8b5cf6', percentage: 14 },
  { name: 'Entertainment', amount: 5400, color: '#ec4899', percentage: 10 },
  { name: 'Fuel', amount: 4800, color: '#6366f1', percentage: 9 },
  { name: 'Travel', amount: 3600, color: '#06b6d4', percentage: 7 },
  { name: 'Electricity', amount: 3200, color: '#14b8a6', percentage: 6 },
  { name: 'Medical', amount: 2500, color: '#ef4444', percentage: 5 },
  { name: 'Internet', amount: 1800, color: '#f97316', percentage: 3 },
  { name: 'Education', amount: 1200, color: '#84cc16', percentage: 2 },
];

const SAVINGS_TREND = [
  { month: 'Jan', savings: 27000, target: 5000 },
  { month: 'Feb', savings: 23200, target: 5000 },
  { month: 'Mar', savings: 18000, target: 5000 },
  { month: 'Apr', savings: 20100, target: 5000 },
  { month: 'May', savings: 19300, target: 5000 },
  { month: 'Jun', savings: 11200, target: 5000 },
];

const BUDGET_UTILIZATION = [
  { category: 'Shopping', budget: 6000, spent: 7200, percentage: 120 },
  { category: 'Entertainment', budget: 6000, spent: 5400, percentage: 90 },
  { category: 'Food', budget: 10000, spent: 8500, percentage: 85 },
  { category: 'Electricity', budget: 4000, spent: 3200, percentage: 80 },
  { category: 'Internet', budget: 2400, spent: 1800, percentage: 75 },
  { category: 'Fuel', budget: 8000, spent: 4800, percentage: 60 },
  { category: 'Medical', budget: 5000, spent: 2500, percentage: 50 },
  { category: 'Travel', budget: 8000, spent: 3600, percentage: 45 },
  { category: 'Education', budget: 3000, spent: 1200, percentage: 40 },
  { category: 'Rent', budget: 15000, spent: 15000, percentage: 100 },
];

const CATEGORY_ID_MAP: Record<string, string> = {
  Food: 'cat-food',
  Groceries: 'cat-groceries',
  Fuel: 'cat-fuel',
  Rent: 'cat-rent',
  Electricity: 'cat-electricity',
  Internet: 'cat-internet',
  Shopping: 'cat-shopping',
  Entertainment: 'cat-entertainment',
  Medical: 'cat-medical',
  Travel: 'cat-travel',
  Education: 'cat-education',
  Subscription: 'cat-subscription',
  Bills: 'cat-bills',
  Insurance: 'cat-insurance',
  Misc: 'cat-misc',
};

function generateTopExpenses(): Transaction[] {
  const descriptions: { category: string; desc: string; amount: number }[] = [
    { category: 'Rent', desc: 'Monthly apartment rent - March', amount: 15000 },
    { category: 'Rent', desc: 'Monthly apartment rent - April', amount: 15000 },
    { category: 'Rent', desc: 'Monthly apartment rent - May', amount: 15000 },
    { category: 'Shopping', desc: 'Weekend mall shopping - clothing', amount: 5200 },
    { category: 'Shopping', desc: 'Online electronics purchase', amount: 4800 },
    { category: 'Shopping', desc: 'Home decor items', amount: 3200 },
    { category: 'Shopping', desc: 'New running shoes', amount: 2800 },
    { category: 'Entertainment', desc: 'Concert tickets - April', amount: 4200 },
    { category: 'Entertainment', desc: 'Movie night with friends', amount: 3500 },
    { category: 'Food', desc: 'Grocery run - Week 1', amount: 2800 },
    { category: 'Food', desc: 'Grocery run - Week 2', amount: 2600 },
    { category: 'Food', desc: 'Restaurant dinner - Italian', amount: 1800 },
    { category: 'Food', desc: 'Weekend brunch', amount: 1200 },
    { category: 'Food', desc: 'Grocery run - Week 3', amount: 2400 },
    { category: 'Fuel', desc: 'Petrol refill - City driving', amount: 2400 },
    { category: 'Fuel', desc: 'Petrol refill - Highway trip', amount: 3600 },
    { category: 'Travel', desc: 'Weekend getaway - hotel booking', amount: 4500 },
    { category: 'Travel', desc: 'Flight booking - domestic', amount: 3800 },
    { category: 'Medical', desc: 'Doctor consultation & medicines', amount: 2500 },
    { category: 'Electricity', desc: 'Monthly electricity bill', amount: 3200 },
    { category: 'Internet', desc: 'Broadband monthly charge', amount: 1800 },
    { category: 'Education', desc: 'Online course enrollment', amount: 1200 },
    { category: 'Subscription', desc: 'Netflix annual plan', amount: 3500 },
    { category: 'Subscription', desc: 'Spotify premium 3 months', amount: 900 },
    { category: 'Insurance', desc: 'Health insurance premium', amount: 8500 },
    { category: 'Bills', desc: 'Water bill - quarterly', amount: 1600 },
    { category: 'Misc', desc: 'Miscellaneous expenses', amount: 700 },
  ];

  return descriptions.map((item, i) => {
    const day = 10 + (i % 18);
    const monthIndex = i < 9 ? 0 : i < 18 ? 1 : 2;
    const date = new Date(2026, monthIndex, day);

    return {
      id: `exp-${String(i + 1).padStart(3, '0')}`,
      user_id: 'demo-user',
      account_id: 'acc-main',
      category_id: CATEGORY_ID_MAP[item.category] ?? 'cat-other',
      amount: item.amount,
      description: item.desc,
      merchant: null,
      date: date.toISOString().split('T')[0],
      type: 'expense' as const,
      is_recurring: false,
      tags: [],
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
    };
  });
}

const TOP_EXPENSES = generateTopExpenses();

// ─── Default Filter State ─────────────────────────────────────────────────────

const DEFAULT_FILTERS: ReportFiltersState = {
  period: 'month',
  month: '2026-06',
  category: '',
  type: 'all',
};

// ─── Component ────────────────────────────────────────────────────────────────

function ReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersState>(DEFAULT_FILTERS);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [simulateError, setSimulateError] = useState<string | null>(null);

  const handleGenerate = () => {
    setSimulateLoading(true);
    setSimulateError(null);

    setTimeout(() => {
      setSimulateLoading(false);
    }, 600);
  };

  const toggleSimulateError = () => {
    if (simulateError) {
      setSimulateError(null);
    } else {
      setSimulateError('Failed to load report data. Please try again.');
    }
  };

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="island-kicker mb-1">Finance OS</p>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
            <BarChart3 className="h-7 w-7 text-[var(--lagoon)]" />
            Reports
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSimulateError}
            className="demo-button-secondary demo-button text-xs"
            title="Toggle simulated error for testing"
          >
            <AlertCircleIcon className="h-3.5 w-3.5" />
            Toggle Error
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ReportFilters
          filters={filters}
          onFiltersChange={setFilters}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Mobile Generate Button */}
      <div className="mb-6 sm:hidden">
        <button
          type="button"
          onClick={handleGenerate}
          className="demo-button w-full justify-center"
        >
          <RefreshCw
            className={`h-4 w-4 ${simulateLoading ? 'animate-spin' : ''}`}
          />
          {simulateLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Row 1: Income vs Expenses + Savings Trend */}
        <div className="grid gap-6 lg:grid-cols-2">
          <IncomeVsExpenseChart
            data={MONTHLY_TREND}
            loading={simulateLoading}
            error={simulateError}
          />
          <SavingsTrendChart
            data={SAVINGS_TREND}
            loading={simulateLoading}
            error={simulateError}
          />
        </div>

        {/* Row 2: Category Breakdown + Budget Utilization */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryBreakdownReport
            data={CATEGORY_BREAKDOWN}
            loading={simulateLoading}
            error={simulateError}
          />
          <BudgetUtilizationReport
            data={BUDGET_UTILIZATION}
            loading={simulateLoading}
            error={simulateError}
          />
        </div>

        {/* Row 3: Top Expenses Table (full width) */}
        <TopExpensesTable
          data={TOP_EXPENSES}
          loading={simulateLoading}
          error={simulateError}
        />
      </div>
    </main>
  );
}

export default ReportsPage;
