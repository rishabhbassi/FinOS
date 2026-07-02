import { motion } from 'motion/react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Briefcase,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Investment } from '@/types/database';

interface PortfolioSummaryProps {
  data: Investment[] | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

type AllocationEntry = { name: string; value: number; color: string };

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  sip: { label: 'SIP/MF', color: '#8b5cf6' },
  mutual_fund: { label: 'SIP/MF', color: '#8b5cf6' },
  stock: { label: 'Stocks', color: '#3b82f6' },
  fd: { label: 'FD', color: '#f97316' },
  ppf: { label: 'PPF', color: '#22c55e' },
  gold: { label: 'Gold', color: '#f59e0b' },
  crypto: { label: 'Crypto', color: '#ec4899' },
  other: { label: 'Other', color: '#64748b' },
};

function getAllocation(data: Investment[]): AllocationEntry[] {
  const grouped: Record<string, AllocationEntry> = {};
  for (const inv of data) {
    const config = TYPE_CONFIG[inv.type] ?? { label: 'Other', color: '#64748b' };
    if (!grouped[config.label]) {
      grouped[config.label] = { name: config.label, value: 0, color: config.color };
    }
    grouped[config.label].value += inv.current_value;
  }
  return Object.values(grouped).sort((a, b) => b.value - a.value);
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload as AllocationEntry;
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm shadow-lg backdrop-blur-md">
      <p className="font-semibold" style={{ color: entry.color }}>
        {entry.name}
      </p>
      <p className="font-semibold text-[var(--sea-ink)]">
        {formatCurrency(entry.value)}
      </p>
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
      {payload.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-1.5 text-xs font-medium text-[var(--sea-ink-soft)]">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="demo-panel grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <div className="fin-skeleton h-4 w-24" />
        <div className="fin-skeleton h-10 w-40" />
        <div className="fin-skeleton mt-4 h-4 w-24" />
        <div className="fin-skeleton h-10 w-40" />
        <div className="fin-skeleton mt-4 h-4 w-24" />
        <div className="fin-skeleton h-6 w-32" />
      </div>
      <div className="flex items-center justify-center">
        <div className="fin-skeleton h-48 w-48 rounded-full" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="demo-panel flex flex-col items-center justify-center gap-4 py-12 text-center">
      <AlertCircle className="h-10 w-10 text-red-500" />
      <p className="text-lg font-semibold text-red-600">Failed to load portfolio</p>
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
      className="demo-panel flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <Briefcase className="h-12 w-12 text-[var(--sea-ink-soft)] opacity-50" />
      <p className="text-lg font-semibold text-[var(--sea-ink)]">
        No investments tracked yet.
      </p>
      <p className="max-w-xs text-sm text-[var(--sea-ink-soft)]">
        Add your first investment to see your portfolio summary.
      </p>
    </motion.div>
  );
}

export default function PortfolioSummary({
  data,
  loading = false,
  error = null,
  onRetry,
}: PortfolioSummaryProps) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (loading) return <LoadingSkeleton />;
  if (!data || data.length === 0) return <EmptyState />;

  const totalInvested = data.reduce((sum, inv) => sum + inv.amount_invested, 0);
  const totalCurrent = data.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const allocation = getAllocation(data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="demo-panel"
    >
      <h2 className="demo-section-title mb-5">Portfolio Summary</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Summary numbers */}
        <div className="flex flex-col justify-center space-y-5">
          <div>
            <p className="fin-stat-label">Total Invested</p>
            <p className="fin-stat-value text-[var(--sea-ink)]">
              {formatCurrency(totalInvested)}
            </p>
          </div>
          <div>
            <p className="fin-stat-label">Current Value</p>
            <p className="fin-stat-value text-[var(--sea-ink)]">
              {formatCurrency(totalCurrent)}
            </p>
          </div>
          <div>
            <p className="fin-stat-label">Total Gain / Loss</p>
            <p
              className={cn(
                'fin-stat-value flex items-center gap-1.5',
                totalGain >= 0 ? 'text-green-600' : 'text-red-600',
              )}
            >
              {totalGain >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {formatCurrency(Math.abs(totalGain))}
              <span
                className={cn(
                  'ml-1 text-sm font-semibold',
                  totalGain >= 0 ? 'text-green-500' : 'text-red-500',
                )}
              >
                ({gainPct >= 0 ? '+' : ''}
                {gainPct.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>

        {/* Pie chart */}
        <div className="flex items-center justify-center">
          {allocation.length > 0 ? (
            <div className="w-full max-w-[260px]">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocation.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-[var(--sea-ink-soft)]">
              No allocation data
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
