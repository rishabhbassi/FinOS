// FinOS - Transaction Form (React Hook Form + Zod)

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Loader2,
  AlertCircle,
  ArrowRight,
  Banknote,
  ShoppingBag,
  ArrowLeftRight,
  Search,
} from 'lucide-react';
import type { Transaction } from '@/types/database';
import type { Category } from '@/types/database';
import type { Account } from '@/types/database';
import type { TransactionFormData } from '@/types/app';
import { getCategories } from '@/actions/categories';
import { createTransaction, updateTransaction, getAccounts } from '@/actions/transactions';
import { getTodayDateString, formatCurrency, cn } from '@/lib/utils';

const transactionSchema = z.object({
  amount: z.coerce.number({ message: 'Amount is required' })
    .positive('Amount must be positive')
    .finite('Invalid amount'),
  type: z.enum(['income', 'expense', 'transfer']),
  category_id: z.string().min(1, 'Category is required'),
  account_id: z.string().optional(),
  description: z.string().max(200, 'Description too long').optional().default(''),
  merchant: z.string().optional().default(''),
  date: z.string().min(1, 'Date is required'),
  tags: z.array(z.string()).optional().default([]),
});

type FormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
  onSuccess: () => void;
}

const TYPE_OPTIONS = [
  { value: 'expense' as const, label: 'Expense', icon: ShoppingBag },
  { value: 'income' as const, label: 'Income', icon: Banknote },
  { value: 'transfer' as const, label: 'Transfer', icon: ArrowLeftRight },
];

const CATEGORY_ICONS: Record<string, string> = {
  'cat-food': '🍔',
  'cat-groceries': '🛒',
  'cat-fuel': '⛽',
  'cat-rent': '🏠',
  'cat-electricity': '⚡',
  'cat-internet': '🌐',
  'cat-shopping': '🛍️',
  'cat-entertainment': '🎬',
  'cat-medical': '🏥',
  'cat-travel': '✈️',
  'cat-education': '🎓',
  'cat-gift': '🎁',
  'cat-subscription': '🔄',
  'cat-bills': '📄',
  'cat-emi': '💳',
  'cat-insurance': '🛡️',
  'cat-misc': '📌',
  'cat-salary': '💰',
  'cat-bonus': '🎯',
  'cat-freelancing': '💻',
  'cat-refund': '↩️',
  'cat-interest': '📈',
  'cat-dividend': '📊',
  'cat-other-income': '➕',
  'cat-transfer': '🔄',
};

