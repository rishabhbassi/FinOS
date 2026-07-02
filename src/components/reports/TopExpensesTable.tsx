import type { Transaction } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'motion/react';
import { Wallet, AlertCircle } from 'lucide-react';

interface TopExpensesTableProps {
  data: Transaction[];
  loading?: boolean;
  error?: string | null;
}

function LoadingSkeleton() {
  return (
    <div className="demo-panel">
      <div className="mb-4 h-4 w-28 rounded bg-[color-mix(in_oklab,var(--line)_50%,transparent)]" />
      <div className="demo-table-shell">
        <table className="demo-table">
          <thead>
            <tr>
              <th className="w-10">#</th>
              <th>Date</th>
              <th className="hidden sm:table-cell">Description</th>
              <th>Category</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                <td><div className="fin-skeleton h-4 w-6 rounded" /></td>
                <td><div className="fin-skeleton h-4 w-20 rounded" /></td>
                <td className="hidden sm:table-cell"><div className="fin-skeleton h-4 w-32 rounded" /></td>
                <td><div className="fin-skeleton h-4 w-20 rounded" /></td>
                <td className="text-right"><div className="fin-skeleton ml-auto h-4 w-16 rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="demo-panel">
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Top Expenses</h3>
      <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-center">
        <Wallet className="h-10 w-10 text-[var(--sea-ink-soft)]" />
        <p className="text-sm text-[var(--sea-ink-soft)]">No expenses recorded</p>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="demo-panel">
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Top Expenses</h3>
      <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-medium text-red-500">{error}</p>
      </div>
    </div>
  );
}

export default function TopExpensesTable({
  data,
  loading = false,
  error = null,
}: TopExpensesTableProps) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  const expenses = data.filter((t) => t.type === 'expense');
  const sorted = [...expenses].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  const top20 = sorted.slice(0, 20);

  if (top20.length === 0) return <EmptyState />;

  return (
    <motion.div
      className="demo-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
    >
      <h3 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Top Expenses</h3>
      <div className="demo-table-shell">
        <table className="demo-table">
          <thead>
            <tr>
              <th className="w-10">#</th>
              <th>Date</th>
              <th className="hidden sm:table-cell">Description</th>
              <th>Category</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {top20.map((transaction, index) => {
              const catName =
                transaction.category_id
                  ?.replace(/-/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Other';

              return (
                <tr key={transaction.id}>
                  <td className="text-xs text-[var(--sea-ink-soft)]">{index + 1}</td>
                  <td className="whitespace-nowrap text-xs font-mono tabular-nums text-[var(--sea-ink-soft)]">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="hidden max-w-[200px] truncate text-sm sm:table-cell">
                    {transaction.description || transaction.merchant || '-'}
                  </td>
                  <td>
                    <span className="demo-pill text-[10px]">{catName}</span>
                  </td>
                  <td className="text-right text-sm font-semibold font-mono tabular-nums text-red-500">
                    -{formatCurrency(Math.abs(transaction.amount))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
