import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<string, { bar: string; track: string; label: string }> = {
  default: {
    bar: 'bg-[var(--lagoon)]',
    track: 'bg-[color-mix(in_oklab,var(--lagoon),transparent_82%)]',
    label: 'text-[var(--sea-ink-soft)]',
  },
  success: {
    bar: 'bg-emerald-500 dark:bg-emerald-400',
    track: 'bg-emerald-200 dark:bg-emerald-900/50',
    label: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    bar: 'bg-amber-500 dark:bg-amber-400',
    track: 'bg-amber-200 dark:bg-amber-900/50',
    label: 'text-amber-700 dark:text-amber-300',
  },
  danger: {
    bar: 'bg-red-500 dark:bg-red-400',
    track: 'bg-red-200 dark:bg-red-900/50',
    label: 'text-red-700 dark:text-red-300',
  },
};

const sizeStyles: Record<string, string> = {
  sm: 'h-1.5 rounded-full',
  md: 'h-2.5 rounded-full',
  lg: 'h-4 rounded-lg',
};

export default function ProgressBar({
  value,
  max,
  variant = 'default',
  showLabel = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  const styles = variantStyles[variant] ?? variantStyles.default;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex-1 overflow-hidden bg-[color-mix(in_oklab,var(--lagoon),transparent_82%)]',
          sizeStyles[size],
          styles.track,
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${Math.round(percentage)}%`}
      >
        <motion.div
          className={cn('h-full', sizeStyles[size], styles.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-semibold font-mono tabular-nums', styles.label)}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
