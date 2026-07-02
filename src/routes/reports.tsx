import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { BarChart3 } from 'lucide-react';

import ReportFilters, {
  type ReportFiltersState,
} from '@/components/reports/ReportFilters';
import IncomeVsExpenseChart from '@/components/reports/IncomeVsExpenseChart';
import CategoryBreakdownReport from '@/components/reports/CategoryBreakdownReport';
import SavingsTrendChart from '@/components/reports/SavingsTrendChart';
import BudgetUtilizationReport from '@/components/reports/BudgetUtilizationReport';
import TopExpensesTable from '@/components/reports/TopExpensesTable';

export const Route = createFileRoute('/reports')({ component: ReportsPage });

// ─── Default Filter State ─────────────────────────────────────────────────────

const DEFAULT_FILTERS: ReportFiltersState = {
  period: 'month',
  month: new Date().toISOString().slice(0, 7),
  category: '',
  type: 'all',
};

// ─── Component ────────────────────────────────────────────────────────────────

function ReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersState>(DEFAULT_FILTERS);

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="island-kicker mb-1">FinOS</p>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
            <BarChart3 className="h-7 w-7 text-[var(--lagoon)]" />
            Reports
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ReportFilters
          filters={filters}
          onFiltersChange={setFilters}
          onGenerate={() => {}}
        />
      </div>

      {/* Charts Grid — data sourced from Supabase; empty until user has transactions */}
      <div className="space-y-6">
        {/* Row 1: Income vs Expenses + Savings Trend */}
        <div className="grid gap-6 lg:grid-cols-2">
          <IncomeVsExpenseChart data={[]} />
          <SavingsTrendChart data={[]} />
        </div>

        {/* Row 2: Category Breakdown + Budget Utilization */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryBreakdownReport data={[]} />
          <BudgetUtilizationReport data={[]} />
        </div>

        {/* Row 3: Top Expenses Table (full width) */}
        <TopExpensesTable data={[]} />
      </div>
    </main>
  );
}

export default ReportsPage;
