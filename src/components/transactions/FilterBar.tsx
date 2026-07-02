// FinOS - Filter Bar for Transactions

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  X,
  Calendar,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import type { Category } from '@/types/database';
import type { TransactionFilters } from '@/types/app';
import { getCategories } from '@/actions/categories';
import { getTodayDateString, startOfMonth, toDateString, cn } from '@/lib/utils';

type TypeFilter = 'all' | 'income' | 'expense' | 'transfer';
type DatePreset = 'today' | '7d' | '30d' | 'month' | 'custom' | null;

interface FilterBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  onReset: () => void;
}

function getPresetDates(preset: DatePreset): { dateFrom?: string; dateTo?: string } {
  const today = new Date();
  switch (preset) {
    case 'today': {
      const d = getTodayDateString();
      return { dateFrom: d, dateTo: d };
    }
    case '7d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 7);
      return { dateFrom: toDateString(from), dateTo: getTodayDateString() };
    }
    case '30d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      return { dateFrom: toDateString(from), dateTo: getTodayDateString() };
    }
    case 'month': {
      const from = startOfMonth(today);
      return { dateFrom: toDateString(from), dateTo: getTodayDateString() };
    }
    default:
      return {};
  }
}

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
];

export default function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activePreset, setActivePreset] = useState<DatePreset>(null);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Count active filters
  const activeFilterCount = [
    filters.type,
    filters.dateFrom || filters.dateTo,
    filters.category_id,
    filters.minAmount !== undefined || filters.maxAmount !== undefined,
    filters.search,
  ].filter(Boolean).length;

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        onChange({ ...filters, search: value || undefined });
      }, 300);
    },
    [filters, onChange],
  );

  const handleTypeChange = (type: TypeFilter) => {
    if (type === 'all') {
      const { type: _, ...rest } = filters;
      onChange(rest);
    } else {
      onChange({ ...filters, type });
    }
  };

  const handleDatePreset = (preset: DatePreset) => {
    setActivePreset(preset);
    if (preset === 'custom') {
      // Custom range will be shown via date inputs
      return;
    }
    if (preset === null) {
      const { dateFrom: _, dateTo: __, ...rest } = filters;
      onChange(rest);
      return;
    }
    const range = getPresetDates(preset);
    onChange({ ...filters, ...range });
  };

  const handleReset = () => {
    setActivePreset(null);
    setSearchValue('');
    onReset();
  };

  const clearSearch = () => {
    setSearchValue('');
    const { search: _, ...rest } = filters;
    onChange(rest);
  };

  const currentType: TypeFilter = filters.type || 'all';

  return (
    <div className="space-y-3">
      {/* Top row: Search + type toggles + filter toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="demo-input !rounded-xl !py-2 !pl-9 !pr-8 text-sm"
            aria-label="Search transactions"
          />
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Type toggles */}
        <div className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong),transparent_20%)] p-0.5">
          {(['all', 'income', 'expense'] as TypeFilter[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition',
                currentType === type
                  ? 'bg-white/80 text-[var(--sea-ink)] shadow-sm dark:bg-white/10'
                  : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
              )}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>

        {/* Filter toggle button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'demo-button !rounded-xl !py-2 text-xs',
            showFilters || activeFilterCount > 1
              ? 'border-[var(--lagoon)]/40 bg-[var(--lagoon)]/10'
              : 'demo-button-secondary',
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lagoon)] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div className="demo-card !rounded-xl !p-4">
          <div className="flex flex-wrap items-start gap-4">
            {/* Date presets */}
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
                Date Range
              </label>
              <div className="flex flex-wrap gap-1">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleDatePreset(preset.value)}
                    className={cn(
                      'demo-pill cursor-pointer text-[11px]',
                      activePreset === preset.value && '!border-[var(--lagoon)] !bg-[var(--lagoon)]/10 !text-[var(--lagoon-deep)]',
                    )}
                  >
                    {preset.value === 'custom' && <Calendar className="h-3 w-3" />}
                    {preset.label}
                  </button>
                ))}
                {activePreset && (
                  <button
                    type="button"
                    onClick={() => handleDatePreset(null)}
                    className="demo-pill cursor-pointer text-[11px] opacity-60 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Custom date range */}
              {activePreset === 'custom' && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) =>
                      onChange({ ...filters, dateFrom: e.target.value || undefined })
                    }
                    className="demo-input !rounded-lg !py-1.5 text-xs"
                    aria-label="From date"
                  />
                  <span className="text-xs text-[var(--sea-ink-soft)]">to</span>
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) =>
                      onChange({ ...filters, dateTo: e.target.value || undefined })
                    }
                    className="demo-input !rounded-lg !py-1.5 text-xs"
                    aria-label="To date"
                  />
                </div>
              )}
            </div>

            {/* Category filter */}
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
                Category
              </label>
              <select
                value={filters.category_id || ''}
                onChange={(e) =>
                  onChange({ ...filters, category_id: e.target.value || undefined })
                }
                className="demo-select !rounded-lg !py-1.5 text-xs"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount range */}
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
                Amount Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      minAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="demo-input !rounded-lg !py-1.5 text-xs"
                  aria-label="Minimum amount"
                />
                <span className="text-xs text-[var(--sea-ink-soft)]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      maxAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="demo-input !rounded-lg !py-1.5 text-xs"
                  aria-label="Maximum amount"
                />
              </div>
            </div>
          </div>

          {/* Clear all filters */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex justify-end border-t border-[var(--line)] pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sea-ink-soft)] hover:text-red-500"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
