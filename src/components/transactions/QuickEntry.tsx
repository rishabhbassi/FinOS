// Finance OS - Quick Entry Modal (⌘K style)

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowUp,
  Sparkles,
  UtensilsCrossed,
  Fuel,
  ShoppingBasket,
  ShoppingBag,
  Clapperboard,
  HeartPulse,
  Plane,
  GraduationCap,
  Building,
  Zap,
  Wifi,
  CreditCard,
  Smartphone,
  Gift,
  Ellipsis,
  Loader2,
  Coffee,
  Car,
  Check,
} from 'lucide-react';
import type { Category } from '@/types/database';
import { transactionQueries } from '@/lib/supabase/queries';
import { getCategories } from '@/actions/categories';
import { formatCurrency, getTodayDateString, cn } from '@/lib/utils';

// Map category icon names (as stored in DB) to Quick Entry icon components
const QUICK_ICON_MAP: Record<string, React.ReactNode> = {
  utensils: <UtensilsCrossed className="h-4 w-4" />,
  car: <Fuel className="h-4 w-4" />,
  shoppingBag: <ShoppingBag className="h-4 w-4" />,
  film: <Clapperboard className="h-4 w-4" />,
  heartPulse: <HeartPulse className="h-4 w-4" />,
  plane: <Plane className="h-4 w-4" />,
  bookOpen: <GraduationCap className="h-4 w-4" />,
  home: <Building className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  wifi: <Wifi className="h-4 w-4" />,
  gift: <Gift className="h-4 w-4" />,
  wallet: <Ellipsis className="h-4 w-4" />,
  briefcase: <CreditCard className="h-4 w-4" />,
  circleDollarSign: <Smartphone className="h-4 w-4" />,
  laptop: <ShoppingBasket className="h-4 w-4" />,
  landmark: <Building className="h-4 w-4" />,
};

function QuickEntryIcon({ name }: { name: string }) {
  return QUICK_ICON_MAP[name] ?? <Ellipsis className="h-4 w-4" />;
}

// Keyword-to-category mapping for auto-categorization (maps to category name, not hardcoded IDs)
const KEYWORD_MAP: Record<string, string> = {
  coffee: 'Food',
  tea: 'Food',
  lunch: 'Food',
  dinner: 'Food',
  breakfast: 'Food',
  food: 'Food',
  pizza: 'Food',
  burger: 'Food',
  restaurant: 'Food',
  cafe: 'Food',
  grocery: 'Groceries',
  groceries: 'Groceries',
  supermarket: 'Groceries',
  fuel: 'Fuel',
  petrol: 'Fuel',
  diesel: 'Fuel',
  gas: 'Fuel',
  rent: 'Rent',
  shopping: 'Shopping',
  clothes: 'Shopping',
  shoes: 'Shopping',
  amazon: 'Shopping',
  movie: 'Entertainment',
  movies: 'Entertainment',
  netflix: 'Subscription',
  spotify: 'Subscription',
  subscription: 'Subscription',
  uber: 'Travel',
  cab: 'Travel',
  taxi: 'Travel',
  travel: 'Travel',
  bus: 'Travel',
  train: 'Travel',
  flight: 'Travel',
  medical: 'Medical',
  doctor: 'Medical',
  medicine: 'Medical',
  hospital: 'Medical',
  gym: 'Medical',
  gift: 'Gift',
  present: 'Gift',
  bill: 'Bills',
  electricity: 'Electricity',
  wifi: 'Internet',
  internet: 'Internet',
  mobile: 'Bills',
  phone: 'Bills',
  emi: 'EMI',
  loan: 'EMI',
  insurance: 'Insurance',
  course: 'Education',
  education: 'Education',
  udemy: 'Education',
  book: 'Education',
  salary: 'Salary',
  freelance: 'Freelancing',
  bonus: 'Bonus',
  transfer: 'Transfer',
};

