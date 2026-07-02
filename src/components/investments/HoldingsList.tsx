import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Landmark,
  Briefcase,
  Gem,
  CircleDollarSign,
  Wallet,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Investment } from '@/types/database';

interface HoldingsListProps {
  data: Investment[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEdit?: (investment: Investment) => void;
  onDelete?: (id: string) => void;
}

type SortState = { key: string; direction: 'asc' | 'desc' };

const TYPE_ICON: Record<string, LucideIcon> = {
  sip: Layers,
  mutual_fund: Layers,
  stock: TrendingUp,
  fd: Landmark,
  ppf: Briefcase,
  gold: Gem,
  crypto: CircleDollarSign,
  other: Wallet,
};

const TYPE_LABEL: Record<string, string> = {
  sip: 'SIP',
  mutual_fund: 'MF',
  stock: 'Stock',
  fd: 'FD',
  ppf: 'PPF',
  gold: 'Gold',
  crypto: 'Crypto',
  other: 'Other',
};

function getGainPct(inv: Investment): number {
  return inv.amount_invested > 0
    ? ((inv.current_value - inv.amount_invested) / inv.amount_invested) * 100
    : 0;
}

function getSortedData(data: Investment[], sort: SortState): Investment[] {
  return [...data].sort((a, b) => {
    let cmp = 0;
    switch (sort.key) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'type':
        cmp = a.type.localeCompare(b.type);
        break;
      case 'invested':
        cmp = a.amount_invested - b.amount_invested;
        break;
      case 'current':
        cmp = a.current_value - b.current_value;
        break;
      case 'gain':
        cmp = getGainPct(a) - getGainPct(b);
        break;
      default:
        cmp = 0;
    }
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

function SortIndicator({ columnKey, sort }: { columnKey: string; sort: SortState }) {
  if (sort.key !== columnKey) {
    return <ArrowUpDown className="ml-1 inline-block h-3 w-3 opacity-40" />;
  }
  return sort.direction === 'asc' ? (
    <ArrowUp className="ml-1 inline-block h-3 w-3 text-[var(--lagoon-deep)]" />
  ) : (
    <ArrowDown className="ml-1 inline-block h-3 w-3 text-[var(--lagoon-deep)]" />
  );
}

function LoadingSkeleton() {
  return (
    <div className="demo-table-shell">
      <table className="demo-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th className="hidden md:table-cell">Invested</th>
            <th>Current</th>
            <th className="hidden md:table-cell">Gain %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td><div className="fin-skeleton h-4 w-32" /></td>
              <td><div className="fin-skeleton h-6 w-16 rounded-full" /></td>
              <td className="hidden md:table-cell"><div className="fin-skeleton h-4 w-20" /></td>
              <td><div className="fin-skeleton h-4 w-20" /></td>
              <td className="hidden md:table-cell"><div className="fin-skeleton h-4 w-14" /></td>
              <td><div className="fin-skeleton h-7 w-14" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="demo-table-shell flex flex-col items-center justify-center gap-4 py-12 text-center">
      <AlertCircle className="h-10 w-10 text-red-500" />
      <p className="text-lg font-semibold text-red-600">Failed to load holdings</p>
      <p className="max-w-md text-sm text-[var(--sea-ink-soft)]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="demo-button">
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="demo-table-shell flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <Wallet className="h-12 w-12 text-[var(--sea-ink-soft)] opacity-50" />
      <p className="text-lg font-semibold text-[var(--sea-ink)]">No holdings</p>
      <p className="max-w-xs text-sm text-[var(--sea-ink-soft)]">
        Start investing to see your holdings here.
      </p>
    </motion.div>
  );
}

function HoldingsList({
  data,
  loading = false,
  error = null,
  onRetry,
  onEdit,
  onDelete,
}: HoldingsListProps) {
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'asc' });

  const sortedData = useMemo(() => getSortedData(data, sort), [data, sort]);

  function handleSort(key: string) {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  const columns = [
    { key: 'name', label: 'Name', always: true },
    { key: 'type', label: 'Type', always: true },
    { key: 'invested', label: 'Invested', desktop: true },
    { key: 'current', label: 'Current', always: true },
    { key: 'gain', label: 'Gain %', desktop: true },
  ];

  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (loading) return <LoadingSkeleton />;
  if (!data.length) return <EmptyState />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="demo-table-shell"
    >
      <table className="demo-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'cursor-pointer select-none whitespace-nowrap transition-colors hover:text-[var(--sea-ink)]',
                  col.desktop && 'hidden md:table-cell',
                )}
                onClick={() => handleSort(col.key)}
              >
                <span className="inline-flex items-center">
                  {col.label}
                  <SortIndicator columnKey={col.key} sort={sort} />
                </span>
              </th>
            ))}
            <th className="whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((inv, idx) => {
            const gainPct = getGainPct(inv);
            const IconComp = TYPE_ICON[inv.type] ?? Wallet;
            const typeName = TYPE_LABEL[inv.type] ?? 'Other';
            return (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
              >
                <td className="font-medium text-[var(--sea-ink)]">{inv.name}</td>
                <td>
                  <span className="demo-pill">
                    <IconComp className="h-3 w-3" />
                    <span>{typeName}</span>
                  </span>
                </td>
                <td className="hidden tabular-nums md:table-cell">
                  {formatCurrency(inv.amount_invested)}
                </td>
                <td className="tabular-nums font-semibold text-[var(--sea-ink)]">
                  {formatCurrency(inv.current_value)}
                </td>
                <td className="hidden md:table-cell">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 tabular-nums font-semibold',
                      gainPct >= 0 ? 'text-green-600' : 'text-red-600',
                    )}
                  >
                    {gainPct >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {gainPct >= 0 ? '+' : ''}
                    {gainPct.toFixed(1)}%
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(inv)}
                        className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition-colors hover:bg-[color-mix(in_oklab,var(--lagoon),transparent_80%)] hover:text-[var(--sea-ink)]"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(inv.id)}
                        className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition-colors hover:bg-red-100 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}

export { HoldingsList };
export default HoldingsList;
