// FinOS - Mobile Bottom Navigation

import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, ArrowLeftRight, Wallet, CalendarCheck2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const mobileItems: MobileItem[] = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/planner', label: 'Planner', icon: CalendarCheck2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'text-[var(--lagoon-deep)]'
                  : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
              )}
            >
              <Icon
                size={20}
                className={cn(isActive && 'text-[var(--lagoon-deep)]')}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
