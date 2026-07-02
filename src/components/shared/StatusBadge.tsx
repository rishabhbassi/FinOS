import { STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'comfortable' | 'tight' | 'over';
  size?: 'sm' | 'md';
}

const sizeStyles: Record<string, string> = {
  sm: 'text-[0.65rem] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

const dotSizes: Record<string, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold capitalize',
        colors.bg,
        colors.text,
        sizeStyles[size],
      )}
    >
      <span className={cn('inline-block rounded-full', colors.dot, dotSizes[size])} />
      {status}
    </span>
  );
}
