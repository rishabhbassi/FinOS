import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ProgressBar from '@/components/shared/ProgressBar';

interface WeeklyOverviewCardProps {
  weekData: {
    available: number;
    spent: number;
    remaining: number;
    surplus: number;
  } | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function Skeleton() {
  return (
    <div className="demo-card animate-pulse">
      <div className="mb-3 h-4 w-24 rounded bg-[var(--line)]" />
      <div className="mb-3 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-12 rounded bg-[var(--line)]" />
            <div className="h-5 w-16 rounded bg-[var(--line)]" />
          </div>
        ))}
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--line)]" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-card flex flex-col items-center gap-3 py-8 text-center">
      <Wallet className="h-8 w-8 text-[var(--sea-ink-soft)] opacity-50" />
      <p className="demo-muted m-0 text-sm font-medium">No weekly data yet.</p>
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

export default function WeeklyOverviewCard({
  weekData,
  loading = false,
  error = null,
  onRetry,
}: WeeklyOverviewCardProps) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!weekData) return <EmptyState />;

  const spentPercent = weekData.available > 0
    ? (weekData.spent / weekData.available) * 100
    : 0;

  const variant = spentPercent > 90 ? 'danger' as const : spentPercent > 70 ? 'warning' as const : 'default' as const;
  const surplusColor = weekData.surplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

  return (
    <motion.div
      className="demo-card rise-in"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="island-kicker mb-3 block">This Week</span>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div>
          <p className="demo-muted m-0 text-xs">Budget</p>
          <p className="m-0 text-lg font-bold text-[var(--sea-ink)]">
            {formatCurrency(weekData.available)}
          </p>
        </div>
        <div>
          <p className="demo-muted m-0 text-xs">Spent</p>
          <p className="m-0 text-lg font-bold text-[var(--sea-ink)]">
            {formatCurrency(weekData.spent)}
          </p>
        </div>
        <div>
          <p className="demo-muted m-0 text-xs">Left</p>
          <p className="m-0 text-lg font-bold text-[var(--sea-ink)]">
            {formatCurrency(weekData.remaining)}
          </p>
        </div>
      </div>

      <ProgressBar
        value={weekData.spent}
        max={weekData.available}
        variant={variant}
        size="sm"
        showLabel
        className="mb-3"
      />

      <div className="flex items-center gap-1.5 text-xs">
        <span className="demo-muted">Surplus:</span>
        <span className={`font-semibold ${surplusColor}`}>
          {formatCurrency(Math.abs(weekData.surplus))}
          {weekData.surplus >= 0 ? '' : ' (deficit)'}
        </span>
      </div>
    </motion.div>
  );
}
