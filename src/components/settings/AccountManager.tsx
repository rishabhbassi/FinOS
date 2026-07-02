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
  CreditCard,
  Landmark,
  Wallet,
  Smartphone,
  CircleDollarSign,
  Star,
  AlertCircle,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { ACCOUNT_TYPES } from '@/lib/constants';
import type { Account } from '@/types/database';

// ---------------------------------------------------------------------------
// Account type icon map
// ---------------------------------------------------------------------------
const ACCOUNT_TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  savings: Landmark,
  current: Landmark,
  credit: CreditCard,
  cash: Wallet,
  wallet: CircleDollarSign,
  upi: Smartphone,
};

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  savings: 'Savings Account',
  current: 'Current Account',
  credit: 'Credit Card',
  cash: 'Cash Wallet',
  wallet: 'Digital Wallet',
  upi: 'UPI / Payment App',
};

// ---------------------------------------------------------------------------
// Typed defaults
// ---------------------------------------------------------------------------
interface AddFormState {
  name: string;
  type: Account['type'];
  balance: string;
  credit_limit: string;
  billing_date: string;
  due_date: string;
  is_active: boolean;
}

const ADD_FORM_DEFAULTS: AddFormState = {
  name: '',
  type: 'savings',
  balance: '',
  credit_limit: '',
  billing_date: '',
  due_date: '',
  is_active: true,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface AccountManagerProps {
  accounts: Account[];
  onAdd: (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onUpdate: (id: string, account: Partial<Account>) => void;
  onDelete: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function AccountManager({
  accounts,
  onAdd,
  onUpdate,
  onDelete,
}: AccountManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<AddFormState>(ADD_FORM_DEFAULTS);
  const [editForm, setEditForm] = useState<AddFormState>(ADD_FORM_DEFAULTS);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const isCreditType = (t: string) => t === 'credit';

  // ---- Reset add form ----
  function resetAddForm() {
    setAddForm(ADD_FORM_DEFAULTS);
    setAddError(null);
    setShowAddForm(false);
  }

  // ---- Validate account form ----
  function validateForm(
    form: AddFormState,
    existingAccounts: Account[],
    excludeId?: string,
  ): string | null {
    const trimmed = form.name.trim();
    if (!trimmed) return 'Account name is required';

    const duplicate = existingAccounts.some(
      (a) => a.name.toLowerCase() === trimmed.toLowerCase() && a.id !== excludeId,
    );
    if (duplicate) return 'An account with this name already exists';

    const balanceNum = parseFloat(form.balance);
    if (isNaN(balanceNum)) return 'Please enter a valid balance';

    if (form.type === 'credit') {
      const limitNum = parseFloat(form.credit_limit);
      if (isNaN(limitNum) || limitNum <= 0) return 'Please enter a valid credit limit';

      if (!form.billing_date) return 'Billing date is required for credit cards';
      const bd = parseInt(form.billing_date, 10);
      if (bd < 1 || bd > 31) return 'Billing date must be between 1 and 31';

      if (!form.due_date) return 'Due date is required for credit cards';
      const dd = parseInt(form.due_date, 10);
      if (dd < 1 || dd > 31) return 'Due date must be between 1 and 31';
    }

    return null;
  }

  // ---- Parse form to account payload ----
  function formToPayload(
    form: AddFormState,
  ): Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
      name: form.name.trim(),
      type: form.type,
      balance: parseFloat(form.balance) || 0,
      credit_limit: isCreditType(form.type) ? parseFloat(form.credit_limit) || 0 : null,
      billing_date: isCreditType(form.type) ? parseInt(form.billing_date, 10) || null : null,
      due_date: isCreditType(form.type) ? parseInt(form.due_date, 10) || null : null,
      is_active: form.is_active,
    };
  }

  // ---- Handle add ----
  function handleAdd() {
    const err = validateForm(addForm, accounts);
    if (err) {
      setAddError(err);
      return;
    }
    onAdd(formToPayload(addForm));
    resetAddForm();
  }

  // ---- Start editing ----
  function startEdit(acc: Account) {
    setEditingId(acc.id);
    setEditForm({
      name: acc.name,
      type: acc.type,
      balance: String(acc.balance),
      credit_limit: acc.credit_limit != null ? String(acc.credit_limit) : '',
      billing_date: acc.billing_date != null ? String(acc.billing_date) : '',
      due_date: acc.due_date != null ? String(acc.due_date) : '',
      is_active: acc.is_active,
    });
    setEditError(null);
  }

  // ---- Handle edit ----
  function handleEdit(id: string) {
    const err = validateForm(editForm, accounts, id);
    if (err) {
      setEditError(err);
      return;
    }
    onUpdate(id, {
      ...formToPayload(editForm),
      id: undefined,
      user_id: undefined,
      created_at: undefined,
      updated_at: undefined,
    });
    setEditingId(null);
    setEditError(null);
  }

  // ---- Cancel edit ----
  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  // ---- Balance display color ----
  function balanceColor(acc: Account): string {
    if (acc.type === 'credit') return 'text-red-500';
    return acc.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500';
  }

  // ---- Render account row ----
  function renderAccountRow(acc: Account) {
    const isEditing = editingId === acc.id;
    const IconComp = ACCOUNT_TYPE_ICON[acc.type] ?? Landmark;

    if (isEditing) {
      return (
        <motion.div
          key={`edit-${acc.id}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="demo-list-item space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">Type</label>
              <select
                value={editForm.type}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    type: e.target.value as Account['type'],
                    credit_limit: e.target.value === 'credit' ? f.credit_limit : '',
                    billing_date: e.target.value === 'credit' ? f.billing_date : '',
                    due_date: e.target.value === 'credit' ? f.due_date : '',
                  }))
                }
                className="demo-select text-sm"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ACCOUNT_TYPE_LABEL[t] ?? t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                Balance
              </label>
              <input
                type="number"
                value={editForm.balance}
                onChange={(e) => setEditForm((f) => ({ ...f, balance: e.target.value }))}
                className="demo-input text-sm"
                step="any"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                Active
              </label>
              <button
                type="button"
                onClick={() => setEditForm((f) => ({ ...f, is_active: !f.is_active }))}
                className="mt-1 flex items-center gap-2 rounded-lg p-2 text-sm transition hover:bg-[var(--chip-bg)]"
              >
                {editForm.is_active ? (
                  <ToggleRightIcon className="h-5 w-5 text-emerald-500" />
                ) : (
                  <ToggleLeftIcon className="h-5 w-5 text-[var(--sea-ink-soft)]" />
                )}
                <span className="text-[var(--sea-ink)]">
                  {editForm.is_active ? 'Active' : 'Inactive'}
                </span>
              </button>
            </div>
          </div>

          {isCreditType(editForm.type) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Credit Limit
                </label>
                <input
                  type="number"
                  value={editForm.credit_limit}
                  onChange={(e) => setEditForm((f) => ({ ...f, credit_limit: e.target.value }))}
                  className="demo-input text-sm"
                  step="any"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Billing Date (day of month)
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={editForm.billing_date}
                  onChange={(e) => setEditForm((f) => ({ ...f, billing_date: e.target.value }))}
                  className="demo-input text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Due Date (day of month)
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={editForm.due_date}
                  onChange={(e) => setEditForm((f) => ({ ...f, due_date: e.target.value }))}
                  className="demo-input text-sm"
                />
              </div>
            </div>
          )}

          {editError && (
            <p className="flex items-center gap-1 text-xs font-medium text-red-500">
              <AlertCircle className="h-3 w-3" /> {editError}
            </p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => handleEdit(acc.id)} className="demo-button text-xs">
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
        key={acc.id}
        className={cn(
          'demo-list-item flex items-center justify-between gap-3',
          !acc.is_active && 'opacity-55',
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--lagoon),transparent_85%)]">
            <IconComp className="h-4.5 w-4.5 text-[var(--lagoon-deep)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                {acc.name}
              </span>
              {/* Default indicator */}
              {(acc.type === 'savings' || acc.type === 'current') && acc.balance > 0 && (
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-label="Default account" />
              )}
            </div>
            <span className="text-xs text-[var(--sea-ink-soft)]">
              {ACCOUNT_TYPE_LABEL[acc.type] ?? acc.type}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {!acc.is_active && (
            <span className="demo-pill text-xs">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--sea-ink-soft)]" />
              Inactive
            </span>
          )}
          <span
            className={cn(
              'text-right text-sm font-bold font-mono tabular-nums',
              balanceColor(acc),
            )}
          >
            {formatCurrency(acc.balance)}
          </span>

          <button
            type="button"
            onClick={() => startEdit(acc)}
            className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition hover:bg-[var(--chip-bg)] hover:text-[var(--sea-ink)]"
            aria-label={`Edit ${acc.name}`}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(acc.id)}
            className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${acc.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ---- Empty state ----
  if (accounts.length === 0 && !showAddForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            No accounts yet. Add your first account to get started.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="demo-button text-sm"
          >
            <Plus className="h-4 w-4" /> Add Account
          </button>
        </div>
        <div className="rounded-xl border-2 border-dashed border-[var(--line)] p-10 text-center">
          <Landmark className="mx-auto h-10 w-10 text-[var(--sea-ink-soft)]/50" />
          <p className="mt-2 text-sm font-medium text-[var(--sea-ink-soft)]">
            No accounts found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Manage your bank accounts, credit cards, and payment apps.
        </p>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="demo-button text-sm"
        >
          <Plus className="h-4 w-4" /> {showAddForm ? 'Close' : 'Add Account'}
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Account Name
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => {
                    setAddForm((f) => ({ ...f, name: e.target.value }));
                    setAddError(null);
                  }}
                  className="demo-input text-sm"
                  placeholder="e.g. HDFC Savings"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Account Type
                </label>
                <select
                  value={addForm.type}
                  onChange={(e) => {
                    const t = e.target.value as Account['type'];
                    setAddForm((f) => ({
                      ...f,
                      type: t,
                      credit_limit: t === 'credit' ? f.credit_limit : '',
                      billing_date: t === 'credit' ? f.billing_date : '',
                      due_date: t === 'credit' ? f.due_date : '',
                    }));
                    setAddError(null);
                  }}
                  className="demo-select text-sm"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {ACCOUNT_TYPE_LABEL[t] ?? t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Balance
                </label>
                <input
                  type="number"
                  value={addForm.balance}
                  onChange={(e) => {
                    setAddForm((f) => ({ ...f, balance: e.target.value }));
                    setAddError(null);
                  }}
                  className="demo-input text-sm"
                  step="any"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Status
                </label>
                <button
                  type="button"
                  onClick={() => setAddForm((f) => ({ ...f, is_active: !f.is_active }))}
                  className="mt-1 flex items-center gap-2 rounded-lg p-2 text-sm transition hover:bg-[var(--chip-bg)]"
                >
                  {addForm.is_active ? (
                    <ToggleRightIcon className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ToggleLeftIcon className="h-5 w-5 text-[var(--sea-ink-soft)]" />
                  )}
                  <span className="text-[var(--sea-ink)]">
                    {addForm.is_active ? 'Active' : 'Inactive'}
                  </span>
                </button>
              </div>
            </div>

            {isCreditType(addForm.type) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                    Credit Limit
                  </label>
                  <input
                    type="number"
                    value={addForm.credit_limit}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, credit_limit: e.target.value }))
                    }
                    className="demo-input text-sm"
                    step="any"
                    placeholder="e.g. 150000"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                    Billing Date (day of month)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={addForm.billing_date}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, billing_date: e.target.value }))
                    }
                    className="demo-input text-sm"
                    placeholder="e.g. 5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                    Due Date (day of month)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={addForm.due_date}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, due_date: e.target.value }))
                    }
                    className="demo-input text-sm"
                    placeholder="e.g. 25"
                  />
                </div>
              </div>
            )}

            {addError && (
              <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                <AlertCircle className="h-3 w-3" /> {addError}
              </p>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={handleAdd} className="demo-button text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Account
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

      {/* Account list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {accounts.map((acc) => (
            <motion.div
              key={acc.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderAccountRow(acc)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline ToggleLeft / ToggleRight icon components for static rendering
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

export default AccountManager;
export { AccountManager };
