import { motion } from 'motion/react';
import { Target, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import type { Goal } from '@/types/database';
import GoalCard from '@/components/goals/GoalCard';

interface GoalsGridProps {
  goals: Goal[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAddGoal?: () => void;
  onEditGoal?: (goal: Goal) => void;
  onDeleteGoal?: (id: string) => void;
}

function EmptyState({ onAddGoal }: { onAddGoal?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center gap-5 py-20 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--lagoon),transparent_84%)]">
        <Target className="h-8 w-8 text-[var(--lagoon-deep)]" />
      </div>
      <div>
        <p className="text-xl font-bold text-[var(--sea-ink)]">
          No goals yet.
        </p>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          Set your first financial goal!
        </p>
      </div>
      {onAddGoal && (
        <button onClick={onAddGoal} className="demo-button mt-2">
          <Plus className="h-4 w-4" />
          Create Goal
        </button>
      )}
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="demo-card space-y-3">
          <div className="flex items-center gap-3">
            <div className="fin-skeleton h-10 w-10 rounded-xl" />
            <div className="fin-skeleton h-5 flex-1" />
          </div>
          <div className="fin-skeleton h-2.5 w-full rounded-full" />
          <div className="flex justify-between">
            <div className="fin-skeleton h-4 w-20" />
            <div className="fin-skeleton h-4 w-20" />
          </div>
          <div className="fin-skeleton mt-2 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry, onAddGoal }: { message: string; onRetry?: () => void; onAddGoal?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <AlertCircle className="h-10 w-10 text-red-500" />
      <p className="text-lg font-semibold text-red-600">Failed to load goals</p>
      <p className="max-w-md text-sm text-[var(--sea-ink-soft)]">{message}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button onClick={onRetry} className="demo-button">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
        {onAddGoal && (
          <button onClick={onAddGoal} className="demo-button-secondary">
            <Plus className="h-4 w-4" />
            Create Goal
          </button>
        )}
      </div>
    </div>
  );
}

function AddGoalCard({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="demo-card flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-[var(--line)] text-center transition-colors hover:border-[var(--lagoon-deep)]"
      style={{ borderStyle: 'dashed' }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--lagoon),transparent_84%)]">
        <Plus className="h-6 w-6 text-[var(--lagoon-deep)]" />
      </div>
      <div>
        <p className="text-base font-semibold text-[var(--sea-ink)]">Add Goal</p>
        <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
          Create a new financial goal
        </p>
      </div>
    </motion.button>
  );
}

function GoalsGrid({
  goals,
  loading = false,
  error = null,
  onRetry,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
}: GoalsGridProps) {
  if (error) return <ErrorState message={error} onRetry={onRetry} onAddGoal={onAddGoal} />;
  if (loading) return <LoadingSkeleton />;

  // Empty state with no goals — hide grid, show CTA
  if (goals.length === 0) {
    return <EmptyState onAddGoal={onAddGoal} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {/* Add Goal card always first */}
      {onAddGoal && (
        <motion.div
          key="add-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0 }}
        >
          <AddGoalCard onClick={onAddGoal} />
        </motion.div>
      )}

      {/* Goal cards */}
      {goals.map((goal, idx) => (
        <motion.div
          key={goal.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
            delay: (onAddGoal ? 0.1 : 0) + idx * 0.05,
          }}
        >
          <GoalCard
            goal={goal}
            onEdit={onEditGoal}
            onDelete={onDeleteGoal}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export { GoalsGrid };
export default GoalsGrid;
