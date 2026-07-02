import { useState, useEffect, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  User,
  Layers,
  Landmark,
  Repeat,
  Palette,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import type { Account, Category, RecurringExpense } from '@/types/database';

import ProfileForm from '@/components/settings/ProfileForm';
import CategoryManager from '@/components/settings/CategoryManager';
import AccountManager from '@/components/settings/AccountManager';
import RecurringManager from '@/components/settings/RecurringManager';
import { useRecurringStore } from '@/stores/recurring-store';
import ThemeSettings from '@/components/settings/ThemeSettings';

// ---------------------------------------------------------------------------
// Route definition
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  errorComponent: ({ error }: { error: Error }) => (
    <div className="demo-page">
      <div className="demo-panel flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-[var(--sea-ink)]">Something went wrong</h2>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          {error instanceof Error ? error.message : 'An unexpected error occurred while loading settings.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="demo-button"
        >
          <RefreshCw className="h-4 w-4" /> Reload Page
        </button>
      </div>
    </div>
  ),
  pendingComponent: () => (
    <div className="demo-page">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="fin-skeleton h-9 w-9 rounded-lg" />
          <div className="fin-skeleton h-8 w-40 rounded-lg" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="fin-skeleton h-10 w-28 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="fin-skeleton h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="demo-page">
      <div className="demo-panel text-center">
        <h2 className="text-xl font-bold text-[var(--sea-ink)]">Page Not Found</h2>
        <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
          The settings page could not be loaded.
        </p>
      </div>
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'accounts', label: 'Accounts', icon: Landmark },
  { id: 'recurring', label: 'Recurring', icon: Repeat },
  { id: 'theme', label: 'Theme', icon: Palette },
];

// ---------------------------------------------------------------------------
// Sample data (seed state)
// ---------------------------------------------------------------------------
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', user_id: 'sample', name: 'Salary', type: 'income', icon: 'briefcase', color: '#22c55e', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-2', user_id: 'sample', name: 'Bonus', type: 'income', icon: 'circleDollarSign', color: '#3b82f6', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-3', user_id: 'sample', name: 'Freelancing', type: 'income', icon: 'laptop', color: '#a855f7', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-4', user_id: 'sample', name: 'Interest', type: 'income', icon: 'landmark', color: '#f59e0b', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-5', user_id: 'sample', name: 'Other Income', type: 'income', icon: 'wallet', color: '#14b8a6', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-6', user_id: 'sample', name: 'Food', type: 'expense', icon: 'utensils', color: '#f97316', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-7', user_id: 'sample', name: 'Rent', type: 'expense', icon: 'home', color: '#64748b', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-8', user_id: 'sample', name: 'Electricity', type: 'expense', icon: 'zap', color: '#f59e0b', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-9', user_id: 'sample', name: 'Internet', type: 'expense', icon: 'wifi', color: '#3b82f6', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-10', user_id: 'sample', name: 'Shopping', type: 'expense', icon: 'shoppingBag', color: '#ec4899', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-11', user_id: 'sample', name: 'Fuel', type: 'expense', icon: 'car', color: '#f97316', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-12', user_id: 'sample', name: 'Entertainment', type: 'expense', icon: 'film', color: '#a855f7', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-13', user_id: 'sample', name: 'Medical', type: 'expense', icon: 'heartPulse', color: '#ec4899', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-14', user_id: 'sample', name: 'Travel', type: 'expense', icon: 'plane', color: '#3b82f6', is_system: true, created_at: new Date().toISOString() },
  { id: 'cat-15', user_id: 'sample', name: 'Education', type: 'expense', icon: 'bookOpen', color: '#14b8a6', is_system: true, created_at: new Date().toISOString() },
];

