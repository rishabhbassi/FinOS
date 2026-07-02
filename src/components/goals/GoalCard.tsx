import { motion } from 'motion/react';
import {
  PiggyBank,
  Car,
  Plane,
  Home,
  Target,
  Wallet,
  Gem,
  Briefcase,
  Landmark,
  CircleDollarSign,
  Clock,
  Calendar,
  Check,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Goal } from '@/types/database';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (id: string) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  PiggyBank,
  Car,
  Plane,
  Home,
  Target,
  Wallet,
  Gem,
  Briefcase,
  Landmark,
  CircleDollarSign,
  Clock,
  Calendar,
  Check,
};

function GoalIcon({ iconName, color }: { iconName: string; color: string }) {
  const IconComponent = ICON_MAP[iconName] ?? Target;
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl"
      style={{ backgroundColor: `${color}20` }}
    >
      <IconComponent className="h-5 w-5" style={{ color }} />
    </div>
  );
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const percentage =
    goal.target_amount > 0
      ? Math.min(Math.max((goal.current_amount / goal.target_amount) * 100, 0), 100)
      : 0;

  const monthlyContrib = goal.monthly_contribution ?? 0;
  const deadlineLabel = goal.deadline
    ? formatDate(goal.deadline, { month: 'short', year: 'numeric' })
    : null;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="demo-card relative flex flex-col gap-3"
      style={{ borderColor: `${goal.color}50` }}
    >
      {/* Completed badge */}
      {goal.is_completed && (
        <span className="absolute right-3 top-3 demo-pill gap-1 bg-emerald-50 text-emerald-700">
          <Check className="h-3 w-3" />
          Completed
        </span>
      )}

      {/* Edit / Delete buttons */}
      <div
        className={cn(
          'absolute right-3 top-3 flex gap-1',
          goal.is_completed && 'right-[100px]',
        )}
      >
        {onEdit && (
          <button
            onClick={() => onEdit(goal)}
            className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition-colors hover:bg-[color-mix(in_oklab,var(--lagoon),transparent_80%)] hover:text-[var(--sea-ink)]"
            title="Edit goal"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(goal.id)}
            className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition-colors hover:bg-red-100 hover:text-red-600"
            title="Delete goal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Header with icon and name */}
      <div className="flex items-center gap-3 pr-16">
        <GoalIcon iconName={goal.icon} color={goal.color} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--sea-ink)]">{goal.name}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--sea-ink-soft)]">Progress</span>
          <span className="font-semibold tabular-nums" style={{ color: goal.color }}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full"
          style={{ backgroundColor: `${goal.color}20` }}
          role="progressbar"
          aria-valuenow={goal.current_amount}
          aria-valuemin={0}
          aria-valuemax={goal.target_amount}
          aria-label={`${Math.round(percentage)}% complete`}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: goal.color }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--sea-ink-soft)]">Current</p>
          <p className="text-sm font-bold text-[var(--sea-ink)]">
            {formatCurrency(goal.current_amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--sea-ink-soft)]">Target</p>
          <p className="text-sm font-bold text-[var(--sea-ink)]">
            {formatCurrency(goal.target_amount)}
          </p>
        </div>
      </div>

      {/* Footer details */}
      <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-3 text-xs text-[var(--sea-ink-soft)]">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{deadlineLabel ?? 'No deadline'}</span>
        </div>
        {monthlyContrib > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatCurrency(monthlyContrib)}/mo</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { GoalCard };
