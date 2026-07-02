import { motion } from 'motion/react';
import {
  AlertCircle,
  RefreshCw,
  Wallet,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import type { DailyDecision } from '@/types/app';
import { formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';

interface DailyDecisionCardProps {
  decision: DailyDecision | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function Skeleton() {
  return (
    <div className="demo-panel animate-pulse">
      <div className="mb-2 h-4 w-28 rounded bg-[var(--line)]" />
      <div className="mb-4 h-14 w-40 rounded bg-[var(--line)]" />
      <div className="mb-3 h-3 w-full rounded-full bg-[var(--line)]" />
      <div className="h-4 w-56 rounded bg-[var(--line)]" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-panel flex flex-col items-center gap-3 py-10 text-center">
      <Wallet className="h-10 w-10 text-[var(--sea-ink-soft)] opacity-50" />
      <p className="demo-muted m-0 text-sm font-medium">
        No data yet. Start by adding transactions.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="demo-panel flex flex-col items-center gap-3 py-8 text-center">
      <AlertCircle className="h-10 w-10 text-red-500/70" />
      <p className="m-0 text-sm font-medium text-red-600 dark:text-red-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="demo-button mt-1"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}

export default function DailyDecisionCard({
  decision,
  loading = false,
  error = null,
  onRetry,
}: DailyDecisionCardProps) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!decision) return <EmptyState />;

  const statusToVariant = {
    comfortable: 'success' as const,
    tight: 'warning' as const,
    over: 'danger' as const,
  };

  return (
    <motion.div
      className="demo-panel rise-in"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="island-kicker">Today's Budget</span>
        <StatusBadge status={decision.status} />
      </div>

      <motion.p
        className="m-0 mb-3 text-[clamp(2rem,_6vw,_3.25rem)] font-extrabold leading-none tracking-tight text-[var(--sea-ink)]"
        key={decision.remaining}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {formatCurrency(decision.remaining)}
      </motion.p>

      <ProgressBar
        value={decision.spent}
        max={decision.available}
        variant={statusToVariant[decision.status]}
        size="md"
        className="mb-3"
        showLabel
      />

      <div className="mb-4 flex items-center gap-4 text-sm text-[var(--sea-ink-soft)]">
        <span>
          Spent <strong className="text-[var(--sea-ink)]">{formatCurrency(decision.spent)}</strong>
        </span>
        <span className="opacity-40">|</span>
        <span>
          Available <strong className="text-[var(--sea-ink)]">{formatCurrency(decision.available)}</strong>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-3 text-xs text-[var(--sea-ink-soft)]">
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Tomorrow: {formatCurrency(decision.tomorrowBudget)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {decision.daysLeftInMonth} {decision.daysLeftInMonth === 1 ? 'day' : 'days'} left in month
        </span>
        <span className="inline-flex items-center gap-1.5">
          Month remaining: {formatCurrency(decision.monthlyRemaining)}
        </span>
      </div>
    </motion.div>
  );
}
