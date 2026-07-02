// FinOS - Loading Skeleton Component

import { cn } from '@/lib/utils';

export interface SkeletonProps {
  variant?: 'card' | 'table' | 'text' | 'stat';
  count?: number;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md',
        'bg-[var(--line)]',
        className,
      )}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="island-shell rounded-[1.25rem] p-[clamp(1.25rem,4vw,2rem)]">
      <div className="mb-4 flex items-center gap-3">
        <SkeletonLine className="h-9 w-9 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine className="h-4 w-1/3" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-5/6" />
        <SkeletonLine className="h-3 w-4/6" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="demo-table-shell">
      <table className="demo-table">
        <thead>
          <tr>
            {[1, 2, 3, 4].map((i) => (
              <th key={i}>
                <SkeletonLine className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((row) => (
            <tr key={row}>
              {[1, 2, 3, 4].map((col) => (
                <td key={col}>
                  <SkeletonLine className={cn('h-3', col === 1 ? 'w-24' : 'w-16')} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-2.5">
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-4 w-full" />
      <SkeletonLine className="h-4 w-5/6" />
      <SkeletonLine className="h-4 w-2/3" />
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="island-shell demo-card">
      <div className="flex items-start justify-between">
        <SkeletonLine className="h-10 w-10 rounded-xl" />
        <SkeletonLine className="h-5 w-12 rounded-full" />
      </div>
      <div className="mt-4 space-y-1.5">
        <SkeletonLine className="h-3 w-20" />
        <SkeletonLine className="h-7 w-28" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ variant = 'card', count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <CardSkeleton />;
      case 'table':
        return <TableSkeleton />;
      case 'text':
        return <TextSkeleton />;
      case 'stat':
        return <StatSkeleton />;
    }
  };

  return (
    <div className={cn(variant === 'stat' && 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4')}>
      {items.map((i) => (
        <div key={i} className="rise-in" style={{ animationDelay: `${i * 80}ms` }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}
