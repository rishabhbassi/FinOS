// FinOS - Fixed Expenses Section
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, AlertCircle, RefreshCw, Check, X, Wallet } from 'lucide-react';
import type { PlannerExpenseEntry } from '@/types/app';
import { formatCurrency, cn, generateId } from '@/lib/utils';

interface FixedExpensesSectionProps {
  entries: PlannerExpenseEntry[];
  onUpdate: (entries: PlannerExpenseEntry[]) => void;
}

const PRESET_RECURRING = [
  { name: 'Rent', amount: 21000 },
  { name: 'Electricity', amount: 1200 },
  { name: 'Internet', amount: 1000 },
  { name: 'SIP', amount: 7000 },
];

export function FixedExpensesSection({ entries, onUpdate }: FixedExpensesSectionProps) {
  const [localEntries, setLocalEntries] = useState<PlannerExpenseEntry[]>(entries);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newRecurring, setNewRecurring] = useState(true);

  // Sync local state when parent entries change (e.g. when planner loads
  // recurring expenses via its own effect)
  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  const totalFixed = useMemo(
    () => localEntries.reduce((sum, e) => sum + e.planned, 0),
    [localEntries]
  );

  function handlePlannedChange(categoryId: string, value: string) {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      const updated = localEntries.map((e) =>
        e.categoryId === categoryId ? { ...e, planned: parsed, actual: parsed } : e
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

  function handleAddFromPreset(name: string, amount: number) {
    const exists = localEntries.some(
      (e) => e.categoryName.toLowerCase() === name.toLowerCase()
    );
    if (exists) return;

    const newEntry: PlannerExpenseEntry = {
      categoryId: generateId(),
      categoryName: name,
      planned: amount,
      actual: amount,
      isRecurring: true,
    };
    const updated = [...localEntries, newEntry];
    setLocalEntries(updated);
    onUpdate(updated);
  }

  function handleAddCustom() {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) return;

    const exists = localEntries.some(
      (e) => e.categoryName.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) return;

    const newEntry: PlannerExpenseEntry = {
      categoryId: generateId(),
      categoryName: trimmedName,
      planned: parsedAmount,
      actual: parsedAmount,
      isRecurring: newRecurring,
    };
    const updated = [...localEntries, newEntry];
    setLocalEntries(updated);
    onUpdate(updated);
    setNewName('');
    setNewAmount('');
    setNewRecurring(true);
    setShowAddForm(false);
  }

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const defaults: PlannerExpenseEntry[] = PRESET_RECURRING.map((p, i) => ({
        categoryId: `exp-${i}`,
        categoryName: p.name,
        planned: p.amount,
        actual: p.amount,
        isRecurring: true,
      }));
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
            <p className="text-sm font-semibold text-[var(--sea-ink)]">
              Failed to load fixed expenses
            </p>
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
          <div className="h-5 w-36 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
            >
              <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--line)]" />
              <div className="h-8 flex-1 animate-pulse rounded-xl bg-[var(--line)]" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--line)]" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
          <div className="h-4 w-28 animate-pulse rounded-full bg-[var(--line)]" />
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
              No fixed expenses added yet
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Add your rent, utilities, subscriptions, and other recurring costs.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESET_RECURRING.filter(
              (p) => !localEntries.some((e) => e.categoryName === p.name)
            ).map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleAddFromPreset(preset.name, preset.amount)}
                className="demo-button-secondary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                {preset.name}
              </button>
            ))}
            <button
              onClick={() => setShowAddForm(true)}
              className="demo-button inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Custom
            </button>
          </div>
          {showAddForm && (
            <motion.div
              className="mt-4 w-full max-w-xs rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <InlineAddForm
                name={newName}
                amount={newAmount}
                isRecurring={newRecurring}
                onNameChange={setNewName}
                onAmountChange={setNewAmount}
                onRecurringChange={setNewRecurring}
                onSave={handleAddCustom}
                onCancel={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewAmount('');
                }}
              />
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  const availablePresets = PRESET_RECURRING.filter(
    (p) => !localEntries.some((e) => e.categoryName === p.name)
  );

  return (
    <motion.div
      className="demo-panel rounded-2xl p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--sea-ink)]">Fixed Expenses</h3>
        <div className="flex items-center gap-1.5">
          {showAddForm ? (
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewName('');
                setNewAmount('');
              }}
              className="demo-button-secondary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              {availablePresets.length > 0 && (
                <div className="group relative">
                  <button className="demo-button-secondary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold">
                    <Plus className="h-3.5 w-3.5" />
                    Preset
                  </button>
                  <div className="invisible absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-1.5 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {availablePresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handleAddFromPreset(preset.name, preset.amount)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs font-medium text-[var(--sea-ink)] transition hover:bg-[var(--surface)]"
                      >
                        <span>{preset.name}</span>
                        <span className="font-mono tabular-nums text-[var(--sea-ink-soft)]">
                          {formatCurrency(preset.amount)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowAddForm(true)}
                className="demo-button inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Expense
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <InlineAddForm
              name={newName}
              amount={newAmount}
              isRecurring={newRecurring}
              onNameChange={setNewName}
              onAmountChange={setNewAmount}
              onRecurringChange={setNewRecurring}
              onSave={handleAddCustom}
              onCancel={() => {
                setShowAddForm(false);
                setNewName('');
                setNewAmount('');
              }}
            />
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
            <span className="min-w-[88px] text-xs font-medium text-[var(--sea-ink)]">
              {entry.categoryName}
            </span>

            <div className="flex flex-1 items-center gap-2">
              <label className="sr-only" htmlFor={`fixed-${entry.categoryId}`}>
                Planned amount for {entry.categoryName}
              </label>
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--sea-ink-soft)]">
                  {'₹'}
                </span>
                <input
                  id={`fixed-${entry.categoryId}`}
                  type="number"
                  min={0}
                  value={entry.planned || ''}
                  onChange={(e) => handlePlannedChange(entry.categoryId, e.target.value)}
                  className="demo-input w-full rounded-xl py-2 pl-7 pr-3 text-xs font-semibold font-mono tabular-nums"
                  placeholder="0"
                />
              </div>
            </div>

            {entry.isRecurring && (
              <span className="demo-pill whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                Recurring
              </span>
            )}

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
          Total Fixed Expenses
        </span>
        <span className="text-sm font-bold text-[var(--sea-ink)] font-mono tabular-nums">
          {formatCurrency(totalFixed)}
        </span>
      </div>
    </motion.div>
  );
}

