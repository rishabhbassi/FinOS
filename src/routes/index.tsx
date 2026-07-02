import { createFileRoute } from '@tanstack/react-router';
import { Wallet, TrendingUp, PiggyBank, ArrowLeftRight, Coffee, ShoppingBag, Car, Music } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Card from '@/components/shared/Card';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/')({ component: DashboardPage });

interface TransactionItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'debit' | 'credit';
}

const quickTransactions: TransactionItem[] = [
  { id: 't1', description: 'Morning coffee', amount: 45, category: 'Food', date: 'Today', type: 'debit' },
  { id: 't2', description: 'Grocery run', amount: 1280, category: 'Groceries', date: 'Today', type: 'debit' },
  { id: 't3', description: 'Fuel refill', amount: 2100, category: 'Fuel', date: 'Yesterday', type: 'debit' },
  { id: 't4', description: 'Movie tickets', amount: 600, category: 'Entertainment', date: 'Yesterday', type: 'debit' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const categoryIcons: Record<string, React.ReactNode> = {
  Food: <Coffee size={14} />,
  Groceries: <ShoppingBag size={14} />,
  Fuel: <Car size={14} />,
  Entertainment: <Music size={14} />,
};

function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="demo-page">
      <PageHeader
        title={`${getGreeting()}, ${firstName}`}
        subtitle="Here's your financial overview for today"
      />

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Budget"
          value="1,250"
          icon={<Wallet size={20} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="Weekly Remaining"
          value="4,380"
          icon={<TrendingUp size={20} />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          label="Monthly Savings"
          value="18,500"
          icon={<PiggyBank size={20} />}
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          label="Savings Rate"
          value="32%"
          icon={<ArrowLeftRight size={20} />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Quick Transactions */}
      <div className="mt-8">
        <Card title="Recent Transactions" icon={<ArrowLeftRight size={20} />}>
          <div className="divide-y divide-[var(--line)]">
            {quickTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]">
                  {categoryIcons[tx.category] ?? <ShoppingBag size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                    {tx.description}
                  </p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">
                    {tx.category} &middot; {tx.date}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--sea-ink)]">
                  &minus;{tx.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick tip */}
      <div className="mt-6">
        <div className="demo-alert text-sm">
          <p className="font-medium text-[var(--sea-ink)]">
            Tip: Head to the{' '}
            <a
              href="/planner"
              className="font-semibold text-[var(--lagoon-deep)] no-underline hover:underline"
            >
              Planner
            </a>{' '}
            to set up your monthly budget and track your spending.
          </p>
        </div>
      </div>
    </div>
  );
}
