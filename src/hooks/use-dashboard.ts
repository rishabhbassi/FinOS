import { useState, useCallback, useEffect } from 'react';
import type { DashboardData } from '@/types/app';
import type { Transaction } from '@/types/database';
import {
  calculateDailyDecision,
  calculateMonthlyBudget,
  calculateCategoryBreakdown,
} from '@/lib/budget-engine';
import { generateId, toDateString, getDaysInMonth } from '@/lib/utils';

// Categories with colors for the dashboard breakdown
const CATEGORIES: { id: string; name: string; color: string }[] = [
  { id: 'food', name: 'Food', color: '#f97316' },
  { id: 'groceries', name: 'Groceries', color: '#22c55e' },
  { id: 'fuel', name: 'Fuel', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', color: '#a855f7' },
  { id: 'entertainment', name: 'Entertainment', color: '#ec4899' },
  { id: 'medical', name: 'Medical', color: '#14b8a6' },
  { id: 'travel', name: 'Travel', color: '#f59e0b' },
  { id: 'rent', name: 'Rent', color: '#64748b' },
  { id: 'electricity', name: 'Electricity', color: '#eab308' },
  { id: 'internet', name: 'Internet', color: '#06b6d4' },
  { id: 'sip', name: 'SIP', color: '#8b5cf6' },
];

const MERCHANTS: Record<string, string[]> = {
  Food: ['Zomato', 'Swiggy', 'Dominos', 'Local Cafe', 'Darshini', 'Restaurant'],
  Groceries: ['BigBasket', 'Zepto', 'Blinkit', 'Reliance Fresh', 'Local Mart'],
  Fuel: ['Indian Oil', 'BPCL', 'HP Shell', 'IOCL Pump'],
  Shopping: ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Local Store'],
  Entertainment: ['Netflix', 'Amazon Prime', 'BookMyShow', 'Spotify', 'PVR'],
  Medical: ['Apollo Pharmacy', 'MedPlus', 'Local Pharmacy', 'Practo'],
  Travel: ['Uber', 'Ola', 'IRCTC', 'RedBus', 'MakeMyTrip'],
};

interface GeneratedTransactions {
  allTransactions: Transaction[];
  variableTransactions: Transaction[];
}

/**
 * Generate a comprehensive set of mock transactions for the dashboard.
 * Returns both the full transaction list (including fixed expenses)
 * and a filtered list containing only variable expenses.
 */
function generateDashboardData(date: Date): GeneratedTransactions {
  const year = date.getFullYear();
  const month = date.getMonth();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = new Date().toISOString();
  const all: Transaction[] = [];
  const variable: Transaction[] = [];

  // Income: Salary 59000 on day 1
  all.push({
    id: generateId(),
    user_id: 'demo-user',
    account_id: null,
    category_id: 'salary',
    amount: 59000,
    description: 'Monthly Salary',
    merchant: 'Employer Corp',
    date: `${year}-${pad(month + 1)}-01`,
    type: 'income',
    is_recurring: true,
    tags: ['salary'],
    created_at: timestamp,
    updated_at: timestamp,
  });

  // Fixed expense transactions (included in all, excluded from variable)
  const fixedEntries: { catId: string; name: string; amount: number; day: number }[] = [
    { catId: 'rent', name: 'Rent', amount: 21000, day: 5 },
    { catId: 'electricity', name: 'Electricity', amount: 1200, day: 10 },
    { catId: 'internet', name: 'Internet', amount: 1000, day: 7 },
    { catId: 'sip', name: 'SIP', amount: 7000, day: 3 },
  ];

  for (const fe of fixedEntries) {
    all.push({
      id: generateId(),
      user_id: 'demo-user',
      account_id: null,
      category_id: fe.catId,
      amount: -fe.amount,
      description: fe.name,
      merchant: fe.name,
      date: `${year}-${pad(month + 1)}-${pad(fe.day)}`,
      type: 'expense',
      is_recurring: true,
      tags: ['fixed'],
      created_at: timestamp,
      updated_at: timestamp,
    });
  }

  // Variable expense transactions (included in both)
  const variableCategories: { id: string; name: string; min: number; max: number; count: number }[] = [
    { id: 'food', name: 'Food', min: 100, max: 800, count: 10 },
    { id: 'groceries', name: 'Groceries', min: 400, max: 1500, count: 5 },
    { id: 'fuel', name: 'Fuel', min: 500, max: 1200, count: 4 },
    { id: 'shopping', name: 'Shopping', min: 300, max: 1500, count: 4 },
    { id: 'entertainment', name: 'Entertainment', min: 200, max: 1000, count: 3 },
    { id: 'medical', name: 'Medical', min: 200, max: 1000, count: 2 },
    { id: 'travel', name: 'Travel', min: 300, max: 1500, count: 3 },
  ];

  for (const vc of variableCategories) {
    const merchants = MERCHANTS[vc.name] ?? ['Store'];
    for (let i = 0; i < vc.count; i++) {
      const amount = vc.min + Math.floor(Math.random() * (vc.max - vc.min));
      const day = Math.floor(Math.random() * 28) + 1;
      const d = `${year}-${pad(month + 1)}-${pad(day)}`;
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];

      const tx: Transaction = {
        id: generateId(),
        user_id: 'demo-user',
        account_id: null,
        category_id: vc.id,
        amount: -amount,
        description: `${vc.name} at ${merchant}`,
        merchant,
        date: d,
        type: 'expense',
        is_recurring: false,
        tags: [],
        created_at: timestamp,
        updated_at: timestamp,
      };

      all.push(tx);
      variable.push(tx);
    }
  }

  // Sort by date descending (most recent first) for recent transactions
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  variable.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { allTransactions: all, variableTransactions: variable };
}

