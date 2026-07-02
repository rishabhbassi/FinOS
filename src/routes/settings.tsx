import { useState, useEffect, useCallback, useRef } from 'react';
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
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account, Category, RecurringExpense } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { categoryQueries, accountQueries } from '@/lib/supabase/queries';
import { useAuthStore } from '@/stores/auth-store';

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
// Loading skeletons
// ---------------------------------------------------------------------------
function CategoriesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="fin-skeleton h-10 w-32 rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="fin-skeleton h-16 w-full rounded-xl" />
        ))}
      </div>
      <div className="fin-skeleton h-5 w-40 rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="fin-skeleton h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function AccountsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="fin-skeleton h-10 w-32 rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="fin-skeleton h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------
function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const recurringExpenses = useRecurringStore((s) => s.expenses);
  const addRecurring = useRecurringStore((s) => s.addExpense);
  const updateRecurring = useRecurringStore((s) => s.updateExpense);
  const deleteRecurring = useRecurringStore((s) => s.deleteExpense);
  const syncRecurring = useRecurringStore((s) => s.syncWithSupabase);

  const authUserId = useAuthStore((s) => s.user?.id);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const [profile, setProfile] = useState<{
    name: string;
    currency: string;
    avatar_url: string | null;
  }>({
    name: '',
    currency: 'INR',
    avatar_url: null,
  });

  // Load profile from Supabase on mount
  useEffect(() => {
    if (authUserId) {
      (async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, currency')
            .eq('id', authUserId)
            .single();
          if (data) {
            setProfile({
              name: data.full_name ?? '',
              currency: data.currency ?? 'INR',
              avatar_url: null,
            });
          }
        } catch {
          // profile load failed — use defaults
        }
      })();
    }
  }, [authUserId]);

  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  // ---- Sync theme to localStorage on mount ----
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      setTheme(stored);
    }
  }, []);

  // ---- Fetch data on mount ----
  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    syncRecurring();
  }, []);

  async function fetchCategories() {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const data = await categoryQueries.list();
      setCategories(data);
    } catch (err) {
      setCategoriesError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function fetchAccounts() {
    setAccountsLoading(true);
    setAccountsError(null);
    try {
      const data = await accountQueries.list();
      setAccounts(data);
    } catch (err) {
      setAccountsError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setAccountsLoading(false);
    }
  }

  // ---- Profile handlers ----
  const handleProfileSave = useCallback(
    async (updated: {
      name: string;
      currency: string;
      avatar_url?: string | null;
    }) => {
      setProfile({
        name: updated.name,
        currency: updated.currency,
        avatar_url: updated.avatar_url ?? null,
      });
      if (authUserId) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              full_name: updated.name,
              currency: updated.currency,
            })
            .eq('id', authUserId);
          if (error) {
            showToast('error', `Failed to save profile: ${error.message}`);
          } else {
            showToast('success', 'Profile saved successfully');
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          showToast('error', `Failed to save profile: ${msg}`);
        }
      } else {
        showToast('success', 'Profile updated (offline)');
      }
    },
    [authUserId, showToast],
  );

  // ---- Category handlers ----
  const handleCategoryAdd = useCallback(
    async (cat: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
      try {
        const created = await categoryQueries.create({ ...cat, user_id: '' });
        setCategories((prev) => [...prev, created]);
      } catch (err) {
        console.error('Failed to create category:', err);
      }
    },
    [],
  );

  const handleCategoryUpdate = useCallback(
    async (id: string, updates: Partial<Category>) => {
      try {
        await categoryQueries.update(id, updates);
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      } catch (err) {
        console.error('Failed to update category:', err);
      }
    },
    [],
  );

  const handleCategoryDelete = useCallback(
    async (id: string) => {
      try {
        await categoryQueries.delete(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        console.error('Failed to delete category:', err);
      }
    },
    [],
  );

  // ---- Account handlers ----
  const handleAccountAdd = useCallback(
    async (acc: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      try {
        const created = await accountQueries.create(acc);
        setAccounts((prev) => [...prev, created]);
      } catch (err) {
        console.error('Failed to create account:', err);
      }
    },
    [],
  );

  const handleAccountUpdate = useCallback(
    async (id: string, updates: Partial<Account>) => {
      try {
        await accountQueries.update(id, updates);
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, ...updates, updated_at: new Date().toISOString() }
              : a,
          ),
        );
      } catch (err) {
        console.error('Failed to update account:', err);
      }
    },
    [],
  );

  const handleAccountDelete = useCallback(
    async (id: string) => {
      try {
        await accountQueries.delete(id);
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        console.error('Failed to delete account:', err);
      }
    },
    [],
  );

  // ---- Recurring handlers ----
  const handleRecurringAdd = useCallback(
    async (exp: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      try {
        await addRecurring({
          ...exp,
          id: 'temp',
          user_id: 'temp',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to create recurring expense:', err);
      }
    },
    [addRecurring],
  );

  const handleRecurringUpdate = useCallback(
    async (id: string, updates: Partial<RecurringExpense>) => {
      try {
        await updateRecurring(id, updates);
      } catch (err) {
        console.error('Failed to update recurring expense:', err);
      }
    },
    [updateRecurring],
  );

  const handleRecurringDelete = useCallback(
    async (id: string) => {
      try {
        await deleteRecurring(id);
      } catch (err) {
        console.error('Failed to delete recurring expense:', err);
      }
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
            {categoriesLoading ? (
              <CategoriesSkeleton />
            ) : categoriesError ? (
              <>
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Could not load categories. You can still add new ones.</span>
                  <button
                    type="button"
                    onClick={fetchCategories}
                    className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </div>
                <CategoryManager
                  categories={[]}
                  onAdd={handleCategoryAdd}
                  onUpdate={handleCategoryUpdate}
                  onDelete={handleCategoryDelete}
                />
              </>
            ) : (
              <CategoryManager
                categories={categories}
                onAdd={handleCategoryAdd}
                onUpdate={handleCategoryUpdate}
                onDelete={handleCategoryDelete}
              />
            )}
          </div>
        );

      case 'accounts':
        return (
          <div className="demo-panel">
            {accountsLoading ? (
              <AccountsSkeleton />
            ) : accountsError ? (
              <>
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Could not load accounts. You can still add new ones.</span>
                  <button
                    type="button"
                    onClick={fetchAccounts}
                    className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </div>
                <AccountManager
                  accounts={[]}
                  onAdd={handleAccountAdd}
                  onUpdate={handleAccountUpdate}
                  onDelete={handleAccountDelete}
                />
              </>
            ) : (
              <AccountManager
                accounts={accounts}
                onAdd={handleAccountAdd}
                onUpdate={handleAccountUpdate}
                onDelete={handleAccountDelete}
              />
            )}
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

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