const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc-1', user_id: 'sample', name: 'HDFC Savings', type: 'savings', balance: 84500, credit_limit: null, billing_date: null, due_date: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'acc-2', user_id: 'sample', name: 'ICICI Current', type: 'current', balance: 32000, credit_limit: null, billing_date: null, due_date: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'acc-3', user_id: 'sample', name: 'HDFC Credit Card', type: 'credit', balance: -12400, credit_limit: 150000, billing_date: 5, due_date: 25, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'acc-4', user_id: 'sample', name: 'Cash Wallet', type: 'cash', balance: 3200, credit_limit: null, billing_date: null, due_date: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'acc-5', user_id: 'sample', name: 'PhonePe', type: 'upi', balance: 1500, credit_limit: null, billing_date: null, due_date: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------
function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const recurringExpenses = useRecurringStore((s) => s.expenses);
  const addRecurring = useRecurringStore((s) => s.addExpense);
  const updateRecurring = useRecurringStore((s) => s.updateExpense);
  const deleteRecurring = useRecurringStore((s) => s.deleteExpense);

  const [profile, setProfile] = useState({
    name: 'Rishabh',
    currency: 'INR' as string,
    avatar_url: null as string | null,
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isLoading, _setIsLoading] = useState(false);

  // ---- Sync theme to localStorage on mount ----
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      setTheme(stored);
    }
  }, []);

  // ---- Profile handlers ----
  const handleProfileSave = useCallback(
    (updated: { name: string; currency: string; avatar_url?: string | null }) => {
      setProfile({ name: updated.name, currency: updated.currency, avatar_url: updated.avatar_url ?? null });
    },
    [],
  );

  // ---- Category handlers ----
  const handleCategoryAdd = useCallback(
    (cat: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
      const newCat: Category = {
        ...cat,
        id: generateId(),
        user_id: 'sample',
        created_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
    },
    [],
  );

  const handleCategoryUpdate = useCallback(
    (id: string, updates: Partial<Category>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [],
  );

  const handleCategoryDelete = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    },
    [],
  );

  // ---- Account handlers ----
  const handleAccountAdd = useCallback(
    (acc: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const now = new Date().toISOString();
      const newAcc: Account = {
        ...acc,
        id: generateId(),
        user_id: 'sample',
        created_at: now,
        updated_at: now,
      };
      setAccounts((prev) => [...prev, newAcc]);
    },
    [],
  );

  const handleAccountUpdate = useCallback(
    (id: string, updates: Partial<Account>) => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, ...updates, updated_at: new Date().toISOString() }
            : a,
        ),
      );
    },
    [],
  );

  const handleAccountDelete = useCallback(
    (id: string) => {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    },
    [],
  );

  // ---- Recurring handlers ----
  const handleRecurringAdd = useCallback(
    (exp: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at'>) => {
      const newExp: RecurringExpense = {
        ...exp,
        id: generateId(),
        user_id: 'sample',
        created_at: new Date().toISOString(),
      };
      addRecurring(newExp);
    },
    [addRecurring],
  );

  const handleRecurringUpdate = useCallback(
    (id: string, updates: Partial<RecurringExpense>) => {
      updateRecurring(id, { ...updates, updated_at: new Date().toISOString() });
    },
    [updateRecurring],
  );

  const handleRecurringDelete = useCallback(
    (id: string) => {
      deleteRecurring(id);
    },
    [deleteRecurring],
  );

  // ---- Theme handler ----
  const handleThemeChange = useCallback(
    (newTheme: 'light' | 'dark' | 'auto') => {
      setTheme(newTheme);
      applyThemeMode(newTheme);
      try {
        localStorage.setItem('theme', newTheme);
      } catch {
        /* localStorage unavailable */
      }
    },
    [],
  );

  // ---- Render tab content ----
  function renderTabContent() {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="demo-panel">
            <ProfileForm profile={profile} onSave={handleProfileSave} />
          </div>
        );

      case 'categories':
        return (
          <div className="demo-panel">
            <CategoryManager
              categories={categories}
              onAdd={handleCategoryAdd}
              onUpdate={handleCategoryUpdate}
              onDelete={handleCategoryDelete}
            />
          </div>
        );

      case 'accounts':
        return (
          <div className="demo-panel">
            <AccountManager
              accounts={accounts}
              onAdd={handleAccountAdd}
              onUpdate={handleAccountUpdate}
              onDelete={handleAccountDelete}
            />
          </div>
        );

      case 'recurring':
        return (
          <div className="demo-panel">
            <RecurringManager
              expenses={recurringExpenses}
              onAdd={handleRecurringAdd}
              onUpdate={handleRecurringUpdate}
              onDelete={handleRecurringDelete}
            />
          </div>
        );

      case 'theme':
        return (
          <div className="demo-panel">
            <ThemeSettings theme={theme} onChange={handleThemeChange} />
          </div>
        );

      default:
        return null;
    }
  }

  // ---- Loading state ----
  if (isLoading) {
    return (
      <div className="demo-page">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="fin-skeleton h-9 w-9 rounded-lg" />
            <div className="fin-skeleton h-8 w-40 rounded-lg" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="fin-skeleton h-10 w-28 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="fin-skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Main render ----
  return (
    <div className="demo-page">
      <div className="fin-rise-in space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--lagoon),transparent_82%)]">
            <Settings className="h-5 w-5 text-[var(--lagoon-deep)]" />
          </div>
          <h1 className="fin-title m-0 text-2xl sm:text-3xl">Settings</h1>
        </div>

        <p className="-mt-4 text-sm text-[var(--sea-ink-soft)]">
          Manage your profile, categories, accounts, recurring expenses, and theme.
        </p>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-[var(--lagoon)] text-white shadow-[0_4px_12px_rgba(79,184,178,0.3)]'
                    : 'text-[var(--sea-ink-soft)] hover:bg-[color-mix(in_oklab,var(--lagoon),transparent_88%)] hover:text-[var(--sea-ink)]',
                )}
                role="tab"
                aria-selected={isActive}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content with motion animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Theme application helper
// ---------------------------------------------------------------------------
function applyThemeMode(mode: 'light' | 'dark' | 'auto') {
  if (typeof window === 'undefined') return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode;

  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', mode);
  }

  document.documentElement.style.colorScheme = resolved;
}

export default SettingsPage;
