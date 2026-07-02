import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MonthlyComparisonProps {
  data: {
    thisMonth: { savings: number; expenses: number };
    lastMonth: { savings: number; expenses: number };
    change: { savings: number; expenses: number };
  } | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function Skeleton() {
  return (
    <div className="demo-card animate-pulse">
      <div className="mb-4 h-4 w-28 rounded bg-[var(--line)]" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-[var(--line)]" />
          <div className="h-4 w-20 rounded bg-[var(--line)]" />
          <div className="h-3 w-12 rounded bg-[var(--line)]" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-[var(--line)]" />
          <div className="h-4 w-20 rounded bg-[var(--line)]" />
          <div className="h-3 w-12 rounded bg-[var(--line)]" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-card flex flex-col items-center gap-3 py-8 text-center">
      <BarChart3 className="h-8 w-8 text-[var(--sea-ink-soft)] opacity-50" />
      <p className="demo-muted m-0 text-sm font-medium">No comparison data yet.</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="demo-card flex flex-col items-center gap-3 py-6 text-center">
      <AlertCircle className="h-8 w-8 text-red-500/70" />
      <p className="m-0 text-sm font-medium text-red-600 dark:text-red-400">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="demo-button mt-1">
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}

function ChangeIndicator({ value, label }: { value: number; label: string }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <div className="flex items-center gap-1 text-xs">
      {isNeutral ? (
        <span className="text-[var(--sea-ink-soft)]">--</span>
      ) : isPositive ? (
        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
      )}
      <span
        className={cn(
          'font-semibold',
          isNeutral
            ? 'text-[var(--sea-ink-soft)]'
            : isPositive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400',
        )}
      >
        {!isNeutral && (isPositive ? '+' : '')}
        {value}%
      </span>
      <span className="text-[var(--sea-ink-soft)]">{label}</span>
    </div>
  );
}

export default function MonthlyComparisonCard({
  data,
  loading = false,
  error = null,
  onRetry,
}: MonthlyComparisonProps) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!data) return <EmptyState />;

  return (
    <motion.div
      className="demo-card rise-in"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
    >
      <span className="island-kicker mb-4 block">Month-over-Month</span>

      <div className="grid grid-cols-2 gap-4">
        {/* This Month */}
        <div className="rounded-lg border border-[var(--line)] bg-[color-mix(in_oklab,var(--lagoon),transparent_92%)] p-3">
          <p className="m-0 mb-2 text-xs font-semibold text-[var(--lagoon-deep)]">This Month</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--sea-ink-soft)]">Expenses</span>
              <span className="text-sm font-bold text-[var(--sea-ink)]">
                {formatCurrency(data.thisMonth.expenses)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--sea-ink-soft)]">Savings</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.thisMonth.savings)}
              </span>
            </div>
          </div>
        </div>

        {/* Last Month */}
        <div className="rounded-lg border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong),transparent_20%)] p-3">
          <p className="m-0 mb-2 text-xs font-semibold text-[var(--sea-ink-soft)]">Last Month</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--sea-ink-soft)]">Expenses</span>
              <span className="text-sm font-bold text-[var(--sea-ink)]">
                {formatCurrency(data.lastMonth.expenses)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--sea-ink-soft)]">Savings</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.lastMonth.savings)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change indicators */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[var(--line)] pt-3">
        <ChangeIndicator value={data.change.expenses} label="expenses" />
        <ChangeIndicator value={data.change.savings} label="savings" />
      </div>
    </motion.div>
  );
}
