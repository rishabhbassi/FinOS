import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MonthlyOverviewCardProps {
  monthData: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    projectedSavings: number;
  } | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function Skeleton() {
  return (
    <div className="demo-card animate-pulse">
      <div className="mb-4 h-4 w-28 rounded bg-[var(--line)]" />
      <div className="mb-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-[var(--line)]" />
            <div className="h-4 w-16 rounded bg-[var(--line)]" />
          </div>
        ))}
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--line)]" />
      <div className="mt-3 h-3 w-36 rounded bg-[var(--line)]" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-card flex flex-col items-center gap-3 py-8 text-center">
      <Wallet className="h-8 w-8 text-[var(--sea-ink-soft)] opacity-50" />
      <p className="demo-muted m-0 text-sm font-medium">No monthly data yet.</p>
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

function SavingsRing({ rate }: { rate: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(rate, 100) / 100) * circumference;
  const color = rate >= 20
    ? 'stroke-emerald-500'
    : rate >= 10
      ? 'stroke-amber-500'
      : 'stroke-red-500';

  return (
    <div className="flex-shrink-0">
      <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="color-mix(in oklab, var(--lagoon), transparent 82%)"
          strokeWidth="6"
        />
        <motion.circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          className={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-[var(--sea-ink)]">
          {Math.round(rate)}%
        </span>
      </div>
    </div>
  );
}

export default function MonthlyOverviewCard({
  monthData,
  loading = false,
  error = null,
  onRetry,
}: MonthlyOverviewCardProps) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!monthData) return <EmptyState />;

  return (
    <motion.div
      className="demo-card rise-in"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <span className="island-kicker mb-3 block">This Month</span>

      <div className="mb-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)]">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Income
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(monthData.income)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)]">
            <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />
            Expenses
          </span>
          <span className="text-sm font-bold text-red-600 dark:text-red-400">
            {formatCurrency(monthData.expenses)}
          </span>
        </div>
        <div className="border-t border-[var(--line)] pt-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--sea-ink)]">
              <PiggyBank className="h-4 w-4 text-[var(--lagoon)]" />
              Savings
            </span>
            <span className="text-sm font-bold text-[var(--sea-ink)]">
              {formatCurrency(monthData.savings)}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-4">
        <div className="relative inline-flex">
          <SavingsRing rate={monthData.savingsRate} />
        </div>
        <div className="flex-1 text-xs text-[var(--sea-ink-soft)]">
          <span className="block font-semibold text-[var(--sea-ink)]">
            Savings Rate
          </span>
          {monthData.savingsRate >= 20
            ? 'Great job! You\'re saving well above the recommended 20%.'
            : monthData.savingsRate >= 10
              ? 'You\'re on track. Try to push towards 20% savings.'
              : 'Try to increase your savings rate to at least 20%.'}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[color-mix(in_oklab,var(--lagoon),transparent_92%)] px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--sea-ink)]">
          <TrendingUp className="h-3.5 w-3.5" />
          Projected Savings
        </span>
        <span className="text-sm font-bold text-[var(--sea-ink)]">
          {formatCurrency(monthData.projectedSavings)}
        </span>
      </div>
    </motion.div>
  );
}
