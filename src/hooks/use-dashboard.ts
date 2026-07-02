import { useState, useCallback, useEffect } from 'react';
import type { DashboardData } from '@/types/app';
import type { Transaction } from '@/types/database';
import {
  calculateDailyDecision,
  calculateMonthlyBudget,
  calculateCategoryBreakdown,
} from '@/lib/budget-engine';
import { toDateString, getDaysInMonth } from '@/lib/utils';
import { transactionQueries } from '@/lib/supabase/queries';

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

  const compute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();

      // Load real transactions from Supabase
      const allTransactions = await transactionQueries.list(100);

      const totalIncome = allTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const totalExpenses = allTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // If no transactions at all, show empty state
      if (allTransactions.length === 0) {
        setDashboardData(null);
        setLoading(false);
        return;
      }

      const variableTransactions = allTransactions.filter((t) => t.type === 'expense');

      // Daily decision
      const dailyDecision = calculateDailyDecision(
        totalIncome,
        totalExpenses,
        variableTransactions,
        now,
      );

      // Category breakdown
      const categoryBreakdown = calculateCategoryBreakdown(allTransactions, []);

      // Monthly budget to derive week overview and timeline
      const monthBudget = calculateMonthlyBudget(
        totalIncome,
        totalExpenses,
        variableTransactions,
        [],
        now,
      );

      // Current week overview
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

      // Month overview
      const monthOverview = computeMonthOverview(allTransactions, totalIncome);

      // Recent transactions
      const recentTransactions = allTransactions.slice(0, 10);

      // Budget timeline
      const budgetTimeline: { day: string; available: number; spent: number }[] = [];
      for (const week of monthBudget.weeks) {
        for (const day of week.days) {
          budgetTimeline.push({ day: day.date, available: day.available, spent: day.spent });
        }
      }

      // Monthly comparison
      const monthlyComparison = {
        thisMonth: {
          savings: monthOverview.savings,
          expenses: monthOverview.expenses,
        },
        lastMonth: { savings: 0, expenses: 0 },
        change: {
          savings: monthOverview.savings,
          expenses: monthOverview.expenses,
        },
      };

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
      setError(err instanceof Error ? err.message : 'Failed to compute dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount. Re-compute when window regains focus or user adds data.
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    compute();
  }, [compute, refreshKey]);

  // Also re-compute when the window gains focus (e.g. user returns from another tab)
  useEffect(() => {
    const onFocus = () => setRefreshKey((k) => k + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

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
