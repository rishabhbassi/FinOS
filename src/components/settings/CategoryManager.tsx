import { useState } from 'react';
import {
  motion,
  AnimatePresence,
  Reorder,
} from 'motion/react';
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/database';

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
import {
  Briefcase,
  CircleDollarSign,
  Laptop,
  Landmark,
  Wallet,
  Utensils,
  Home,
  Zap,
  Wifi,
  ShoppingBag,
  Car,
  Film,
  HeartPulse,
  Plane,
  BookOpen,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  briefcase: Briefcase,
  circleDollarSign: CircleDollarSign,
  laptop: Laptop,
  landmark: Landmark,
  wallet: Wallet,
  utensils: Utensils,
  home: Home,
  zap: Zap,
  wifi: Wifi,
  shoppingBag: ShoppingBag,
  car: Car,
  film: Film,
  heartPulse: HeartPulse,
  plane: Plane,
  bookOpen: BookOpen,
};

const ICON_NAMES = Object.keys(ICON_MAP);

const PRESET_COLORS = [
  '#f97316',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#64748b',
];

// ---------------------------------------------------------------------------
// System categories
// ---------------------------------------------------------------------------
export const SYSTEM_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at'>[] = [
  { name: 'Salary', type: 'income', icon: 'briefcase', color: '#22c55e', is_system: true },
  { name: 'Bonus', type: 'income', icon: 'circleDollarSign', color: '#3b82f6', is_system: true },
  { name: 'Freelancing', type: 'income', icon: 'laptop', color: '#a855f7', is_system: true },
  { name: 'Interest', type: 'income', icon: 'landmark', color: '#f59e0b', is_system: true },
  { name: 'Other Income', type: 'income', icon: 'wallet', color: '#14b8a6', is_system: true },
  { name: 'Other', type: 'income', icon: 'wallet', color: '#64748b', is_system: false },
  { name: 'Food', type: 'expense', icon: 'utensils', color: '#f97316', is_system: true },
  { name: 'Rent', type: 'expense', icon: 'home', color: '#64748b', is_system: true },
  { name: 'Electricity', type: 'expense', icon: 'zap', color: '#f59e0b', is_system: true },
  { name: 'Internet', type: 'expense', icon: 'wifi', color: '#3b82f6', is_system: true },
  { name: 'Shopping', type: 'expense', icon: 'shoppingBag', color: '#ec4899', is_system: true },
  { name: 'Fuel', type: 'expense', icon: 'car', color: '#f97316', is_system: true },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#a855f7', is_system: true },
  { name: 'Medical', type: 'expense', icon: 'heartPulse', color: '#ec4899', is_system: true },
  { name: 'Travel', type: 'expense', icon: 'plane', color: '#3b82f6', is_system: true },
  { name: 'Education', type: 'expense', icon: 'bookOpen', color: '#14b8a6', is_system: true },
  { name: 'Other', type: 'expense', icon: 'wallet', color: '#64748b', is_system: false },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface CategoryManagerProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => void;
  onUpdate: (id: string, category: Partial<Category>) => void;
  onDelete: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function resolveIcon(iconName: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  return ICON_MAP[iconName] ?? Wallet;
}

function groupCategories(categories: Category[]) {
  const income = categories.filter((c) => c.type === 'income');
  const expense = categories.filter((c) => c.type === 'expense');
  return { income, expense };
}

