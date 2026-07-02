// FinOS - Planner Summary
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { PlannerSummary as PlannerSummaryType } from '@/types/app';
import { formatCurrency, cn } from '@/lib/utils';

interface PlannerSummaryProps {
  summary: PlannerSummaryType | null;
  onScenarioChange: (isQuarterEnd: boolean) => void;
}

export function PlannerSummary({ summary, onScenarioChange }: PlannerSummaryProps) {
  const [isQuarterEnd, setIsQuarterEnd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleScenarioToggle() {
    const next = !isQuarterEnd;
    setIsQuarterEnd(next);
    onScenarioChange(next);
  }

  // Animated counter for projected savings
  const [displaySavings, setDisplaySavings] = useState(0);
  const prevSavings = useRef(0);

  useEffect(() => {
    if (summary === null) return;

    const target = summary.projectedSavings;
    const start = prevSavings.current;
    const duration = 800;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic bezier ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      setDisplaySavings(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    prevSavings.current = target;
    requestAnimationFrame(animate);
  }, [summary?.projectedSavings, summary]);

  // Error state
  if (error) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--sea-ink)]">
              Failed to load summary
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              onScenarioChange(isQuarterEnd);
            }}
            className="demo-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (summary === null) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-28 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
        <div className="mb-6 flex justify-center py-4">
          <div className="relative h-28 w-28">
            <div className="h-full w-full animate-pulse rounded-full bg-[var(--line)]" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3.5 w-24 animate-pulse rounded-full bg-[var(--line)]" />
              <div className="h-3.5 w-20 animate-pulse rounded-full bg-[var(--line)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isPositive = summary.projectedSavings >= 0;
  const savingsRatePct = Math.min(Math.max(summary.savingsRate, 0), 100);

  return (
    <motion.div
      className="demo-panel rounded-2xl p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      {/* Header with Scenario Toggle */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--sea-ink)]">Summary</h3>
        <button
          onClick={handleScenarioToggle}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-all',
            isQuarterEnd
              ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
              : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isQuarterEnd ? 'bg-[var(--lagoon)]' : 'bg-[var(--sea-ink-soft)]'
            )}
          />
          {isQuarterEnd ? 'Quarter-End' : 'Normal Month'}
        </button>
      </div>

      {/* Savings Ring */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative mb-3 h-28 w-28">
          {/* Conic gradient ring */}
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--line)"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={isPositive ? 'var(--lagoon)' : '#ef4444'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={2 * Math.PI * 42 * (1 - savingsRatePct / 100)}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 42 * (1 - savingsRatePct / 100),
              }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-extrabold text-[var(--sea-ink)] font-mono tabular-nums">
              {summary.savingsRate.toFixed(0)}%
            </span>
            <span className="text-[10px] text-[var(--sea-ink-soft)]">Saved</span>
          </div>
        </div>
      </div>

      {/* Projected Savings - prominent */}
      <div className="mb-5 text-center">
        <p className="text-xs text-[var(--sea-ink-soft)]">Projected Savings</p>
        <motion.p
          className={cn(
            'text-3xl font-extrabold tracking-tight font-mono tabular-nums',
            isPositive ? 'text-[var(--lagoon-deep)]' : 'text-red-500'
          )}
        >
          {formatCurrency(displaySavings)}
        </motion.p>
        {!isPositive && (
          <p className="mt-1 text-xs font-medium text-red-500">
            Overspending — review your budget
          </p>
        )}
      </div>

      {/* Summary rows */}
      <div className="space-y-2.5">
        <SummaryRow
          label="Total Income"
          value={formatCurrency(summary.totalIncome)}
          valueClass="text-[var(--lagoon-deep)]"
        />
        <SummaryRow
          label="Fixed Expenses"
          value={formatCurrency(summary.totalFixed)}
          valueClass="text-[var(--sea-ink)]"
        />
        <SummaryRow
          label="Variable Budget"
          value={formatCurrency(summary.totalVariable)}
          valueClass="text-[var(--sea-ink)]"
        />
        <div className="border-t border-[var(--line)] pt-2.5">
          <SummaryRow
            label="Daily Budget"
            value={formatCurrency(summary.dailyBudget)}
            valueClass="text-[var(--sea-ink)]"
          />
          <SummaryRow
            label="Weekly Budget"
            value={formatCurrency(summary.weeklyBudget)}
            valueClass="text-[var(--sea-ink)]"
          />
          {summary.remainingBudget !== summary.totalVariable && (
            <SummaryRow
              label="Remaining"
              value={formatCurrency(summary.remainingBudget)}
              valueClass={
                summary.remainingBudget >= 0
                  ? 'text-[var(--lagoon-deep)]'
                  : 'text-red-500'
              }
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SummaryRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--sea-ink-soft)]">{label}</span>
      <span
        className={cn(
          'text-xs font-semibold font-mono tabular-nums',
          valueClass ?? 'text-[var(--sea-ink)]'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default PlannerSummary;
