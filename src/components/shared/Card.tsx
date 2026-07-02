// Finance OS - Reusable Card Component

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  variant?: 'default' | 'stat' | 'compact';
  className?: string;
  children: ReactNode;
}

export default function Card({
  title,
  subtitle,
  icon,
  action,
  variant = 'default',
  className,
  children,
}: CardProps) {
  const variantStyles = {
    default: 'rounded-[1.25rem] p-[clamp(1.25rem,4vw,2rem)]',
    stat: 'rounded-[1rem] p-4',
    compact: 'rounded-[1rem] p-3',
  };

  return (
    <div className={cn('island-shell', variantStyles[variant], className)}>
      {/* Header */}
      {(title || icon || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-bold text-[var(--sea-ink)]">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-0.5 text-sm text-[var(--sea-ink-soft)]">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      {/* Body */}
      {children}
    </div>
  );
}
