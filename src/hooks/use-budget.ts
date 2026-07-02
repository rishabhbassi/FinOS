import { useState, useCallback, useEffect } from 'react';
import type { DailyDecision, BudgetMonth } from '@/types/app';
import type { Transaction } from '@/types/database';
import { calculateDailyDecision, calculateMonthlyBudget } from '@/lib/budget-engine';
import { toDateString } from '@/lib/utils';

export function useBudget(): {
  dailyDecision: DailyDecision | null;
  weekData: { available: number; spent: number; remaining: number; surplus: number } | null;
  monthData: BudgetMonth | null;
  timeline: { day: string; available: number; spent: number }[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [dailyDecision, setDailyDecision] = useState<DailyDecision | null>(null);
  const [weekData, setWeekData] = useState<{
    available: number;
    spent: number;
    remaining: number;
    surplus: number;
  } | null>(null);
  const [monthData, setMonthData] = useState<BudgetMonth | null>(null);
  const [timeline, setTimeline] = useState<
    { day: string; available: number; spent: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const compute = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      // Empty data — user will add their own income and expenses
      const totalIncome = 0;
      const fixedExpenses = 0;

      // No transactions yet — real data loads from Supabase once integrated
      const transactions: Transaction[] = [];

      // Compute daily decision from budget engine
      const decision = calculateDailyDecision(
        totalIncome,
        fixedExpenses,
        transactions,
        now,
      );

      // Compute full monthly budget from budget engine
      const month = calculateMonthlyBudget(
        totalIncome,
        fixedExpenses,
        transactions,
        [],
        now,
      );

      // Find current week from the month data
      const todayStr = toDateString(now);
      const currentWeek = month.weeks.find(
        (w) => todayStr >= w.startDate && todayStr <= w.endDate,
      );

      // Aggregate week data from the current week
      if (currentWeek) {
        setWeekData({
          available: currentWeek.totalBudget,
          spent: currentWeek.totalSpent,
          remaining: currentWeek.totalBudget - currentWeek.totalSpent,
          surplus: currentWeek.surplus,
        });
      } else {
        setWeekData(null);
      }

      // Compute timeline from all days across all weeks
      const computedTimeline: { day: string; available: number; spent: number }[] =
        [];
      for (const week of month.weeks) {
        for (const day of week.days) {
          computedTimeline.push({
            day: day.date,
            available: day.available,
            spent: day.spent,
          });
        }
      }

      setDailyDecision(decision);
      setMonthData(month);
      setTimeline(computedTimeline);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to compute budget data',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulate a brief loading delay on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      compute();
    }, 300);
    return () => clearTimeout(timer);
  }, [compute]);

  const refresh = useCallback(() => {
    compute();
  }, [compute]);

  return {
    dailyDecision,
    weekData,
    monthData,
    timeline,
    loading,
    error,
    refresh,
  };
}
