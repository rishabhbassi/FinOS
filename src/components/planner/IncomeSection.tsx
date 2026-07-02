// Finance OS - Income Section
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, AlertCircle, RefreshCw, Wallet, X, Check } from 'lucide-react';
import type { PlannerIncomeEntry } from '@/types/app';
import { formatCurrency, cn, generateId } from '@/lib/utils';

interface IncomeSectionProps {
  entries: PlannerIncomeEntry[];
  onUpdate: (entries: PlannerIncomeEntry[]) => void;
}

const SOURCE_OPTIONS = ['Salary', 'Bonus', 'Freelancing', 'Interest', 'Other'];

const INCOME_PRESETS = [
  { name: 'Salary', amount: 60000 },
  { name: 'Bonus', amount: 10000 },
  { name: 'Freelancing', amount: 15000 },
  { name: 'Interest', amount: 2000 },
];

export function IncomeSection({ entries, onUpdate }: IncomeSectionProps) {
  const [localEntries, setLocalEntries] = useState<PlannerIncomeEntry[]>(entries);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const totalIncome = useMemo(
    () => localEntries.reduce((sum, e) => sum + e.planned, 0),
    [localEntries]
  );

  const totalActual = useMemo(
    () => localEntries.reduce((sum, e) => sum + e.actual, 0),
    [localEntries]
  );

  function handlePlannedChange(categoryId: string, value: string) {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      const updated = localEntries.map((e) =>
        e.categoryId === categoryId ? { ...e, planned: parsed } : e
      );
      setLocalEntries(updated);
      onUpdate(updated);
    }
  }

  function handleRemove(categoryId: string) {
    const updated = localEntries.filter((e) => e.categoryId !== categoryId);
    setLocalEntries(updated);
    onUpdate(updated);
  }

  function handleAdd(sourceName: string) {
    const exists = localEntries.some(
      (e) => e.categoryName.toLowerCase() === sourceName.toLowerCase()
    );
    if (exists) return;

    const newEntry: PlannerIncomeEntry = {
      categoryId: generateId(),
      categoryName: sourceName,
      planned: 0,
      actual: 0,
    };
    const updated = [...localEntries, newEntry];
    setLocalEntries(updated);
    onUpdate(updated);
    setError(null);
  }

  function handleAddFromPreset(name: string, amount: number) {
    const exists = localEntries.some(
      (e) => e.categoryName.toLowerCase() === name.toLowerCase()
    );
    if (exists) return;

    const newEntry: PlannerIncomeEntry = {
      categoryId: generateId(),
      categoryName: name,
      planned: amount,
      actual: 0,
    };
    const updated = [...localEntries, newEntry];
    setLocalEntries(updated);
    onUpdate(updated);
  }

  function handleAddCustom() {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) return;

    const exists = localEntries.some(
      (e) => e.categoryName.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return;

    const newEntry: PlannerIncomeEntry = {
      categoryId: generateId(),
      categoryName: trimmed,
      planned: parsedAmount,
      actual: 0,
    };
    const updated = [...localEntries, newEntry];
    setLocalEntries(updated);
    onUpdate(updated);
    setNewName('');
    setNewAmount('');
    setShowAddForm(false);
  }

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const defaults: PlannerIncomeEntry[] = [
        { categoryId: 'inc-salary', categoryName: 'Salary', planned: 59000, actual: 59000 },
        { categoryId: 'inc-bonus', categoryName: 'Bonus', planned: 0, actual: 0 },
        { categoryId: 'inc-freelance', categoryName: 'Freelancing', planned: 5000, actual: 3000 },
        { categoryId: 'inc-interest', categoryName: 'Interest', planned: 500, actual: 500 },
      ];
      setLocalEntries(defaults);
      onUpdate(defaults);
      setIsLoading(false);
    }, 600);
  }

  // Error state
  if (error) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--sea-ink)]">Failed to load income sources</p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{error}</p>
          </div>
          <button
            onClick={handleRetry}
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
  if (isLoading) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
            >
              <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--line)]" />
              <div className="h-8 flex-1 animate-pulse rounded-xl bg-[var(--line)]" />
              <div className="h-8 w-20 animate-pulse rounded-xl bg-[var(--line)]" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
          <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="h-6 w-28 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
      </div>
    );
  }

  // Empty state
  if (localEntries.length === 0) {
    return (
      <div className="demo-panel rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)]">
            <Wallet className="h-7 w-7 text-[var(--sea-ink-soft)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--sea-ink)]">
              No income sources added yet
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Add your salary, freelance, or other income sources to start planning.
            </p>
          </div>
          {SOURCE_OPTIONS.filter(
            (s) => !localEntries.some((e) => e.categoryName === s)
          ).length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {SOURCE_OPTIONS.filter(
                (s) => !localEntries.some((e) => e.categoryName === s)
              ).map((source) => (
                <button
                  key={source}
                  onClick={() => handleAdd(source)}
                  className="demo-button-secondary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {source}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="demo-panel rounded-2xl p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--sea-ink)]">Income Sources</h3>
        <div className="flex items-center gap-1.5">
          {showAddForm ? (
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewName('');
                setNewAmount('');
              }}
              className="demo-button-secondary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          ) : (
            <>
              {SOURCE_OPTIONS.filter(
                (s) => !localEntries.some((e) => e.categoryName === s)
              ).length > 0 && (
                <div className="group relative">
                  <button className="demo-button-secondary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold">
                    <Plus className="h-3.5 w-3.5" />
                    Preset
                  </button>
                  <div className="invisible absolute right-0 top-full z-10 mt-1 min-w-[160px] rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-1.5 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {SOURCE_OPTIONS.filter(
                      (s) => !localEntries.some((e) => e.categoryName === s)
                    ).map((source) => (
                      <button
                        key={source}
                        onClick={() => handleAdd(source)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-medium text-[var(--sea-ink)] transition hover:bg-[var(--surface)]"
                      >
                        {source}
                      </button>
                    ))}
                    {INCOME_PRESETS.filter(
                      (p) => !localEntries.some((e) => e.categoryName === p.name)
                    ).length > 0 && (
                      <>
                        <div className="my-1 border-t border-[var(--line)]" />
                        {INCOME_PRESETS.filter(
                          (p) => !localEntries.some((e) => e.categoryName === p.name)
                        ).map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => handleAddFromPreset(preset.name, preset.amount)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs font-medium text-[var(--sea-ink)] transition hover:bg-[var(--surface)]"
                          >
                            <span>{preset.name}</span>
                            <span className="font-mono tabular-nums text-[var(--sea-ink-soft)]">
                              {'₹'}{preset.amount.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="demo-button inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                Custom
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inline add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="inc-name">Income name</label>
                <input
                  id="inc-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Income name"
                  className="demo-input flex-1 rounded-xl px-3 py-2 text-xs font-medium"
                />
                <label className="sr-only" htmlFor="inc-amount">Income amount</label>
                <div className="relative flex-[0.6]">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--sea-ink-soft)]">
                    {'₹'}
                  </span>
                  <input
                    id="inc-amount"
                    type="number"
                    min={0}
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Amount"
                    className="demo-input w-full rounded-xl py-2 pl-7 pr-3 text-xs font-semibold font-mono tabular-nums"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewName('');
                    setNewAmount('');
                  }}
                  className="demo-button-secondary inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={!newName.trim() || isNaN(parseFloat(newAmount)) || parseFloat(newAmount) < 0}
                  className="demo-button inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  <Check className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {localEntries.map((entry, index) => (
          <motion.div
            key={entry.categoryId}
            className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="min-w-[80px] text-xs font-medium text-[var(--sea-ink)]">
              {entry.categoryName}
            </span>

            <div className="flex flex-1 items-center gap-2">
              <label className="sr-only" htmlFor={`planned-${entry.categoryId}`}>
                Planned amount for {entry.categoryName}
              </label>
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--sea-ink-soft)]">
                  {'₹'}
                </span>
                <input
                  id={`planned-${entry.categoryId}`}
                  type="number"
                  min={0}
                  value={entry.planned || ''}
                  onChange={(e) => handlePlannedChange(entry.categoryId, e.target.value)}
                  className="demo-input w-full rounded-xl py-2 pl-7 pr-3 text-xs font-semibold font-mono tabular-nums"
                  placeholder="0"
                />
              </div>
            </div>

            <span
              className={cn(
                'min-w-[64px] text-right text-xs font-semibold font-mono tabular-nums',
                entry.actual > 0
                  ? 'text-[var(--lagoon-deep)]'
                  : 'text-[var(--sea-ink-soft)]'
              )}
            >
              {formatCurrency(entry.actual)}
            </span>

            <button
              onClick={() => handleRemove(entry.categoryId)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              aria-label={`Remove ${entry.categoryName}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
        <span className="text-xs font-semibold text-[var(--sea-ink)]">
          Total Income
        </span>
        <div className="text-right">
          <p className="text-sm font-bold text-[var(--lagoon-deep)] font-mono tabular-nums">
            {formatCurrency(totalIncome)}
          </p>
          {totalActual !== totalIncome && (
            <p className="text-[10px] text-[var(--sea-ink-soft)] font-mono tabular-nums">
              Actual: {formatCurrency(totalActual)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default IncomeSection;
