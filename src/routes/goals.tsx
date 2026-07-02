import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Target,
  Plus,
  X,
  PiggyBank,
  Car,
  Plane,
  Home,
  Wallet,
  Gem,
  Briefcase,
  Landmark,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import GoalsGrid from '@/components/goals/GoalsGrid';
import { goalQueries } from '@/lib/supabase/queries';
import type { Goal } from '@/types/database';

export const Route = createFileRoute('/goals')({
  component: GoalsPage,
});

// Form defaults
const FORM_DEFAULTS = {
  name: '',
  target_amount: 0,
  current_amount: 0,
  deadline: '',
  monthly_contribution: 0,
  icon: 'Target',
  color: '#3b82f6',
};

type GoalFormData = typeof FORM_DEFAULTS;

const GOAL_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'Car', icon: Car },
  { name: 'Plane', icon: Plane },
  { name: 'Home', icon: Home },
  { name: 'Target', icon: Target },
  { name: 'Wallet', icon: Wallet },
  { name: 'Gem', icon: Gem },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Landmark', icon: Landmark },
  { name: 'CircleDollarSign', icon: CircleDollarSign },
];

const GOAL_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f97316',
  '#a855f7',
  '#ec4899',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
  '#6366f1',
];

function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(FORM_DEFAULTS);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Fetch goals from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchGoals() {
      setLoading(true);
      setError(null);
      try {
        const data = await goalQueries.list();
        if (!cancelled) setGoals(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load goals');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchGoals();
    return () => { cancelled = true; };
  }, []);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalQueries.list();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  const openAddModal = useCallback(() => {
    setEditingGoalId(null);
    setForm(FORM_DEFAULTS);
    setFormError(null);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((goal: Goal) => {
    setEditingGoalId(goal.id);
    setForm({
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline ?? '',
      monthly_contribution: goal.monthly_contribution ?? 0,
      icon: goal.icon,
      color: goal.color,
    });
    setFormError(null);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingGoalId(null);
    setForm(FORM_DEFAULTS);
    setFormError(null);
  }, []);

  const handleSaveGoal = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      if (!form.name.trim()) {
        setFormError('Goal name is required');
        return;
      }
      if (form.target_amount <= 0) {
        setFormError('Target amount must be greater than 0');
        return;
      }
      if (form.current_amount < 0) {
        setFormError('Current amount cannot be negative');
        return;
      }
      if (form.current_amount > form.target_amount) {
        setFormError('Current amount cannot exceed target amount');
        return;
      }

      try {
        if (editingGoalId) {
          const updates = {
            name: form.name.trim(),
            target_amount: form.target_amount,
            current_amount: form.current_amount,
            deadline: form.deadline || null,
            monthly_contribution: form.monthly_contribution || null,
            icon: form.icon,
            color: form.color,
          };
          await goalQueries.update(editingGoalId, updates);
          setGoals((prev) =>
            prev.map((g) =>
              g.id === editingGoalId
                ? { ...g, ...updates, updated_at: new Date().toISOString() }
                : g,
            ),
          );
          showToast('Goal updated');
        } else {
          const newGoal = await goalQueries.create({
            name: form.name.trim(),
            target_amount: form.target_amount,
            current_amount: form.current_amount,
            deadline: form.deadline || null,
            monthly_contribution: form.monthly_contribution || null,
            icon: form.icon,
            color: form.color,
            is_completed: false,
          });
          setGoals((prev) => [...prev, newGoal]);
          showToast('Goal created');
        }
        closeModal();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to save goal');
      }
    },
    [form, editingGoalId, closeModal, showToast],
  );

  const handleDeleteGoal = useCallback(
    async (id: string) => {
      try {
        await goalQueries.delete(id);
        setGoals((prev) => prev.filter((g) => g.id !== id));
        showToast('Goal deleted');
      } catch (err) {
        showToast('Failed to delete goal');
      }
    },
    [showToast],
  );

  const updateField = useCallback(
    (field: keyof GoalFormData, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="demo-page"
    >
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--lagoon),transparent_84%)]">
            <Target className="h-5 w-5 text-[var(--lagoon-deep)]" />
          </div>
          <div>
            <h1 className="demo-title">Goals</h1>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Set and track your financial goals
            </p>
          </div>
        </div>
        {goals.length > 0 && (
          <button onClick={openAddModal} className="demo-button">
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        )}
      </div>

      {/* Content area */}
      <GoalsGrid
        goals={goals}
        loading={loading}
        error={error}
        onRetry={handleRetry}
        onAddGoal={openAddModal}
        onEditGoal={openEditModal}
        onDeleteGoal={handleDeleteGoal}
      />

      {/* Modal overlay */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-[10vh] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="demo-panel mx-4 mb-8 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="demo-section-title text-lg">
                {editingGoalId ? 'Edit Goal' : 'Add New Goal'}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition-colors hover:bg-[color-mix(in_oklab,var(--line),transparent_60%)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveGoal} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Goal Name
                </label>
                <input
                  type="text"
                  className="demo-input"
                  placeholder="e.g. Emergency Fund"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              {/* Target / Current */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    className="demo-input"
                    min={0}
                    step={1000}
                    value={form.target_amount || ''}
                    onChange={(e) =>
                      updateField('target_amount', Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Current Amount
                  </label>
                  <input
                    type="number"
                    className="demo-input"
                    min={0}
                    step={1000}
                    value={form.current_amount || ''}
                    onChange={(e) =>
                      updateField('current_amount', Number(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Deadline / Monthly */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Deadline
                  </label>
                  <input
                    type="month"
                    className="demo-input"
                    value={form.deadline}
                    onChange={(e) => updateField('deadline', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                    Monthly Contribution
                  </label>
                  <input
                    type="number"
                    className="demo-input"
                    min={0}
                    step={500}
                    value={form.monthly_contribution || ''}
                    onChange={(e) =>
                      updateField(
                        'monthly_contribution',
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map(({ name, icon: IconComp }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => updateField('icon', name)}
                      className={
                        'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ' +
                        (form.icon === name
                          ? 'border-[var(--lagoon-deep)] bg-[color-mix(in_oklab,var(--lagoon),transparent_84%)] text-[var(--lagoon-deep)]'
                          : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]')
                      }
                    >
                      <IconComp className="h-4 w-4" />
                      <span className="hidden sm:inline">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selector */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateField('color', c)}
                      className={
                        'h-8 w-8 rounded-full border-2 transition-transform ' +
                        (form.color === c
                          ? 'scale-110 border-[var(--sea-ink)] shadow-md'
                          : 'border-transparent hover:scale-105')
                      }
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>

              {/* Form error */}
              {formError && (
                <p className="text-sm font-medium text-red-500">{formError}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="demo-button-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="demo-button">
                  {editingGoalId ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Toast notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] shadow-lg backdrop-blur-md"
        >
          {toast}
        </motion.div>
      )}
    </motion.main>
  );
}

export default GoalsPage;