const QUICK_PRESETS = [
  { label: 'Coffee', amount: 180, category: 'Food' },
  { label: 'Lunch', amount: 450, category: 'Food' },
  { label: 'Fuel', amount: 1000, category: 'Fuel' },
  { label: 'Movie', amount: 300, category: 'Entertainment' },
  { label: 'Groceries', amount: 1500, category: 'Groceries' },
  { label: 'Cab', amount: 200, category: 'Travel' },
];

const PRESET_ICON_MAP: Record<string, React.ReactNode> = {
  Coffee: <Coffee className="h-4 w-4" />,
  Lunch: <UtensilsCrossed className="h-4 w-4" />,
  Fuel: <Fuel className="h-4 w-4" />,
  Movie: <Clapperboard className="h-4 w-4" />,
  Groceries: <ShoppingBasket className="h-4 w-4" />,
  Cab: <Car className="h-4 w-4" />,
};

interface QuickEntryProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickEntry({ open, onClose, onSuccess }: QuickEntryProps) {
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDescription, setConfirmDescription] = useState('');
  const [confirmAmount, setConfirmAmount] = useState('');
  const [confirmCategoryId, setConfirmCategoryId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [sessionTxns, setSessionTxns] = useState<{ description: string; amount: number }[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load expense categories only (QuickEntry is expense-only)
  useEffect(() => {
    if (open) {
      getCategories('expense')
        .then(setCategories)
        .catch((err) => {
          console.error('QuickEntry: Failed to load categories', err);
        });
    }
  }, [open]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setStep('input');
      setError(null);
      setInputValue('');
      setSessionTxns([]);
    }
  }, [open]);

  // Find a category from the loaded list by name, case-insensitive
  const findCategoryByName = useCallback(
    (name: string): { id: string | null; name: string } => {
      const cat = categories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase(),
      );
      return cat ? { id: cat.id, name: cat.name } : { id: null, name };
    },
    [categories],
  );

  // Get the first expense category as a fallback
  const firstExpenseCategory = useCallback((): {
    id: string | null;
    name: string;
  } => {
    const cat = categories[0];
    return cat
      ? { id: cat.id, name: cat.name }
      : { id: null, name: 'Expense' };
  }, [categories]);

  // Parse text synchronously — no async state needed
  function parseInputSync(text: string) {
    const amountMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    const desc = text.replace(amountMatch?.[0] ?? '', '').trim() || (amountMatch ? '' : text);

    const lowerDesc = desc.toLowerCase();
    let foundCategoryName: string | null = null;
    for (const [keyword, catName] of Object.entries(KEYWORD_MAP)) {
      if (lowerDesc.includes(keyword)) { foundCategoryName = catName; break; }
    }
    if (!foundCategoryName) {
      const words = lowerDesc.split(/\s+/);
      for (const word of words) {
        if (KEYWORD_MAP[word]) { foundCategoryName = KEYWORD_MAP[word]; break; }
      }
    }

    let resolved = foundCategoryName ? findCategoryByName(foundCategoryName) : null;
    if (!resolved || !resolved.id) resolved = firstExpenseCategory();

    return { amount, description: desc, categoryId: resolved.id, categoryName: resolved.name };
  }

  // When a preset is clicked, either jump to confirm (single mode) or append to textarea (batch mode)
  const handlePresetClick = (preset: typeof QUICK_PRESETS[number]) => {
    if (batchMode) {
      const line = `${preset.label} ${preset.amount}`;
      setInputValue((prev) => (prev ? prev + '\n' : '') + line);
      setError(null);
      return;
    }
    setInputValue(`${preset.label} ${preset.amount}`);
    setConfirmDescription(preset.label);
    setConfirmAmount(String(preset.amount));
    const resolved = findCategoryByName(preset.category);
    setConfirmCategoryId(resolved.id);
    setStep('confirm');
    setError(null);
  };

  // Batch preview state for multi-line
  const [batchLines, setBatchLines] = useState<{ description: string; amount: number }[]>([]);
  const [showBatch, setShowBatch] = useState(false);

  // Keyboard shortcut: Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  function moveToConfirm() {
    const raw = inputRef.current?.value ?? '';
    if (!raw.trim()) return;
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);

    // Multi-line — show batch preview
    if (lines.length > 1) {
      const items: { description: string; amount: number }[] = [];
      for (const line of lines) {
        const parsed = parseInputSync(line);
        if (parsed.amount > 0) {
          items.push({ description: parsed.description || line, amount: parsed.amount });
        }
      }
      if (items.length === 0) {
        setError('No valid transactions found. Each line needs an amount (e.g. "lunch 450")');
        return;
      }
      setBatchLines(items);
      setShowBatch(true);
      setError(null);
      return;
    }

    // Single line — show confirm step
    const parsed = parseInputSync(raw);
    if (parsed.amount <= 0) {
      setError('Please include an amount (e.g. "lunch 450")');
      return;
    }
    setConfirmDescription(parsed.description || '');
    setConfirmAmount(String(parsed.amount));
    setConfirmCategoryId(parsed.categoryId);
    setStep('confirm');
    setError(null);
  }

  const handleBatchSubmitAll = async () => {
    if (batchLines.length === 0) return;
    setSubmitting(true);
    setError(null);
    let success = 0;
    for (const item of batchLines) {
      try {
        const parsed = parseInputSync(`${item.description} ${item.amount}`);
        await transactionQueries.create({
          amount: item.amount,
          type: 'expense',
          category_id: parsed.categoryId,
          account_id: null,
          description: item.description || null,
          merchant: null,
          date: getTodayDateString(),
          tags: [],
          is_recurring: false,
        });
        success++;
      } catch {
        // continue
      }
    }
    if (success === 0) {
      setError('Failed to add transactions');
      setSubmitting(false);
      return;
    }
    onSuccess();
    onClose();
  };

  // Live preview state — updates as user types
  const [livePreview, setLivePreview] = useState<{ desc: string; amount: number; catName: string } | null>(null);
  useEffect(() => {
    if (!batchMode && inputValue.trim() && step === 'input') {
      const parsed = parseInputSync(inputValue);
      if (parsed.amount > 0) {
        setLivePreview({ desc: parsed.description || inputValue, amount: parsed.amount, catName: parsed.categoryName });
      } else {
        setLivePreview(null);
      }
    } else {
      setLivePreview(null);
    }
  }, [inputValue, batchMode, step]);

  // Actually submit with the confirm-step values. If stayOpen is true, reset form after save.
  const handleConfirmSubmit = async (stayOpen?: boolean) => {
    const amount = parseFloat(confirmAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!confirmDescription.trim()) {
      setError('Please enter a description');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await transactionQueries.create({
        amount,
        type: 'expense',
        category_id: confirmCategoryId,
        account_id: null,
        description: confirmDescription.trim() || null,
        merchant: null,
        date: getTodayDateString(),
        tags: [],
        is_recurring: false,
      });
      if (stayOpen) {
        setSessionTxns((prev) => [...prev, { description: confirmDescription.trim() || 'Transaction', amount }]);
        // Reset for next transaction
        setConfirmDescription('');
        setConfirmAmount('');
        setInputValue('');
        setStep('input');
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('QuickEntry: Submit failed', err);
      const msg = err instanceof Error ? err.message : 'Failed to add transaction';
      if (msg.includes('foreign key') || msg.includes('violates foreign')) {
        setError('Could not save: selected category may not exist. Please choose a category from the list.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Category icon picker
  const getCategoryIcon = useCallback(
    (categoryId: string | null) => {
      if (!categoryId) return <Ellipsis className="h-4 w-4" />;
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) return <Ellipsis className="h-4 w-4" />;
      return <QuickEntryIcon name={cat.icon} />;
    },
    [categories],
  );

  const selectCategory = (cat: Category) => {
    setConfirmCategoryId(cat.id);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="demo-panel mx-4 overflow-hidden !rounded-2xl !p-0 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--lagoon-deep)]" />
                  <span className="text-sm font-semibold text-[var(--sea-ink)]">
                    Quick Add
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setBatchMode(!batchMode); setError(null); setStep('input'); }}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-[10px] font-semibold transition',
                      batchMode
                        ? 'bg-[var(--lagoon)]/15 text-[var(--lagoon-deep)]'
                        : 'text-[var(--sea-ink-soft)] hover:bg-[var(--line)]'
                    )}
                  >
                    Batch
                  </button>
                  {sessionTxns.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { onSuccess(); onClose(); }}
                      className="rounded-lg bg-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-sm transition hover:bg-emerald-600"
                    >
                      Done
                    </button>
                  )}
                  <span className="demo-pill text-[10px]">⌘K</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] hover:bg-[var(--line)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="px-4 py-4">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (batchMode) {
                          // In batch mode, just parse and preview
                          moveToConfirm();
                        } else {
                          // Single mode: go to confirm or batch preview for multi-line
                          const raw = inputRef.current?.value ?? '';
                          const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
                          if (lines.length > 0) moveToConfirm();
                        }
                      }
                    }}
                    placeholder={batchMode ? 'lunch 450\ncoffee 180\nuber 200' : 'e.g. "Coffee 180" or "lunch 450 food"'}
                    rows={batchMode ? 4 : (inputValue.includes('\n') ? 4 : 1)}
                    className="demo-input !rounded-xl !py-3.5 !pl-4 !pr-12 text-base resize-none min-h-[3.2rem]"
                    aria-label="Describe your transaction"
                  />
                  <button
                    type="button"
                    onClick={moveToConfirm}
                    disabled={submitting || categories.length === 0}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[var(--lagoon)] p-1.5 text-white shadow-sm transition hover:bg-[var(--lagoon-deep)] disabled:opacity-40"
                    aria-label="Submit"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : batchMode || inputValue.includes('\n') ? (
                      <span className="text-base font-bold leading-none">+</span>
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Live preview — shows as you type in single mode */}
              {livePreview && !batchMode && step === 'input' && (
                <motion.div
                  className="mx-4 mb-3 rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--lagoon),transparent_92%)] p-3"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--lagoon)]/20 text-[var(--lagoon-deep)]">
                        {getCategoryIcon(confirmCategoryId || findCategoryByName(livePreview.catName).id)}
                      </span>
                      <div>
                        <p className="m-0 text-sm font-medium text-[var(--sea-ink)]">
                          {livePreview.desc}
                        </p>
                        <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                          {livePreview.catName}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-red-500">
                      -{formatCurrency(livePreview.amount)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Session transactions — individual list with summary */}
              {sessionTxns.length > 0 && (
                <div className="mx-4 mb-4 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)] px-0.5">
                    This session ({sessionTxns.length})
                  </p>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {sessionTxns.map((tx, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-[color-mix(in_oklab,var(--lagoon),transparent_94%)] px-3 py-2 text-xs">
                        <span className="truncate font-medium text-[var(--sea-ink)]">{tx.description}</span>
                        <span className="ml-2 shrink-0 font-mono tabular-nums font-semibold text-red-500">
                          -{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-0.5 pt-0.5">
                    <span className="text-[10px] text-[var(--sea-ink-soft)]">Total</span>
                    <span className="font-mono tabular-nums text-xs font-bold text-red-500">
                      -{formatCurrency(sessionTxns.reduce((s, t) => s + t.amount, 0))}
                    </span>
                  </div>
                </div>
              )}

              {/* Multi-line batch preview */}
              {showBatch && batchLines.length > 0 && (
                <motion.div
                  className="mx-4 mb-4 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--lagoon),transparent_92%)] px-4 py-2.5">
                    <span className="text-xs font-semibold text-[var(--sea-ink)]">
                      {batchLines.length} transactions
                    </span>
                    <span className="text-xs font-semibold text-red-500 font-mono tabular-nums">
                      -{formatCurrency(batchLines.reduce((s, i) => s + i.amount, 0))}
                    </span>
                  </div>
                  <div className="max-h-40 space-y-1 overflow-y-auto p-3">
                    {batchLines.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-[color-mix(in_oklab,var(--lagoon),transparent_94%)] px-3 py-2">
                        <span className="truncate text-xs font-medium text-[var(--sea-ink)]">{item.description}</span>
                        <span className="ml-2 shrink-0 text-xs font-semibold text-red-500 font-mono tabular-nums">-{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => { setShowBatch(false); setError(null); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)]"
                    >
                      <X className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchSubmitAll}
                      disabled={submitting}
                      className="demo-button inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Add All ({batchLines.length})
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Quick Presets — always visible in batch mode */}
              {(batchMode || !inputValue) && categories.length > 0 && step === 'input' && !showBatch && (
                <div className="mx-4 mb-4">
                  <p className="mb-2 text-xs font-semibold text-[var(--sea-ink-soft)]">
                    Quick Expense
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className="demo-pill cursor-pointer text-xs transition hover:border-[var(--lagoon)]/40"
                      >
                        {PRESET_ICON_MAP[preset.label] ?? <Ellipsis className="h-4 w-4" />}
                        {preset.label} {formatCurrency(preset.amount)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm step — single transaction */}
              {step === 'confirm' && !showBatch && (
                <motion.div
                  className="mx-4 mb-4 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Preview bar */}
                  <div className="flex items-center gap-3 bg-[color-mix(in_oklab,var(--lagoon),transparent_92%)] px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--lagoon)]/20 text-[var(--lagoon-deep)]">
                      {getCategoryIcon(confirmCategoryId)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                          {confirmDescription || 'Transaction'}
                        </p>
                        <span className="demo-pill bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 px-1.5 py-0 text-[9px]">
                          EXPENSE
                        </span>
                      </div>
                      <p className="text-xs text-[var(--sea-ink-soft)]">
                        {categories.find(c => c.id === confirmCategoryId)?.name || 'Select category'}
                      </p>
                    </div>
                    <span className="text-lg font-bold font-mono text-red-500 font-mono tabular-nums">
                      -{formatCurrency(parseFloat(confirmAmount) || 0)}
                    </span>
                  </div>

                  {/* Editable fields */}
                  <div className="space-y-4 p-4">
                    {/* Description + Amount row */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">Description</label>
                        <input
                          type="text"
                          value={confirmDescription}
                          onChange={(e) => setConfirmDescription(e.target.value)}
                          placeholder="What was this for?"
                          className="demo-input text-sm"
                        />
                      </div>
                      <div className="w-32 shrink-0">
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">Amount</label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--sea-ink-soft)]">₹</span>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={confirmAmount}
                            onChange={(e) => setConfirmAmount(e.target.value)}
                            placeholder="0"
                            className="demo-input w-full pl-6 pr-2.5 text-sm font-bold font-mono tabular-nums"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category selector */}
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">Category</label>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.slice(0, 8).map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => selectCategory(cat)}
                            className={cn(
                              'demo-pill cursor-pointer text-xs transition',
                              confirmCategoryId === cat.id
                                ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
                                : 'border-transparent hover:border-[var(--lagoon)]/40',
                            )}
                          >
                            {getCategoryIcon(cat.id)}
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
                      <button
                        type="button"
                        onClick={() => { setStep('input'); setError(null); }}
                        disabled={submitting}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--sea-ink-soft)] transition hover:bg-[var(--line)]"
                      >
                        <X className="h-3.5 w-3.5" /> Back
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmSubmit(true)}
                          disabled={submitting || !confirmAmount || parseFloat(confirmAmount) <= 0}
                          className="demo-button-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm"
                        >
                          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '+'}
                          Add Another
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmSubmit(false)}
                          disabled={submitting || !confirmAmount || parseFloat(confirmAmount) <= 0}
                          className="demo-button inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <div className="mx-4 mb-4 rounded-lg bg-red-500/10 px-3 py-2">
                  <p className="m-0 text-xs text-red-500">{error}</p>
                </div>
              )}

              {/* Footer hint */}
              <div className="border-t border-[var(--line)] px-4 py-2.5">
                <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                  <kbd className="rounded border border-[var(--line)] px-1 py-0.5 font-mono text-[10px]">Enter</kbd> {batchMode ? 'to add to batch' : 'to continue'} • <kbd className="rounded border border-[var(--line)] px-1 py-0.5 font-mono text-[10px]">Shift+Enter</kbd> new line • <kbd className="rounded border border-[var(--line)] px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to cancel
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
