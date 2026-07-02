import { useState } from 'react';
import {
  motion,
  AnimatePresence,
} from 'motion/react';
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  CalendarDays,
  Repeat,
  AlertCircle,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { FREQUENCY_OPTIONS } from '@/lib/constants';
import type { RecurringExpense } from '@/types/database';

// ---------------------------------------------------------------------------
// Frequency label map
// ---------------------------------------------------------------------------
const FREQUENCY_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  weekly: 'Weekly',
};

// ---------------------------------------------------------------------------
// Category options for recurring (simplified inline list)
// ---------------------------------------------------------------------------
const RECURRING_CATEGORIES = [
  'Rent',
  'Electricity',
  'Internet',
  'SIP',
  'Entertainment',
  'Misc',
  'Food',
  'Fuel',
  'Insurance',
  'EMI',
  'Subscription',
];

// ---------------------------------------------------------------------------
// Add form defaults
// ---------------------------------------------------------------------------
interface AddFormState {
  name: string;
  category: string;
  amount: string;
  frequency: RecurringExpense['frequency'];
  day_of_month: string;
  is_active: boolean;
}

const ADD_FORM_DEFAULTS: AddFormState = {
  name: '',
  category: 'Rent',
  amount: '',
  frequency: 'monthly',
  day_of_month: '1',
  is_active: true,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface RecurringManagerProps {
  expenses: RecurringExpense[];
  onAdd: (expense: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at'>) => void;
  onUpdate: (id: string, expense: Partial<RecurringExpense>) => void;
  onDelete: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helper: compute next occurrence date for display
// ---------------------------------------------------------------------------
function getNextOccurrence(expense: RecurringExpense): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const day = expense.day_of_month ?? 1;

  let nextDate: Date;

  switch (expense.frequency) {
    case 'weekly': {
      // Next occurrence from current day_of_week or day_of_month
      const dayOfWeek = expense.day_of_week ?? 1;
      const diff = (dayOfWeek - now.getDay() + 7) % 7;
      nextDate = new Date(now);
      nextDate.setDate(now.getDate() + (diff === 0 ? 7 : diff));
      break;
    }
    case 'monthly': {
      nextDate = new Date(currentYear, currentMonth, day);
      if (nextDate <= now) {
        nextDate = new Date(currentYear, currentMonth + 1, day);
      }
      break;
    }
    case 'quarterly': {
      const quarterMonth = Math.floor(currentMonth / 3) * 3;
      nextDate = new Date(currentYear, quarterMonth, day);
      if (nextDate <= now) {
        nextDate = new Date(currentYear, quarterMonth + 3, day);
      }
      break;
    }
    case 'yearly': {
      nextDate = new Date(currentYear, 0, day);
      if (nextDate <= now) {
        nextDate = new Date(currentYear + 1, 0, day);
      }
      break;
    }
    default: {
      nextDate = new Date(currentYear, currentMonth, day);
      if (nextDate <= now) {
        nextDate = new Date(currentYear, currentMonth + 1, day);
      }
    }
  }

  return nextDate;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function RecurringManager({
  expenses,
  onAdd,
  onUpdate,
  onDelete,
}: RecurringManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<AddFormState>(ADD_FORM_DEFAULTS);
  const [editForm, setEditForm] = useState<AddFormState>(ADD_FORM_DEFAULTS);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const activeExpenses = expenses.filter((e) => e.is_active);
  const inactiveExpenses = expenses.filter((e) => !e.is_active);

  // ---- Reset add form ----
  function resetAddForm() {
    setAddForm(ADD_FORM_DEFAULTS);
    setAddError(null);
    setShowAddForm(false);
  }

  // ---- Validate form ----
  function validateForm(form: AddFormState, existing: RecurringExpense[], excludeId?: string): string | null {
    if (!form.name.trim()) return 'Expense name is required';
    const duplicate = existing.some(
      (e) => e.name.toLowerCase() === form.name.trim().toLowerCase() && e.id !== excludeId,
    );
    if (duplicate) return 'An expense with this name already exists';
    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) return 'Please enter a valid amount greater than 0';
    const day = parseInt(form.day_of_month, 10);
    if (isNaN(day) || day < 1 || day > 31) return 'Day of month must be between 1 and 31';
    return null;
  }

  // ---- Form to payload ----
  function formToPayload(
    form: AddFormState,
  ): Omit<RecurringExpense, 'id' | 'user_id' | 'created_at'> {
    return {
      name: form.name.trim(),
      category_id: form.category,
      amount: parseFloat(form.amount) || 0,
      frequency: form.frequency,
      day_of_month: parseInt(form.day_of_month, 10) || 1,
      day_of_week: form.frequency === 'weekly' ? parseInt(form.day_of_month, 10) || 1 : null,
      account_id: null,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };
  }

  // ---- Handle add ----
  function handleAdd() {
    const err = validateForm(addForm, expenses);
    if (err) {
      setAddError(err);
      return;
    }
    onAdd(formToPayload(addForm));
    resetAddForm();
  }

  // ---- Start editing ----
  function startEdit(expense: RecurringExpense) {
    setEditingId(expense.id);
    setEditForm({
      name: expense.name,
      category: expense.category_id ?? '',
      amount: String(expense.amount),
      frequency: expense.frequency,
      day_of_month: String(expense.day_of_month ?? 1),
      is_active: expense.is_active,
    });
    setEditError(null);
  }

  // ---- Handle edit ----
  function handleEdit(id: string) {
    const err = validateForm(editForm, expenses, id);
    if (err) {
      setEditError(err);
      return;
    }
    onUpdate(id, formToPayload(editForm));
    setEditingId(null);
    setEditError(null);
  }

  // ---- Cancel edit ----
  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  // ---- Toggle active ----
  function toggleActive(expense: RecurringExpense) {
    onUpdate(expense.id, { is_active: !expense.is_active });
  }

  // ---- Render expense row ----
  function renderExpenseRow(expense: RecurringExpense) {
    const isEditing = editingId === expense.id;
    const nextDate = getNextOccurrence(expense);
    const frequencyLabel = FREQUENCY_LABEL[expense.frequency] ?? expense.frequency;

    if (isEditing) {
      return (
        <motion.div
          key={`edit-${expense.id}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="demo-list-item space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="demo-input text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                className="demo-select text-sm"
              >
                {RECURRING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">Amount</label>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                className="demo-input text-sm"
                step="any"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">Frequency</label>
              <select
                value={editForm.frequency}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    frequency: e.target.value as RecurringExpense['frequency'],
                  }))
                }
                className="demo-select text-sm"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                Day of Month
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={editForm.day_of_month}
                onChange={(e) => setEditForm((f) => ({ ...f, day_of_month: e.target.value }))}
                className="demo-input text-sm"
              />
            </div>
          </div>

          {editError && (
            <p className="flex items-center gap-1 text-xs font-medium text-red-500">
              <AlertCircle className="h-3 w-3" /> {editError}
            </p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => handleEdit(expense.id)} className="demo-button text-xs">
              <Check className="h-3.5 w-3.5" /> Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="demo-button demo-button-secondary text-xs"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div
        key={expense.id}
        className={cn(
          'demo-list-item flex items-center justify-between gap-3 transition',
          !expense.is_active && 'opacity-50',
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--lagoon),transparent_85%)]">
            <Repeat className="h-4.5 w-4.5 text-[var(--lagoon-deep)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                {expense.name}
              </span>
              {!expense.is_active && (
                <span className="demo-pill text-[0.6rem] px-1.5 py-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--sea-ink-soft)]" />
                  Inactive
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
              {expense.category_id && <span>{expense.category_id}</span>}
              <CalendarDays className="h-3 w-3" />
              <span>Day {expense.day_of_month ?? 1}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-right text-sm font-bold tabular-nums text-[var(--sea-ink)]">
            {formatCurrency(expense.amount)}
          </span>

          <span className="hidden text-xs font-semibold text-[var(--sea-ink-soft)] sm:block">
            {frequencyLabel}
          </span>

          <span className="hidden text-xs text-[var(--sea-ink-soft)] lg:block">
            Next: {formatDate(nextDate)}
          </span>

          <button
            type="button"
            onClick={() => toggleActive(expense)}
            className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition hover:bg-[var(--chip-bg)]"
            aria-label={`Toggle ${expense.name}`}
          >
            {expense.is_active ? (
              <ToggleRightIcon className="h-4.5 w-4.5 text-emerald-500" />
            ) : (
              <ToggleLeftIcon className="h-4.5 w-4.5 text-[var(--sea-ink-soft)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => startEdit(expense)}
            className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition hover:bg-[var(--chip-bg)] hover:text-[var(--sea-ink)]"
            aria-label={`Edit ${expense.name}`}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(expense.id)}
            className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${expense.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ---- Empty state ----
  if (expenses.length === 0 && !showAddForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            No recurring expenses yet. Add your regular payments here.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="demo-button text-sm"
          >
            <Plus className="h-4 w-4" /> Add Recurring
          </button>
        </div>
        <div className="rounded-xl border-2 border-dashed border-[var(--line)] p-10 text-center">
          <Repeat className="mx-auto h-10 w-10 text-[var(--sea-ink-soft)]/50" />
          <p className="mt-2 text-sm font-medium text-[var(--sea-ink-soft)]">
            No recurring expenses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Manage your recurring bills, subscriptions, and periodic payments.
        </p>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="demo-button text-sm"
        >
          <Plus className="h-4 w-4" /> {showAddForm ? 'Close' : 'Add'}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="demo-list-item space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Expense Name
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => {
                    setAddForm((f) => ({ ...f, name: e.target.value }));
                    setAddError(null);
                  }}
                  className="demo-input text-sm"
                  placeholder="e.g. Netflix"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Category
                </label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
                  className="demo-select text-sm"
                >
                  {RECURRING_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Amount
                </label>
                <input
                  type="number"
                  value={addForm.amount}
                  onChange={(e) => {
                    setAddForm((f) => ({ ...f, amount: e.target.value }));
                    setAddError(null);
                  }}
                  className="demo-input text-sm"
                  step="any"
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Frequency
                </label>
                <select
                  value={addForm.frequency}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      frequency: e.target.value as RecurringExpense['frequency'],
                    }))
                  }
                  className="demo-select text-sm"
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Day of Month
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={addForm.day_of_month}
                  onChange={(e) => {
                    setAddForm((f) => ({ ...f, day_of_month: e.target.value }));
                    setAddError(null);
                  }}
                  className="demo-input text-sm"
                  placeholder="e.g. 15"
                />
              </div>
            </div>

            {addError && (
              <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                <AlertCircle className="h-3 w-3" /> {addError}
              </p>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={handleAdd} className="demo-button text-xs">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
              <button
                type="button"
                onClick={resetAddForm}
                className="demo-button demo-button-secondary text-xs"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active expenses */}
      {activeExpenses.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-bold text-[var(--sea-ink)]">
            Active ({activeExpenses.length})
          </h4>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {activeExpenses.map((exp) => (
                <motion.div
                  key={exp.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderExpenseRow(exp)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Inactive expenses */}
      {inactiveExpenses.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-bold text-[var(--sea-ink-soft)]">
            Inactive ({inactiveExpenses.length})
          </h4>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {inactiveExpenses.map((exp) => (
                <motion.div
                  key={exp.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderExpenseRow(exp)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline toggle icons
// ---------------------------------------------------------------------------
function ToggleLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="8" cy="12" r="3" />
    </svg>
  );
}

function ToggleRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="16" cy="12" r="3" />
    </svg>
  );
}

export { RecurringManager };

