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
import { getCategories } from '@/actions/categories';
import { createTransaction } from '@/actions/transactions';
import { formatCurrency, getTodayDateString, cn } from '@/lib/utils';

// Keyword-to-category mapping for auto-categorization
const KEYWORD_MAP: Record<string, { categoryId: string; categoryName: string }> = {
  coffee: { categoryId: 'cat-food', categoryName: 'Food' },
  tea: { categoryId: 'cat-food', categoryName: 'Food' },
  lunch: { categoryId: 'cat-food', categoryName: 'Food' },
  dinner: { categoryId: 'cat-food', categoryName: 'Food' },
  breakfast: { categoryId: 'cat-food', categoryName: 'Food' },
  food: { categoryId: 'cat-food', categoryName: 'Food' },
  pizza: { categoryId: 'cat-food', categoryName: 'Food' },
  burger: { categoryId: 'cat-food', categoryName: 'Food' },
  restaurant: { categoryId: 'cat-food', categoryName: 'Food' },
  cafe: { categoryId: 'cat-food', categoryName: 'Food' },
  grocery: { categoryId: 'cat-groceries', categoryName: 'Groceries' },
  groceries: { categoryId: 'cat-groceries', categoryName: 'Groceries' },
  supermarket: { categoryId: 'cat-groceries', categoryName: 'Groceries' },
  fuel: { categoryId: 'cat-fuel', categoryName: 'Fuel' },
  petrol: { categoryId: 'cat-fuel', categoryName: 'Fuel' },
  diesel: { categoryId: 'cat-fuel', categoryName: 'Fuel' },
  gas: { categoryId: 'cat-fuel', categoryName: 'Fuel' },
  rent: { categoryId: 'cat-rent', categoryName: 'Rent' },
  shopping: { categoryId: 'cat-shopping', categoryName: 'Shopping' },
  clothes: { categoryId: 'cat-shopping', categoryName: 'Shopping' },
  shoes: { categoryId: 'cat-shopping', categoryName: 'Shopping' },
  amazon: { categoryId: 'cat-shopping', categoryName: 'Shopping' },
  movie: { categoryId: 'cat-entertainment', categoryName: 'Entertainment' },
  movies: { categoryId: 'cat-entertainment', categoryName: 'Entertainment' },
  netflix: { categoryId: 'cat-subscription', categoryName: 'Subscription' },
  spotify: { categoryId: 'cat-subscription', categoryName: 'Subscription' },
  subscription: { categoryId: 'cat-subscription', categoryName: 'Subscription' },
  uber: { categoryId: 'cat-travel', categoryName: 'Travel' },
  cab: { categoryId: 'cat-travel', categoryName: 'Travel' },
  taxi: { categoryId: 'cat-travel', categoryName: 'Travel' },
  travel: { categoryId: 'cat-travel', categoryName: 'Travel' },
  bus: { categoryId: 'cat-travel', categoryName: 'Travel' },
  train: { categoryId: 'cat-travel', categoryName: 'Travel' },
  flight: { categoryId: 'cat-travel', categoryName: 'Travel' },
  medical: { categoryId: 'cat-medical', categoryName: 'Medical' },
  doctor: { categoryId: 'cat-medical', categoryName: 'Medical' },
  medicine: { categoryId: 'cat-medical', categoryName: 'Medical' },
  hospital: { categoryId: 'cat-medical', categoryName: 'Medical' },
  gym: { categoryId: 'cat-medical', categoryName: 'Medical' },
  gift: { categoryId: 'cat-gift', categoryName: 'Gift' },
  present: { categoryId: 'cat-gift', categoryName: 'Gift' },
  bill: { categoryId: 'cat-bills', categoryName: 'Bills' },
  electricity: { categoryId: 'cat-electricity', categoryName: 'Electricity' },
  wifi: { categoryId: 'cat-internet', categoryName: 'Internet' },
  internet: { categoryId: 'cat-internet', categoryName: 'Internet' },
  mobile: { categoryId: 'cat-bills', categoryName: 'Bills' },
  phone: { categoryId: 'cat-bills', categoryName: 'Bills' },
  emi: { categoryId: 'cat-emi', categoryName: 'EMI' },
  loan: { categoryId: 'cat-emi', categoryName: 'EMI' },
  insurance: { categoryId: 'cat-insurance', categoryName: 'Insurance' },
  course: { categoryId: 'cat-education', categoryName: 'Education' },
  education: { categoryId: 'cat-education', categoryName: 'Education' },
  udemy: { categoryId: 'cat-education', categoryName: 'Education' },
  book: { categoryId: 'cat-education', categoryName: 'Education' },
  salary: { categoryId: 'cat-salary', categoryName: 'Salary' },
  freelance: { categoryId: 'cat-freelancing', categoryName: 'Freelancing' },
  bonus: { categoryId: 'cat-bonus', categoryName: 'Bonus' },
  transfer: { categoryId: 'cat-transfer', categoryName: 'Transfer' },
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
  const [parsedCategoryId, setParsedCategoryId] = useState('cat-food');
  const [parsedCategoryName, setParsedCategoryName] = useState('Food');
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

  // Keyboard shortcut listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) {
          onClose();
        } else {
          onClose(); // toggle won't work here, parent controls open state
        }
      }
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Parse natural language input
  const parseInput = useCallback(
    (text: string) => {
      // Try to extract amount (number) and description
      const amountMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
      const desc = text.replace(amountMatch?.[0] ?? '', '').trim() || (amountMatch ? '' : text);

      // Try to auto-categorize
      const lowerDesc = desc.toLowerCase();
      let foundCategory = KEYWORD_MAP['food'];

      // Check each keyword in the description
      for (const [keyword, cat] of Object.entries(KEYWORD_MAP)) {
        if (lowerDesc.includes(keyword)) {
          foundCategory = cat;
          break;
        }
      }

      // Check second word for category (e.g., "lunch 450 food")
      const words = lowerDesc.split(/\s+/);
      for (const word of words) {
        if (KEYWORD_MAP[word]) {
          foundCategory = KEYWORD_MAP[word];
          break;
        }
      }

      setParsedDescription(desc || (amount ? text : text));
      setParsedAmount(amount);
      setParsedCategoryId(foundCategory.categoryId);
      setParsedCategoryName(foundCategory.categoryName);
    },
    [],
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
      await createTransaction({
        amount: parsedAmount,
        type: 'expense',
        category_id: parsedCategoryId,
        description: parsedDescription,
        merchant: '',
        date: getTodayDateString(),
        tags: [],
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
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

  // Category icon picker
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'cat-food': <UtensilsCrossed className="h-4 w-4" />,
      'cat-groceries': <ShoppingBasket className="h-4 w-4" />,
      'cat-fuel': <Fuel className="h-4 w-4" />,
      'cat-shopping': <ShoppingBag className="h-4 w-4" />,
      'cat-entertainment': <Clapperboard className="h-4 w-4" />,
      'cat-medical': <HeartPulse className="h-4 w-4" />,
      'cat-travel': <Plane className="h-4 w-4" />,
      'cat-education': <GraduationCap className="h-4 w-4" />,
      'cat-rent': <Building className="h-4 w-4" />,
      'cat-electricity': <Zap className="h-4 w-4" />,
      'cat-internet': <Wifi className="h-4 w-4" />,
      'cat-emi': <CreditCard className="h-4 w-4" />,
      'cat-bills': <Smartphone className="h-4 w-4" />,
      'cat-insurance': <HeartPulse className="h-4 w-4" />,
      'cat-subscription': <CreditCard className="h-4 w-4" />,
      'cat-gift': <Gift className="h-4 w-4" />,
      'cat-misc': <Ellipsis className="h-4 w-4" />,
    };
    return iconMap[categoryId] || <Ellipsis className="h-4 w-4" />;
  };

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
