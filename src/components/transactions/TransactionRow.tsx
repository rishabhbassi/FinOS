// FinOS - Transaction Row Component

import { useState } from 'react';
import {
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import type { Transaction } from '@/types/database';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
  categoryNames?: Record<string, string>;
}

function getCategoryName(categoryId: string | null, categoryNames?: Record<string, string>): string {
  if (!categoryId) return 'Uncategorized';
  if (categoryNames && categoryNames[categoryId]) return categoryNames[categoryId];
  // Fallback: try to extract a readable name from the UUID-based category_id
  return 'Unknown';
}

export default function TransactionRow({
  transaction,
  onEdit,
  onDelete,
  compact = false,
  categoryNames,
}: TransactionRowProps) {
  const catName = transaction.category_id
    ? getCategoryName(transaction.category_id, categoryNames)
    : 'Uncategorized';
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const displayAmount = isExpense ? -transaction.amount : transaction.amount;
  const amountColor = isIncome
    ? 'text-emerald-600 dark:text-emerald-400'
    : isExpense
      ? 'text-red-500 dark:text-red-400'
      : 'text-blue-500 dark:text-blue-400';

  if (compact) {
    return (
      <div className="demo-card !rounded-xl !p-3 transition hover:border-[var(--lagoon)]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl text-sm',
                isIncome
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : isExpense
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30',
              )}
            >
              <span>{isExpense ? '💳' : isIncome ? '💰' : '🔄'}</span>
            </div>

            <div>
              <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                {transaction.description || catName}
              </p>
              <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                {formatDate(transaction.date)}
                {transaction.merchant && ` · ${transaction.merchant}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onDelete(transaction.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--sea-ink-soft)]/50 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              aria-label={`Delete ${transaction.description || 'transaction'}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <span className={cn('text-base font-bold font-mono tabular-nums', amountColor)}>
              {isExpense ? '- ' : isIncome ? '+ ' : ''}
              {formatCurrency(Math.abs(displayAmount))}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className="group relative transition hover:bg-[color-mix(in_oklab,var(--lagoon),transparent_94%)]">
      <td className="whitespace-nowrap text-sm text-[var(--sea-ink-soft)]">
        {formatDate(transaction.date)}
      </td>

      <td>
        <div className="flex items-center gap-2">
          <span>{isExpense ? '💳' : isIncome ? '💰' : '🔄'}</span>
          <div>
            <p className="m-0 text-sm font-medium text-[var(--sea-ink)]">
              {transaction.description || catName}
            </p>
            {transaction.merchant && (
              <p className="m-0 text-xs text-[var(--sea-ink-soft)]">{transaction.merchant}</p>
            )}
          </div>
        </div>
      </td>

      <td className="text-sm text-[var(--sea-ink-soft)]">
        {catName}
      </td>

      <td className="text-sm text-[var(--sea-ink-soft)]">
        {transaction.tags && transaction.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {transaction.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="demo-pill !text-[10px]">
                {tag}
              </span>
            ))}
            {transaction.tags.length > 2 && (
              <span className="demo-pill !text-[10px]">+{transaction.tags.length - 2}</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-[var(--sea-ink-soft)]">—</span>
        )}
      </td>

      <td className="text-right">
        <span className={cn('text-sm font-bold font-mono tabular-nums', amountColor)}>
          {isIncome ? '+' : isExpense ? '-' : ''}
          {formatCurrency(Math.abs(displayAmount))}
        </span>
      </td>

      <td className="w-0">
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] hover:bg-[var(--line)] hover:text-[var(--sea-ink)]"
            aria-label="Edit transaction"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(!menuOpen);
                setConfirmDelete(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] hover:bg-[var(--line)] hover:text-[var(--sea-ink)]"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-lg">
                {confirmDelete ? (
                  <>
                    <p className="px-3 py-2 text-xs text-red-500">Are you sure?</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(transaction.id);
                        setMenuOpen(false);
                        setConfirmDelete(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--sea-ink-soft)] hover:bg-[var(--line)]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onEdit(transaction);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--sea-ink)] hover:bg-[var(--line)]"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