export default function TransactionForm({
  open,
  onClose,
  transaction,
  onSuccess,
}: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);
  const [savedList, setSavedList] = useState<{ description: string; amount: number; type: string }[]>([]);
  const isEditing = !!transaction;

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      amount: 0,
      type: 'expense',
      category_id: '',
      account_id: '',
      description: '',
      merchant: '',
      date: getTodayDateString(),
      tags: [],
    },
  });

  const currentType = watch('type');
  const selectedCategory = watch('category_id');
  const [tagsInput, setTagsInput] = useState('');

  // Load data
  useEffect(() => {
    if (open) {
      getCategories().then(setCategories).catch(() => {});
      getAccounts().then(setAccounts).catch(() => {});
      setFormError(null);
      setTagsInput('');

      if (transaction) {
        reset({
          amount: Math.abs(transaction.amount),
          type: transaction.type,
          category_id: transaction.category_id ?? '',
          account_id: transaction.account_id ?? '',
          description: transaction.description ?? '',
          merchant: transaction.merchant ?? '',
          date: transaction.date,
          tags: transaction.tags ?? [],
        });
      } else {
        reset({
          amount: 0,
          type: 'expense',
          category_id: '',
          account_id: '',
          description: '',
          merchant: '',
          date: getTodayDateString(),
          tags: [],
        });
      }
    }
  }, [open, transaction, reset]);

  const filteredCategories = categories.filter((cat) => {
    if (currentType && cat.type !== currentType && cat.type !== 'transfer') return false;
    if (catSearch && !cat.name.toLowerCase().includes(catSearch.toLowerCase())) return false;
    return true;
  });

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagsInput.trim().toLowerCase();
      if (tag && !watch('tags')?.includes(tag)) {
        setValue('tags', [...(watch('tags') || []), tag]);
      }
      setTagsInput('');
    }
    if (e.key === 'Backspace' && !tagsInput && watch('tags')?.length) {
      const tags = watch('tags') || [];
      setValue('tags', tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setValue(
      'tags',
      (watch('tags') || []).filter((t: string) => t !== tag),
    );
  };

  // Save and optionally keep the form open for another
  const doSave = async (keepOpen: boolean) => {
    const data = getValues() as FormValues;
    const formData: TransactionFormData = {
      amount: data.amount,
      type: data.type,
      category_id: data.category_id,
      account_id: data.account_id || undefined,
      description: data.description ?? '',
      merchant: data.merchant ?? '',
      date: data.date,
      tags: data.tags ?? [],
    };

    setSubmitting(true);
    setFormError(null);
    try {
      if (isEditing && transaction) {
        await updateTransaction(transaction.id, formData);
        onSuccess();
        onClose();
        return;
      }
      await createTransaction(formData);
      if (keepOpen) {
        setQueuedCount((c) => c + 1);
        setSavedList((prev) => [...prev, { description: formData.description || 'Transaction', amount: formData.amount, type: formData.type }]);
        reset({
          amount: 0,
          type: watch('type'),
          category_id: '',
          account_id: '',
          description: '',
          merchant: '',
          date: getTodayDateString(),
          tags: [],
        });
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async () => { await doSave(false); };
  const handleSaveAndAdd = async () => { await doSave(true); };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
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
            className="relative z-10 mx-4 w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="demo-panel max-h-[85vh] overflow-y-auto !rounded-2xl !p-0 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                <h2 className="m-0 text-lg font-bold text-[var(--sea-ink)]">
                  {isEditing ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] hover:bg-[var(--line)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6 px-5 py-5">
                {/* Type + Amount row */}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="mb-2 block text-xs font-semibold text-[var(--sea-ink-soft)]">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--sea-ink-soft)]">₹</span>
                      <input
                        id="tx-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        autoFocus
                        className="demo-input !rounded-xl !pl-7 !pr-3 !text-lg !font-bold font-mono tabular-nums"
                        {...register('amount')}
                      />
                    </div>
                    {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
                  </div>
                  <div className="w-36 shrink-0">
                    <label className="mb-2 block text-xs font-semibold text-[var(--sea-ink-soft)]">Type</label>
                    <div className="flex overflow-hidden rounded-xl border border-[var(--line)]">
                      {TYPE_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = currentType === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setValue('type', opt.value)}
                            className={cn(
                              'flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-semibold transition',
                              isActive
                                ? opt.value === 'expense'
                                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                                  : opt.value === 'income'
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="tx-description" className="mb-2 block text-xs font-semibold text-[var(--sea-ink-soft)]">
                    Description
                  </label>
                  <input
                    id="tx-description"
                    type="text"
                    placeholder="What was this for?"
                    maxLength={200}
                    className="demo-input !rounded-xl"
                    {...register('description')}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                </div>

                {/* Category */}
                <div className="relative">
                  <label className="mb-2 block text-xs font-semibold text-[var(--sea-ink-soft)]">Category</label>
                  <button
                    type="button"
                    onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                    className="demo-input flex w-full items-center justify-between !rounded-xl"
                  >
                    {selectedCategory ? (
                      <span className="flex items-center gap-2">
                        <span style={{ color: categories.find(c => c.id === selectedCategory)?.color }}>
                          {CATEGORY_ICONS[selectedCategory] || '📌'}
                        </span>
                        <span>{categories.find((c) => c.id === selectedCategory)?.name || 'Select category'}</span>
                      </span>
                    ) : (
                      <span className="text-[var(--sea-ink-soft)]">Select a category</span>
                    )}
                    <Search className="h-4 w-4 text-[var(--sea-ink-soft)]" />
                  </button>
                  {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>}

                  {catDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-2 shadow-lg">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        className="demo-input mb-2 !rounded-lg !py-2 text-sm"
                        autoFocus
                      />
                      <div className="max-h-48 space-y-0.5 overflow-y-auto">
                        {filteredCategories.length === 0 ? (
                          <p className="py-3 text-center text-xs text-[var(--sea-ink-soft)]">No categories found</p>
                        ) : (
                          filteredCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => { setValue('category_id', cat.id); setCatDropdownOpen(false); setCatSearch(''); }}
                              className={cn(
                                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition',
                                selectedCategory === cat.id
                                  ? 'bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
                                  : 'hover:bg-[var(--line)]',
                              )}
                            >
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs" style={{ backgroundColor: cat.color + '20' }}>
                                <span style={{ color: cat.color }}>{CATEGORY_ICONS[cat.id] || '📌'}</span>
                              </span>
                              <span className="font-medium">{cat.name}</span>
                              <span className={cn('ml-auto text-[10px] font-semibold uppercase', cat.type === 'income' ? 'text-emerald-500' : 'text-red-400')}>{cat.type}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Date + Merchant row */}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label htmlFor="tx-date" className="mb-2 block text-xs font-semibold text-[var(--sea-ink-soft)]">Date</label>
                    <input id="tx-date" type="date" className="demo-input !rounded-xl" {...register('date')} />
                    {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="tx-merchant" className="mb-2 block text-xs font-semibold text-[var(--sea-ink-soft)]">{currentType === 'expense' ? 'Merchant' : 'Source'}</label>
                    <input id="tx-merchant" type="text" placeholder={currentType === 'expense' ? 'Where did you spend?' : 'Where from?'} className="demo-input !rounded-xl" {...register('merchant')} />
                  </div>
                </div>

                {/* Account */}
                <div>
                  <label htmlFor="tx-account" className="mb-2 block text-xs font-semibold text-[var(--sea-ink-soft)]">Account</label>
                  <select id="tx-account" className="demo-select !rounded-xl" {...register('account_id')}>
                    <option value="">Select an account</option>
                    {accounts.map((acc) => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[var(--sea-ink-soft)]">Tags</label>
                  <div className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong),transparent_20%)] p-2">
                    {(watch('tags') || []).map((tag: string) => (
                      <span key={tag} className="demo-pill !cursor-default">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                    <input type="text" placeholder={watch('tags')?.length ? 'Add tag...' : 'Type a tag and press Enter'} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} onKeyDown={handleTagsKeyDown} className="min-w-[80px] flex-1 border-none bg-transparent py-1 text-sm text-[var(--sea-ink)] outline-none placeholder:text-[var(--sea-ink-soft)]" />
                  </div>
                </div>

                {/* Form error */}
                {formError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="m-0 text-sm text-red-600 dark:text-red-400">{formError}</p>
                  </div>
                )}
              </div>

              {/* Recently added in this session */}
              {savedList.length > 0 && (
                <div className="mx-5 mb-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Added this session ({savedList.length})
                  </p>
                  <div className="max-h-28 space-y-1 overflow-y-auto">
                    {savedList.map((item, i) => (
                      <div
                        key={i}
                        className="group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition hover:bg-[var(--line)]"
                        onClick={() => {
                          // Fill form with saved item values for preview/edit
                          setValue('description', item.description === 'Transaction' ? '' : item.description);
                          setValue('amount', item.amount);
                          setValue('type', item.type as 'income' | 'expense');
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn(
                            'h-1.5 w-1.5 shrink-0 rounded-full',
                            item.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'
                          )} />
                          <span className="truncate font-medium text-[var(--sea-ink)]">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            'font-mono tabular-nums font-semibold',
                            item.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                          )}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </span>
                          <span className="text-[10px] text-[var(--sea-ink-soft)] opacity-0 transition group-hover:opacity-100">Edit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-4">
                <div className="flex items-center gap-2">
                  {queuedCount > 0 && (
                    <span className="demo-pill bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px]">
                      {queuedCount} saved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="demo-button demo-button-secondary !rounded-xl"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleSaveAndAdd}
                      disabled={submitting}
                      className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] text-lg font-bold text-[var(--sea-ink-soft)] transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-[var(--sea-ink)] px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100 whitespace-nowrap shadow-lg">
                        Save & add another
                      </span>
                      +
                    </button>
                  )}
                  <button
                    type="submit"
                    className="demo-button !rounded-xl !bg-[var(--lagoon-deep)] !text-white hover:!bg-[var(--lagoon-deep)]/90"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" />
                        {isEditing ? 'Update' : 'Save'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