// Inline add form sub-component
function InlineAddForm({
  name,
  amount,
  isRecurring,
  onNameChange,
  onAmountChange,
  onRecurringChange,
  onSave,
  onCancel,
}: {
  name: string;
  amount: string;
  isRecurring: boolean;
  onNameChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onRecurringChange: (v: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const trimmedName = name.trim();
  const parsedAmount = parseFloat(amount);
  const isValid = trimmedName.length > 0 && !isNaN(parsedAmount) && parsedAmount >= 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="expense-name">Expense name</label>
        <input
          id="expense-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Expense name"
          className="demo-input flex-1 rounded-xl px-3 py-2 text-xs font-medium"
        />
        <label className="sr-only" htmlFor="expense-amount">Expense amount</label>
        <div className="relative flex-[0.6]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--sea-ink-soft)]">
            {'₹'}
          </span>
          <input
            id="expense-amount"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="Amount"
            className="demo-input w-full rounded-xl py-2 pl-7 pr-3 text-xs font-semibold font-mono tabular-nums"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => onRecurringChange(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--line)] text-[var(--lagoon)] focus:ring-[var(--lagoon)]"
          />
          <span className="text-xs text-[var(--sea-ink-soft)]">Recurring</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="demo-button-secondary inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!isValid}
            className={cn(
              'demo-button inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold',
              !isValid && 'opacity-50'
            )}
          >
            <Check className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default FixedExpensesSection;
