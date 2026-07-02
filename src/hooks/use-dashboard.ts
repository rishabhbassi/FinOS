import { useState, useCallback, useEffect } from 'react';
import type { DashboardData } from '@/types/app';
import type { Transaction } from '@/types/database';
import {
  calculateDailyDecision,
  calculateMonthlyBudget,
  calculateCategoryBreakdown,
} from '@/lib/budget-engine';
import { toDateString, getDaysInMonth } from '@/lib/utils';

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
      const totalIncome = 0;
      const fixedExpenses = 0;

      // Empty data — real Supabase data will be loaded once integrated
      const allTransactions: Transaction[] = [];
      const variableTransactions: Transaction[] = [];

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
        [],
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