const ADD_FORM_DEFAULTS = {
  name: '',
  type: 'expense' as 'income' | 'expense',
  icon: 'wallet',
  color: '#22c55e',
  is_system: false,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CategoryManager({
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState(ADD_FORM_DEFAULTS);
  const [editForm, setEditForm] = useState<{ name: string; icon: string; color: string }>({
    name: '',
    icon: 'wallet',
    color: '#22c55e',
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [incomeCollapsed, setIncomeCollapsed] = useState(false);
  const [expenseCollapsed, setExpenseCollapsed] = useState(false);

  const { income, expense } = groupCategories(categories);

  // ---- Reset add form ----
  function resetAddForm() {
    setAddForm(ADD_FORM_DEFAULTS);
    setAddError(null);
    setShowAddForm(false);
  }

  // ---- Handle add ----
  function handleAdd() {
    const trimmed = addForm.name.trim();
    if (!trimmed) {
      setAddError('Category name is required');
      return;
    }

    const exists = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.type === addForm.type,
    );
    if (exists) {
      setAddError('A category with this name already exists');
      return;
    }

    onAdd({
      name: trimmed,
      type: addForm.type,
      icon: addForm.icon,
      color: addForm.color,
      is_system: false,
    });
    resetAddForm();
  }

  // ---- Start editing ----
  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setEditError(null);
  }

  // ---- Handle edit ----
  function handleEdit(id: string) {
    const trimmed = editForm.name.trim();
    if (!trimmed) {
      setEditError('Category name is required');
      return;
    }

    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    const duplicate = categories.some(
      (c) =>
        c.id !== id &&
        c.name.toLowerCase() === trimmed.toLowerCase() &&
        c.type === cat.type,
    );
    if (duplicate) {
      setEditError('A category with this name already exists');
      return;
    }

    onUpdate(id, { name: trimmed, icon: editForm.icon, color: editForm.color });
    setEditingId(null);
    setEditError(null);
  }

  // ---- Cancel edit ----
  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  // ---- Render category row ----
  function renderCategoryRow(cat: Category) {
    const isEditing = editingId === cat.id;
    const isSystem = cat.is_system;
    const IconComp = resolveIcon(cat.icon);

    if (isEditing) {
      return (
        <motion.div
          key={`edit-${cat.id}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="demo-list-item space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                className="demo-input text-sm"
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                Icon
              </label>
              <select
                value={editForm.icon}
                onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))}
                className="demo-select text-sm"
              >
                {ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                Color
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, color: c }))}
                    className={cn(
                      'h-6 w-6 rounded-full border-2 transition',
                      editForm.color === c
                        ? 'border-[var(--sea-ink)] scale-110'
                        : 'border-transparent hover:scale-110',
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          {editError && (
            <p className="flex items-center gap-1 text-xs font-medium text-red-500">
              <AlertCircle className="h-3 w-3" /> {editError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleEdit(cat.id)}
              className="demo-button text-xs"
            >
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
        key={cat.id}
        className={cn(
          'demo-list-item flex items-center justify-between gap-3',
          isSystem ? 'opacity-80' : '',
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${cat.color}1a` }}
          >
            <IconComp className="h-4.5 w-4.5" style={{ color: cat.color } as React.CSSProperties} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                {cat.name}
              </span>
              {isSystem && (
                <Lock className="h-3 w-3 shrink-0 text-[var(--sea-ink-soft)]" />
              )}
            </div>
            <span className="text-xs text-[var(--sea-ink-soft)]">{cat.type}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className="inline-block h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: cat.color }}
          />

          <button
            type="button"
            onClick={() => startEdit(cat)}
            className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition hover:bg-[var(--chip-bg)] hover:text-[var(--sea-ink)]"
            aria-label={`Edit ${cat.name}`}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(cat.id)}
            disabled={isSystem}
            className={cn(
              'rounded-lg p-1.5 transition',
              isSystem
                ? 'cursor-not-allowed text-[var(--sea-ink-soft)]/40'
                : 'text-[var(--sea-ink-soft)] hover:bg-red-50 hover:text-red-600',
            )}
            aria-label={`Delete ${cat.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ---- Empty state ----
  function renderEmptyState(type: string) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[var(--line)] p-6 text-center">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          No {type} categories yet. Create one above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add category toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="demo-button text-sm"
        >
          {showAddForm ? (
            <>
              <ChevronUp className="h-4 w-4" /> Close
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Category
            </>
          )}
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
                  Name
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => {
                    setAddForm((f) => ({ ...f, name: e.target.value }));
                    setAddError(null);
                  }}
                  className="demo-input text-sm"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Type
                </label>
                <select
                  value={addForm.type}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      type: e.target.value as 'income' | 'expense',
                    }))
                  }
                  className="demo-select text-sm"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Icon
                </label>
                <select
                  value={addForm.icon}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, icon: e.target.value }))
                  }
                  className="demo-select text-sm"
                >
                  {ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink)]">
                  Color
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAddForm((f) => ({ ...f, color: c }))}
                      className={cn(
                        'h-6 w-6 rounded-full border-2 transition',
                        addForm.color === c
                          ? 'scale-110 border-[var(--sea-ink)]'
                          : 'border-transparent hover:scale-110',
                      )}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
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

      {/* Income section */}
      <div>
        <button
          type="button"
          onClick={() => setIncomeCollapsed((p) => !p)}
          className="mb-3 flex w-full items-center justify-between text-left"
        >
          <h4 className="text-sm font-bold text-[var(--sea-ink)]">
            Income Categories ({income.length})
          </h4>
          {incomeCollapsed ? (
            <ChevronDown className="h-4 w-4 text-[var(--sea-ink-soft)]" />
          ) : (
            <ChevronUp className="h-4 w-4 text-[var(--sea-ink-soft)]" />
          )}
        </button>
        <AnimatePresence initial={false}>
          {!incomeCollapsed && (
            <motion.div
              key="income-list"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Reorder.Group
                axis="y"
                values={income}
                onReorder={() => {/* reorder handled externally */}}
                className="space-y-2"
                as="div"
              >
                <AnimatePresence mode="popLayout">
                  {income.length === 0
                    ? renderEmptyState('income')
                    : income.map((cat) => (
                        <Reorder.Item key={cat.id} value={cat} as="span">
                          {renderCategoryRow(cat)}
                        </Reorder.Item>
                      ))}
                </AnimatePresence>
              </Reorder.Group>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expense section */}
      <div>
        <button
          type="button"
          onClick={() => setExpenseCollapsed((p) => !p)}
          className="mb-3 flex w-full items-center justify-between text-left"
        >
          <h4 className="text-sm font-bold text-[var(--sea-ink)]">
            Expense Categories ({expense.length})
          </h4>
          {expenseCollapsed ? (
            <ChevronDown className="h-4 w-4 text-[var(--sea-ink-soft)]" />
          ) : (
            <ChevronUp className="h-4 w-4 text-[var(--sea-ink-soft)]" />
          )}
        </button>
        <AnimatePresence initial={false}>
          {!expenseCollapsed && (
            <motion.div
              key="expense-list"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Reorder.Group
                axis="y"
                values={expense}
                onReorder={() => {/* reorder handled externally */}}
                className="space-y-2"
                as="div"
              >
                <AnimatePresence mode="popLayout">
                  {expense.length === 0
                    ? renderEmptyState('expense')
                    : expense.map((cat) => (
                        <Reorder.Item key={cat.id} value={cat} as="span">
                          {renderCategoryRow(cat)}
                        </Reorder.Item>
                      ))}
                </AnimatePresence>
              </Reorder.Group>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
