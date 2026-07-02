// Finance OS - Transaction Table (TanStack Table v8)

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  RefreshCw,
  Wallet,
  Trash2,
} from 'lucide-react';
import type { Transaction } from '@/types/database';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  loading?: boolean;
  categoryNames?: Record<string, string>;
  categoryColors?: Record<string, string>;
}

// Empty state
function EmptyState() {
  return (
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
  );
}

// Error state
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <div>
        <p className="m-0 text-base font-semibold text-red-600 dark:text-red-400">
          Failed to load transactions
        </p>
        <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
          Something went wrong. Please try again.
        </p>
      </div>
      <button type="button" onClick={onRetry} className="demo-button !rounded-xl">
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

// Page size options
const PAGE_SIZES = [10, 20, 50, 100];


function getCategoryName(catId: string | null, categoryNames?: Record<string, string>): string {
  if (!catId) return 'Unknown';
  if (categoryNames && categoryNames[catId]) return categoryNames[catId];
  return 'Unknown';
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onDeleteMultiple,
  loading = false,
  categoryNames,
  categoryColors,
}: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-4 w-4 cursor-pointer rounded border-[var(--line)] accent-[var(--lagoon-deep)]"
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 cursor-pointer rounded border-[var(--line)] accent-[var(--lagoon-deep)]"
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        size: 40,
        enableSorting: false,
      },
      {
        id: 'date',
        accessorKey: 'date',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]"
          >
            Date
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-[var(--sea-ink-soft)]">
            {formatDate(row.original.date)}
          </span>
        ),
        sortingFn: 'datetime',
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const tx = row.original;
          const name = tx.description || getCategoryName(tx.category_id, categoryNames);
          return (
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs"
                style={{ backgroundColor: (categoryColors?.[tx.category_id ?? ''] || '#6b7280') + '20' }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: categoryColors?.[tx.category_id ?? ''] || '#6b7280' }}
                />
              </span>
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-medium text-[var(--sea-ink)]">
                  {name}
                </p>
                {tx.merchant && (
                  <p className="m-0 truncate text-xs text-[var(--sea-ink-soft)]">
                    {tx.merchant}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'category',
        accessorKey: 'category_id',
        header: 'Category',
        cell: ({ row }) => (
          <span className="text-sm text-[var(--sea-ink-soft)]">
            {getCategoryName(row.original.category_id, categoryNames)}
          </span>
        ),
      },
      {
        id: 'amount',
        accessorKey: 'amount',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]"
          >
            Amount
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const tx = row.original;
          const isExpense = tx.type === 'expense';
          const isIncome = tx.type === 'income';
          return (
            <span
              className={cn(
                'block text-right text-sm font-bold font-mono tabular-nums',
                isIncome
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isExpense
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-blue-500 dark:text-blue-400',
              )}
            >
              {isIncome ? '+' : isExpense ? '-' : ''}
              {formatCurrency(Math.abs(tx.amount))}
            </span>
          );
        },
        sortingFn: 'basic',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] opacity-0 transition hover:bg-[var(--line)] hover:text-[var(--sea-ink)] group-hover/row:opacity-100"
              aria-label="Edit"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete(row.original.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] opacity-0 transition hover:bg-red-500/10 hover:text-red-500 group-hover/row:opacity-100"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [onEdit, onDelete, categoryNames, categoryColors],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getRowId: (row) => row.id, // Use actual transaction UUID as row ID (not row index)
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  if (error) {
    return <ErrorState onRetry={() => setError(null)} />;
  }

  if (loading) {
    return (
      <div className="demo-table-shell !overflow-hidden">
        <div className="animate-pulse p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4 flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-[var(--line)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-[var(--line)]" />
                <div className="h-3 w-1/2 rounded bg-[var(--line)]" />
              </div>
              <div className="h-5 w-20 rounded bg-[var(--line)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="demo-table-shell">
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      {/* Batch actions bar */}
      <AnimatePresence>
        {selectedRowCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 flex items-center justify-between rounded-xl border border-[var(--lagoon)]/30 bg-[var(--lagoon)]/5 px-4 py-2"
          >
            <span className="text-sm font-medium text-[var(--sea-ink)]">
              {selectedRowCount} transaction{selectedRowCount !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              {onDeleteMultiple && (
                <button
                  type="button"
                  onClick={() => {
                    const ids = Object.keys(rowSelection);
                    onDeleteMultiple(ids);
                    setRowSelection({});
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Selected
                </button>
              )}
              <button
                type="button"
                onClick={() => setRowSelection({})}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink-soft)] transition hover:bg-[var(--line)]"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="demo-table-shell !rounded-xl">
        <table className="demo-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="group/row transition hover:bg-[color-mix(in_oklab,var(--lagoon),transparent_94%)]"
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
          <span>Rows per page</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="demo-select !w-auto !rounded-lg !py-1 text-xs"
            aria-label="Page size"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              transactions.length,
            )}{' '}
            of {transactions.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] transition hover:bg-[var(--line)] disabled:opacity-30"
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] transition hover:bg-[var(--line)] disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
            const currentPage = table.getState().pagination.pageIndex;
            const totalPages = table.getPageCount();
            let pageIndex: number;
            if (totalPages <= 5) {
              pageIndex = i;
            } else if (currentPage < 3) {
              pageIndex = i;
            } else if (currentPage > totalPages - 3) {
              pageIndex = totalPages - 5 + i;
            } else {
              pageIndex = currentPage - 2 + i;
            }
            return (
              <button
                key={pageIndex}
                type="button"
                onClick={() => table.setPageIndex(pageIndex)}
                className={cn(
                  'flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-semibold transition',
                  currentPage === pageIndex
                    ? 'bg-[var(--lagoon)]/15 text-[var(--lagoon-deep)]'
                    : 'text-[var(--sea-ink-soft)] hover:bg-[var(--line)]',
                )}
              >
                {pageIndex + 1}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] transition hover:bg-[var(--line)] disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] transition hover:bg-[var(--line)] disabled:opacity-30"
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
