import { motion } from 'motion/react';
import {
  AlertCircle,
  RefreshCw,
  ArrowLeftRight,
  ChevronRight,
} from 'lucide-react';
import type { Transaction } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function Skeleton() {
  return (
    <div className="demo-panel animate-pulse">
      <div className="mb-4 h-4 w-36 rounded bg-[var(--line)]" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--line)] p-3">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-[var(--line)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 rounded bg-[var(--line)]" />
              <div className="h-2.5 w-20 rounded bg-[var(--line)]" />
            </div>
            <div className="h-4 w-16 rounded bg-[var(--line)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-panel flex flex-col items-center gap-3 py-10 text-center">
      <ArrowLeftRight className="h-10 w-10 text-[var(--sea-ink-soft)] opacity-50" />
      <p className="demo-muted m-0 text-sm font-medium">No transactions yet.</p>
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

function getCategoryColor(categoryId: string | null): string {
  if (!categoryId) return 'bg-gray-400';
  // Deterministic color from category ID
  const colors = [
    'bg-emerald-400',
    'bg-sky-400',
    'bg-violet-400',
    'bg-amber-400',
    'bg-rose-400',
    'bg-teal-400',
    'bg-indigo-400',
    'bg-pink-400',
    'bg-lime-400',
    'bg-cyan-400',
  ];
  const hash = categoryId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function RecentTransactions({
  transactions,
  loading = false,
  error = null,
  onRetry,
}: RecentTransactionsProps) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!transactions || transactions.length === 0) return <EmptyState />;

  const displayTxns = transactions.slice(0, 10);

  return (
    <motion.div
      className="demo-panel rise-in"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="island-kicker">Recent Transactions</span>
        <button
          type="button"
          className="text-xs font-semibold text-[var(--lagoon-deep)] hover:underline"
          onClick={() => {
            // Future: navigate to transactions page
          }}
        >
          View all
        </button>
      </div>

      <div className="space-y-2">
        {displayTxns.map((tx, index) => (
          <motion.button
            key={tx.id}
            type="button"
            className="flex w-full items-center gap-3 rounded-lg border border-[var(--line)] bg-[color-mix(in_oklab,var(--chip-bg),transparent_10%)] p-3 text-left transition hover:bg-[color-mix(in_oklab,var(--lagoon),transparent_90%)]"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={() => {
              // Future: open transaction detail
            }}
          >
            <span
              className={cn(
                'inline-block h-8 w-8 flex-shrink-0 rounded-full',
                getCategoryColor(tx.category_id),
              )}
            />

            <div className="flex-1 min-w-0">
              <p className="m-0 truncate text-sm font-semibold text-[var(--sea-ink)]">
                {tx.description || 'Untitled transaction'}
              </p>
              {tx.merchant && (
                <p className="m-0 truncate text-xs text-[var(--sea-ink-soft)]">
                  {tx.merchant}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-0.5">
              <span
                className={cn(
                  'text-sm font-bold tabular-nums',
                  tx.type === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(Math.abs(tx.amount))}
              </span>
              <span className="text-[0.65rem] text-[var(--sea-ink-soft)]">
                {formatDate(tx.date)}
              </span>
            </div>

            <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--sea-ink-soft)] opacity-40" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
