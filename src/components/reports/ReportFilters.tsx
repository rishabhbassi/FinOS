import { cn } from '@/lib/utils';
import { BarChart3, CalendarDays, Filter } from 'lucide-react';

export type PeriodType = 'month' | 'quarter' | 'year' | 'custom';
export type FilterType = 'all' | 'income' | 'expense';

export interface ReportFiltersState {
  period: PeriodType;
  month: string;
  category: string;
  type: FilterType;
}

interface ReportFiltersProps {
  filters: ReportFiltersState;
  onFiltersChange: (filters: ReportFiltersState) => void;
  onGenerate: () => void;
}

const PERIODS: { value: PeriodType; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
];

const CATEGORIES = [
  'All Categories',
  'Food',
  'Groceries',
  'Fuel',
  'Rent',
  'Electricity',
  'Internet',
  'Shopping',
  'Entertainment',
  'Medical',
  'Travel',
  'Education',
  'Gift',
  'Subscription',
  'Bills',
  'EMI',
  'Insurance',
  'Misc',
];

const TYPES: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function ReportFilters({
  filters,
  onFiltersChange,
  onGenerate,
}: ReportFiltersProps) {
  const currentYear = 2026;
  const monthOptions = MONTHS.map((month, i) => ({
    value: `${currentYear}-${String(i + 1).padStart(2, '0')}`,
    label: `${month} ${currentYear}`,
  }));

  const updateFilter = <K extends keyof ReportFiltersState>(
    key: K,
    value: ReportFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="island-shell demo-panel">
      <div className="flex flex-wrap items-end gap-4">
        {/* Period Selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
            <CalendarDays className="-mt-0.5 mr-1 inline-block h-3.5 w-3.5" />
            Period
          </label>
          <div className="flex rounded-lg border border-[var(--line)] p-0.5 bg-[color-mix(in_oklab,var(--surface-strong)_80%,transparent)]">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => updateFilter('period', p.value)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                  filters.period === p.value
                    ? 'bg-[var(--lagoon)] text-white shadow-sm'
                    : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Month Dropdown */}
        {filters.period === 'month' && (
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
              Month
            </label>
            <select
              value={filters.month}
              onChange={(e) => updateFilter('month', e.target.value)}
              className="demo-select"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
            <Filter className="-mt-0.5 mr-1 inline-block h-3.5 w-3.5" />
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="demo-select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Type Toggle */}
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
            Type
          </label>
          <div className="flex rounded-lg border border-[var(--line)] p-0.5 bg-[color-mix(in_oklab,var(--surface-strong)_80%,transparent)]">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => updateFilter('type', t.value)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                  filters.type === t.value
                    ? 'bg-[var(--lagoon)] text-white shadow-sm'
                    : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex-none self-end">
          <button
            type="button"
            onClick={onGenerate}
            className="demo-button whitespace-nowrap"
          >
            <BarChart3 className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
