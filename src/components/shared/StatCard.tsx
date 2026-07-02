// Finance OS - Stat Card Component

import { type ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles: Record<string, string> = {
  default: 'border-[var(--line)]',
  success: 'border-[rgba(47,106,74,0.3)]',
  warning: 'border-[rgba(193,126,42,0.3)]',
  danger: 'border-[rgba(196,71,71,0.3)]',
};

export default function StatCard({ label, value, trend, icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn('island-shell demo-card', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]">
          {icon}
        </div>

        {trend && (
          <span
            className={cn(
              'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              trend.isPositive
                ? 'bg-[var(--palm)]/10 text-[var(--palm)]'
                : 'bg-red-500/10 text-red-500',
            )}
          >
            <TrendingUp size={12} className={cn(!trend.isPositive && 'rotate-180')} />
            {trend.value}%
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-[var(--sea-ink-soft)]">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-[var(--sea-ink)]">{value}</p>
      </div>
    </div>
  );
}
