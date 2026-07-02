import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BudgetTimelineProps {
  days: { day: string; available: number; spent: number }[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function Skeleton() {
  return (
    <div className="demo-panel animate-pulse">
      <div className="mb-4 h-4 w-28 rounded bg-[var(--line)]" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-10 rounded bg-[var(--line)]" />
            <div className="h-4 flex-1 rounded-full bg-[var(--line)]" />
            <div className="h-4 w-14 rounded bg-[var(--line)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-panel flex flex-col items-center gap-3 py-10 text-center">
      <BarChart3 className="h-10 w-10 text-[var(--sea-ink-soft)] opacity-50" />
      <p className="demo-muted m-0 text-sm font-medium">No timeline data yet.</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="demo-panel flex flex-col items-center gap-3 py-8 text-center">
      <AlertCircle className="h-10 w-10 text-red-500/70" />
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

export default function BudgetTimeline({
  days,
  loading = false,
  error = null,
  onRetry,
}: BudgetTimelineProps) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!days || days.length === 0) return <EmptyState />;

  const maxAvailable = Math.max(...days.map((d) => d.available), 1);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short' });

  return (
    <motion.div
      className="demo-panel rise-in"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <span className="island-kicker mb-4 block">Daily Budget Timeline</span>

      <div className="space-y-2.5">
        {days.map((day, index) => {
          const isToday = day.day === today;
          const barWidth = (day.available / maxAvailable) * 100;
          const spentWidth = day.available > 0 ? (day.spent / day.available) * 100 : 0;
          const remaining = day.available - day.spent;
          const isOver = remaining < 0;

          return (
            <motion.div
              key={day.day}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span
                className={cn(
                  'w-10 text-xs font-bold',
                  isToday ? 'text-[var(--lagoon-deep)]' : 'text-[var(--sea-ink-soft)]',
                )}
              >
                {day.day}
              </span>

              <div className="flex-1">
                <div
                  className={cn(
                    'relative h-7 overflow-hidden rounded-lg border',
                    isToday
                      ? 'border-[color-mix(in_oklab,var(--lagoon-deep),transparent_40%)] bg-[color-mix(in_oklab,var(--lagoon),transparent_88%)]'
                      : 'border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong),transparent_20%)]',
                  )}
                  style={{ maxWidth: `${barWidth}%` }}
                >
                  {/* Spent portion */}
                  <motion.div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-r-sm',
                      isOver
                        ? 'bg-red-500/70'
                        : 'bg-[var(--lagoon)]',
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(spentWidth, 100)}%` }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                  {/* Remaining portion (lighter shade) */}
                  {!isOver && (
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-r-lg bg-[color-mix(in_oklab,var(--lagoon),transparent_70%)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(spentWidth, 100)}%`,
                      }}
                      style={{ opacity: 0.3 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.06 + 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  )}
                </div>
              </div>

              <span
                className={cn(
                  'w-16 text-right text-xs font-semibold font-mono tabular-nums',
                  isOver
                    ? 'text-red-500'
                    : 'text-[var(--sea-ink-soft)]',
                )}
              >
                {formatCurrency(remaining >= 0 ? remaining : -remaining)}
                {isOver && ' over'}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
