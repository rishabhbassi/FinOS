// Finance OS - Quick Entry Modal (⌘K style)

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

const quickEntrySchema = z.object({
  input: z.string().min(1, 'Describe your transaction'),
});

type QuickEntryForm = z.infer<typeof quickEntrySchema>;

interface QuickEntryProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickEntry({ open, onClose, onSuccess }: QuickEntryProps) {
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [parsedDescription, setParsedDescription] = useState('');
  const [parsedAmount, setParsedAmount] = useState(0);
  const [parsedCategoryId, setParsedCategoryId] = useState<string | null>(null);
  const [parsedCategoryName, setParsedCategoryName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuickEntryForm>({
    resolver: zodResolver(quickEntrySchema) as any,
    defaultValues: { input: '' },
  });

  const inputValue = watch('input');

  // Load categories on mount
  useEffect(() => {
    if (open) {
      getCategories('expense').then(setCategories).catch(() => {});
    }
  }, [open]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setStep('input');
      setError(null);
      setValue('input', '');
    }
  }, [open, setValue]);

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

  // Parse natural language input
  const parseInput = useCallback(
    (text: string) => {
      // Try to extract amount (number) and description
      const amountMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
      const amount = amountMatch
        ? parseFloat(amountMatch[1].replace(/,/g, ''))
        : 0;
      const desc =
        text.replace(amountMatch?.[0] ?? '', '').trim() ||
        (amountMatch ? '' : text);

      // Try to auto-categorize
      const lowerDesc = desc.toLowerCase();
      let foundCategoryName: string | null = null;

      // Check each keyword in the description
      for (const [keyword, catName] of Object.entries(KEYWORD_MAP)) {
        if (lowerDesc.includes(keyword)) {
          foundCategoryName = catName;
          break;
        }
      }

      // Check second word for category (e.g., "lunch 450 food")
      const words = lowerDesc.split(/\s+/);
      for (const word of words) {
        if (KEYWORD_MAP[word]) {
          foundCategoryName = KEYWORD_MAP[word];
          break;
        }
      }

      // Resolve to real category ID from loaded categories
      let resolvedCategory = foundCategoryName
        ? findCategoryByName(foundCategoryName)
        : null;
      if (!resolvedCategory || !resolvedCategory.id) {
        resolvedCategory = firstExpenseCategory();
      }

      setParsedDescription(desc || (amount ? text : text));
      setParsedAmount(amount);
      setParsedCategoryId(resolvedCategory.id);
      setParsedCategoryName(resolvedCategory.name);
    },
    [findCategoryByName, firstExpenseCategory],
  );

  // Re-parse when input changes
  useEffect(() => {
    if (inputValue && step === 'input') {
      parseInput(inputValue);
    }
  }, [inputValue, step, parseInput]);

  const onSubmit = async () => {
    if (parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await transactionQueries.create({
        amount: parsedAmount,
        type: 'expense',
        category_id: parsedCategoryId,
        account_id: null,
        description: parsedDescription || null,
        merchant: null,
        date: getTodayDateString(),
        tags: [],
        is_recurring: false,
      });
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add transaction';
      // Provide a clearer message for foreign-key errors
      if (msg.includes('foreign key') || msg.includes('violates foreign')) {
        setError('Could not save: selected category may not exist. Please choose a category from the list.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (parsedAmount > 0) {
        onSubmit();
      }
    }
  };

  // Category icon picker — resolves from the loaded categories state by real UUID
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
    setParsedCategoryId(cat.id);
    setParsedCategoryName(cat.name);
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
                <div className="flex items-center gap-2">
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

              {/* Input area */}
              <div className="px-4 py-4">
                <div className="relative">
                  <input
                    {...register('input')}
                    ref={inputRef}
                    type="text"
                    placeholder='e.g. "Coffee 180" or "lunch 450 food"'
                    className="demo-input !rounded-xl !py-3 !pl-4 !pr-10 text-base"
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    aria-label="Describe your transaction"
                  />
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={parsedAmount <= 0 || submitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[var(--lagoon)] p-1.5 text-white transition hover:bg-[var(--lagoon-deep)] disabled:opacity-40"
                    aria-label="Submit"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.input && (
                  <p className="mt-1 text-xs text-red-500">{errors.input.message}</p>
                )}
              </div>

              {/* Preview */}
              {parsedAmount > 0 && step === 'input' && (
                <motion.div
                  className="mx-4 mb-3 rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--lagoon),transparent_92%)] p-3"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--lagoon)]/20 text-[var(--lagoon-deep)]">
                        {getCategoryIcon(parsedCategoryId)}
                      </span>
                      <div>
                        <p className="m-0 text-sm font-medium text-[var(--sea-ink)]">
                          {parsedDescription || 'Quick Entry'}
                        </p>
                        <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                          {parsedCategoryName}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-red-500">
                      -{formatCurrency(parsedAmount)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Category suggestions */}
              {inputValue && inputValue.length > 0 && (
                <div className="mx-4 mb-4">
                  <p className="mb-2 text-xs font-semibold text-[var(--sea-ink-soft)]">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.slice(0, 8).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => selectCategory(cat)}
                        className={cn(
                          'demo-pill cursor-pointer text-xs transition',
                          parsedCategoryId === cat.id
                            ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
                            : 'hover:border-[var(--lagoon)]/40',
                        )}
                      >
                        {getCategoryIcon(cat.id)}
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
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
                  Press <kbd className="rounded border border-[var(--line)] px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to add •{' '}
                  <kbd className="rounded border border-[var(--line)] px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to cancel
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
