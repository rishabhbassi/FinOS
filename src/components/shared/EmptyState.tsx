// Finance OS - Empty State Component

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="demo-center flex-col">
      <div className="island-shell rounded-2xl px-8 py-12 text-center sm:px-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-bold text-[var(--sea-ink)]">{title}</h3>
        <p className={cn('mx-auto mb-6 max-w-sm text-sm text-[var(--sea-ink-soft)]')}>
          {description}
        </p>
        {action && (
          <button type="button" onClick={action.onClick} className="demo-button">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