/**
 * Compute the month overview including total income, expenses, savings,
 * savings rate, and projected savings based on current spending pace.
 */
function computeMonthOverview(
  allTransactions: Transaction[],
  totalIncome: number,
): DashboardData['monthOverview'] {
  const totalExpenses = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  // Project savings based on current spending rate through the month
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());
  const projectedSavings =
    dayOfMonth > 0 && dayOfMonth <= daysInMonth
      ? totalIncome - (totalExpenses / dayOfMonth) * daysInMonth
      : savings;

  return {
    income: totalIncome,
    expenses: totalExpenses,
    savings: Math.round(savings),
    savingsRate: Math.round(savingsRate * 10) / 10,
    projectedSavings: Math.round(projectedSavings),
  };
}

export function useDashboard(): {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const compute = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const totalIncome = 59000;
      const fixedExpenses = 21000 + 1200 + 1000 + 7000;

      // Generate comprehensive mock data
      const { allTransactions, variableTransactions } =
        generateDashboardData(now);

      // Daily decision uses variable-only transactions (fixed handled via param)
      const dailyDecision = calculateDailyDecision(
        totalIncome,
        fixedExpenses,
        variableTransactions,
        now,
      );

      // Category breakdown uses all transactions for the full financial picture
      const categoryBreakdown = calculateCategoryBreakdown(
        allTransactions,
        CATEGORIES,
      );

      // Compute monthly budget to derive week overview and timeline
      const monthBudget = calculateMonthlyBudget(
        totalIncome,
        fixedExpenses,
        variableTransactions,
        [],
        now,
      );

      // Derive current week overview from the budget month
      const todayStr = toDateString(now);
      const currentWeek = monthBudget.weeks.find(
        (w) => todayStr >= w.startDate && todayStr <= w.endDate,
      );

      const weekOverview = currentWeek
        ? {
            available: currentWeek.totalBudget,
            spent: currentWeek.totalSpent,
            remaining: currentWeek.totalBudget - currentWeek.totalSpent,
            surplus: currentWeek.surplus,
          }
        : { available: 0, spent: 0, remaining: 0, surplus: 0 };

      // Compute month overview from all transactions
      const monthOverview = computeMonthOverview(
        allTransactions,
        totalIncome,
      );

      // Recent transactions (last 10, already sorted most-recent-first)
      const recentTransactions = allTransactions.slice(0, 10);

      // Build budget timeline from each day in the budget month
      const budgetTimeline: { day: string; available: number; spent: number }[] =
        [];
      for (const week of monthBudget.weeks) {
        for (const day of week.days) {
          budgetTimeline.push({
            day: day.date,
            available: day.available,
            spent: day.spent,
          });
        }
      }

      // Monthly comparison: this month vs mock last month data
      const lastMonthTotalExpenses = fixedExpenses + 19500; // slightly higher spending last month
      const lastMonthSavings = totalIncome - lastMonthTotalExpenses;

      const monthlyComparison = {
        thisMonth: {
          savings: monthOverview.savings,
          expenses: monthOverview.expenses,
        },
        lastMonth: {
          savings: lastMonthSavings,
          expenses: lastMonthTotalExpenses,
        },
        change: {
          savings: monthOverview.savings - lastMonthSavings,
          expenses: monthOverview.expenses - lastMonthTotalExpenses,
        },
      };

      // Build the final dashboard data object
      setDashboardData({
        dailyDecision,
        weekOverview,
        monthOverview,
        categoryBreakdown,
        recentTransactions,
        budgetTimeline,
        monthlyComparison,
      } as DashboardData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to compute dashboard data',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulate a 400ms loading delay on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      compute();
    }, 400);
    return () => clearTimeout(timer);
  }, [compute]);

  const refresh = useCallback(() => {
    compute();
  }, [compute]);

  return {
    dashboardData,
    loading,
    error,
    refresh,
  };
}

export default useDashboard;
