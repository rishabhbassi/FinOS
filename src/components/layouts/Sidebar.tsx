// Finance OS - Sidebar Navigation

import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  CalendarCheck2,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore, type ThemeMode } from '@/stores/theme-store';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/planner', label: 'Planner', icon: <CalendarCheck2 size={18} /> },
  { href: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
  { href: '/budget', label: 'Budget', icon: <Wallet size={18} /> },
  { href: '/investments', label: 'Investments', icon: <TrendingUp size={18} /> },
  { href: '/goals', label: 'Goals', icon: <Target size={18} /> },
  { href: '/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  { href: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  light: <Sun size={18} />,
  dark: <Moon size={18} />,
  system: <Monitor size={18} />,
};

const themeCycle: ThemeMode[] = ['light', 'dark', 'system'];

function getNextTheme(current: ThemeMode): ThemeMode {
  const idx = themeCycle.indexOf(current);
  return themeCycle[(idx + 1) % themeCycle.length];
}

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-[240px] flex-col border-r border-[var(--line)] bg-[var(--bg-base)] lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--line)] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-xs font-bold text-white">
          F
        </div>
        <span className="text-lg font-bold text-[var(--sea-ink)]">Finance OS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[var(--lagoon)]/10 text-[var(--sea-ink)]'
                      : 'text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]',
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center',
                      isActive && 'text-[var(--lagoon-deep)]',
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--line)] p-3">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(getNextTheme(theme))}
          className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
        >
          {themeIcons[theme]}
          <span className="capitalize">{theme} theme</span>
        </button>

        {/* User account */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-xs font-bold text-white">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
              {user?.name ?? 'Guest'}
            </p>
            <p className="truncate text-xs text-[var(--sea-ink-soft)]">
              {user?.email ?? 'Not signed in'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { logout(); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
