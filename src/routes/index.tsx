import { createFileRoute, Link } from '@tanstack/react-router';
import { Wallet, TrendingUp, PiggyBank, ArrowLeftRight, ShoppingBag, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Card from '@/components/shared/Card';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboard } from '@/hooks/use-dashboard';
import { formatCurrency } from '@/lib/utils';

export const Route = createFileRoute('/')({ component: DashboardPage });

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const { dashboardData, loading, error, refresh } = useDashboard();

  if (loading) {
    return (
      <div className="demo-page">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--lagoon)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="demo-page">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={refresh} className="demo-button">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-page">
      <PageHeader
        title={`${getGreeting()}, ${firstName}`}
        subtitle="Here's your financial overview for today"
      />

      {!dashboardData ? (
        <>
          {/* Empty state */}
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-10 text-center">
            <Wallet className="h-12 w-12 text-[var(--sea-ink-soft)]" />
            <div>
              <h2 className="text-lg font-bold text-[var(--sea-ink)]">No data yet</h2>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                Start by adding income and expenses in the Planner or use Quick Entry (⌘K) to log your first transaction.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/planner" className="demo-button">
                <Wallet className="h-4 w-4" /> Go to Planner
              </Link>
              <Link to="/transactions" className="demo-button-secondary">
                <ArrowLeftRight className="h-4 w-4" /> Transactions
              </Link>
            </div>
          </div>

          {/* Quick tip */}
          <div className="mt-6">
            <div className="demo-alert text-sm">
              <p className="font-medium text-[var(--sea-ink)]">
                Tip: Head to the{' '}
                <Link to="/planner" className="font-semibold text-[var(--lagoon-deep)] no-underline hover:underline">
                  Planner
                </Link>{' '}
                to set up your monthly budget and track your spending.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Today's Budget"
              value={formatCurrency(dashboardData.dailyDecision?.available ?? 0)}
              icon={<Wallet size={20} />}
            />
            <StatCard
              label="Weekly Remaining"
              value={formatCurrency(dashboardData.weekOverview?.remaining ?? 0)}
              icon={<TrendingUp size={20} />}
            />
            <StatCard
              label="Monthly Savings"
              value={formatCurrency(dashboardData.monthOverview?.savings ?? 0)}
              icon={<PiggyBank size={20} />}
            />
            <StatCard
              label="Savings Rate"
              value={`${dashboardData.monthOverview?.savingsRate ?? 0}%`}
              icon={<ArrowLeftRight size={20} />}
            />
          </div>

          {/* Recent Transactions */}
          {dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0 && (
            <div className="mt-8">
              <Card title="Recent Transactions" icon={<ArrowLeftRight size={20} />}>
                <div className="divide-y divide-[var(--line)]">
                  {dashboardData.recentTransactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]">
                        <ShoppingBag size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                          {tx.description || tx.merchant || 'Transaction'}
                        </p>
                        <p className="text-xs text-[var(--sea-ink-soft)]">
                          {tx.date}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold tabular-nums ${tx.type === 'income' ? 'text-emerald-600' : 'text-[var(--sea-ink)]'}`}>
                        {tx.type === 'income' ? '+' : '−'}{formatCurrency(Math.abs(tx.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Quick tip */}
          <div className="mt-6">
            <div className="demo-alert text-sm">
              <p className="font-medium text-[var(--sea-ink)]">
                Tip: Head to the{' '}
                <Link to="/planner" className="font-semibold text-[var(--lagoon-deep)] no-underline hover:underline">
                  Planner
                </Link>{' '}
                to set up your monthly budget and track your spending.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
