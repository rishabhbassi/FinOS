// Finance OS - Transactions Page

import { useState, useCallback, useEffect, useRef } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';
import {
  Plus,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Wallet,
  LayoutList,
  LayoutGrid,
  X,
} from 'lucide-react';
import type { Transaction } from '@/types/database';
import type { TransactionFilters } from '@/types/app';
import { formatCurrency, startOfMonth, toDateString, getTodayDateString, cn } from '@/lib/utils';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionForm, TransactionTable, FilterBar } from '@/components/transactions';
import TransactionRow from '@/components/transactions/TransactionRow';
import { useQuickEntryStore } from '@/stores/quick-entry-store';
import { categoryQueries } from '@/lib/supabase/queries';

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
});

function SummaryBar({
  transactions,
  loading,
}: {
  transactions: Transaction[];
  loading: boolean;
}) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const net = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="demo-card animate-pulse !rounded-xl !p-4">
            <div className="mb-2 h-3 w-16 rounded bg-[var(--line)]" />
            <div className="h-6 w-24 rounded bg-[var(--line)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="demo-card !rounded-xl !p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span className="island-kicker text-[10px]">Income</span>
        </div>
        <p className="m-0 text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(totalIncome)}
        </p>
      </div>

      <div className="demo-card !rounded-xl !p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          <span className="island-kicker text-[10px]">Expenses</span>
        </div>
        <p className="m-0 text-lg font-bold text-red-500 dark:text-red-400">
          {formatCurrency(totalExpenses)}
        </p>
      </div>

      <div className="demo-card !rounded-xl !p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
          <span className="island-kicker text-[10px]">Net</span>
        </div>
        <p
          className={cn(
            'm-0 text-lg font-bold',
            net >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-400',
          )}
        >
          {net >= 0 ? '+' : ''}
          {formatCurrency(net)}
        </p>
      </div>
    </div>
  );
}

function TransactionsPage() {
  // State
  const [filters, setFilters] = useState<TransactionFilters>({
    dateFrom: toDateString(startOfMonth()),
    dateTo: getTodayDateString(),
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const openQuickEntry = useQuickEntryStore((s) => s.openQuickEntry);

  const {
    transactions,
    loading,
    error,
    refetch,
    deleteTransaction,
  } = useTransactions(filters);

  // Auto-refetch when QuickEntry closes (transaction was added)
  const quickEntryOpen = useQuickEntryStore((s) => s.open);
  const prevQuickEntryRef = useRef(quickEntryOpen);
  useEffect(() => {
    if (prevQuickEntryRef.current && !quickEntryOpen) {
      refetch();
    }
    prevQuickEntryRef.current = quickEntryOpen;
  }, [quickEntryOpen, refetch]);

  // Load categories to resolve UUID → name/color
  useEffect(() => {
    categoryQueries.list().then((cats) => {
      const nameMap: Record<string, string> = {};
      const colorMap: Record<string, string> = {};
      cats.forEach((c) => {
        nameMap[c.id] = c.name;
        colorMap[c.id] = c.color;
      });
      setCategoryNames(nameMap);
      setCategoryColors(colorMap);
    }).catch(() => {});
  }, []);

  // Handlers
  const handleAddTransaction = useCallback(() => {
    setEditingTransaction(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((t: Transaction) => {
    setEditingTransaction(t);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setDeleteError(null);
        await deleteTransaction(id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Delete failed';
        console.error('Failed to delete transaction:', msg);
        setDeleteError(msg);
        setTimeout(() => setDeleteError(null), 5000);
      }
    },
    [deleteTransaction],
  );

  const handleDeleteMultiple = useCallback(
    async (ids: string[]) => {
      let failed = 0;
      let lastErr = '';
      for (const id of ids) {
        try {
          await deleteTransaction(id);
        } catch (err) {
          lastErr = err instanceof Error ? err.message : 'Delete failed';
          console.error('Failed to delete transaction:', id, lastErr);
          failed++;
        }
      }
      if (failed > 0) {
        setDeleteError(`Failed to delete ${failed} transaction(s): ${lastErr}`);
        setTimeout(() => setDeleteError(null), 5000);
        refetch();
      }
    },
    [deleteTransaction, refetch],
  );

  const handleFormSuccess = useCallback(() => {
    setFormOpen(false);
    setEditingTransaction(undefined);
    refetch();
  }, [refetch]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      dateFrom: toDateString(startOfMonth()),
      dateTo: getTodayDateString(),
    });
  }, []);

  return (
    <main className="demo-page">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="island-kicker mb-1">Transactions</p>
          <h1 className="demo-title">Transactions</h1>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {loading
              ? 'Loading...'
              : `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} this period`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle (mobile) */}
          <div className="flex rounded-xl border border-[var(--line)] p-0.5 sm:hidden">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'rounded-lg p-1.5 transition',
                viewMode === 'table'
                  ? 'bg-white/80 text-[var(--sea-ink)] shadow-sm dark:bg-white/10'
                  : 'text-[var(--sea-ink-soft)]',
              )}
              aria-label="Table view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={cn(
                'rounded-lg p-1.5 transition',
                viewMode === 'compact'
                  ? 'bg-white/80 text-[var(--sea-ink)] shadow-sm dark:bg-white/10'
                  : 'text-[var(--sea-ink-soft)]',
              )}
              aria-label="Compact view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Entry button */}
          <button
            type="button"
            onClick={openQuickEntry}
            className="demo-button !rounded-xl !py-2 text-xs"
            title="Quick Add (⌘K)"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
            <span className="hidden rounded border border-[var(--line)] px-1 py-0.5 font-mono text-[10px] sm:inline">
              ⌘K
            </span>
          </button>

          {/* Add Transaction button */}
          <button
            type="button"
            onClick={handleAddTransaction}
            className="demo-button !rounded-xl !bg-[var(--lagoon-deep)] !text-white hover:!bg-[var(--lagoon-deep)]/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <SummaryBar transactions={transactions} loading={loading} />

      {/* Filter Bar */}
      <div className="mt-6">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />
      </div>

      {/* Delete error banner */}
      {deleteError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <p className="m-0 text-sm font-medium text-red-600 dark:text-red-400">
              {deleteError}
            </p>
            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="ml-auto rounded-lg p-1 text-red-500/60 hover:bg-red-500/10 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-6">
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <div>
              <p className="m-0 text-base font-semibold text-red-600 dark:text-red-400">
                Failed to load transactions
              </p>
              <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">{error}</p>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="demo-button !rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Transaction Table (desktop) or Card view (mobile) */}
      {!error && (
        <div className="mt-6">
          {/* Desktop table view */}
          <div className="hidden sm:block">
            <TransactionTable
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              loading={loading}
              categoryNames={categoryNames}
              categoryColors={categoryColors}
            />
          </div>

          {/* Mobile card view (when table mode is selected) */}
          <div className={cn('sm:hidden', viewMode === 'compact' && 'hidden')}>
            <TransactionTable
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              loading={loading}
              categoryNames={categoryNames}
              categoryColors={categoryColors}
            />
          </div>

          {/* Mobile compact cards view */}
          {viewMode === 'compact' && (
            <div className="space-y-2 sm:hidden">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="demo-card animate-pulse !rounded-xl !p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[var(--line)]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 rounded bg-[var(--line)]" />
                        <div className="h-3 w-1/3 rounded bg-[var(--line)]" />
                      </div>
                      <div className="h-5 w-16 rounded bg-[var(--line)]" />
                    </div>
                  </div>
                ))
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--lagoon),transparent_88%)]">
                    <Wallet className="h-8 w-8 text-[var(--lagoon-deep)]" />
                  </div>
                  <div>
                    <p className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                      No transactions yet
                    </p>
                    <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
                      Add your first one to start tracking!
                    </p>
                  </div>
                </div>
              ) : (
                transactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    compact
                    categoryNames={categoryNames}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTransaction(undefined);
        }}
        transaction={editingTransaction}
        onSuccess={handleFormSuccess}
      />

      {/* Floating Action Button (mobile) */}
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <motion.button
          type="button"
          onClick={handleAddTransaction}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--lagoon-deep)] text-white shadow-lg transition hover:bg-[var(--lagoon-deep)]/90 hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Add transaction"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </main>
  );
}
