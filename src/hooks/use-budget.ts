import { useState, useCallback, useEffect } from 'react';
import type { DailyDecision, BudgetMonth } from '@/types/app';
import type { Transaction } from '@/types/database';
import { calculateDailyDecision, calculateMonthlyBudget } from '@/lib/budget-engine';
import { generateId, toDateString } from '@/lib/utils';

interface CategoryConfig {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  transactionCount: number;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'food', name: 'Food', minAmount: 100, maxAmount: 800, transactionCount: 10 },
  { id: 'groceries', name: 'Groceries', minAmount: 300, maxAmount: 1500, transactionCount: 5 },
  { id: 'fuel', name: 'Fuel', minAmount: 500, maxAmount: 1200, transactionCount: 4 },
  { id: 'shopping', name: 'Shopping', minAmount: 300, maxAmount: 1500, transactionCount: 4 },
  { id: 'entertainment', name: 'Entertainment', minAmount: 200, maxAmount: 1000, transactionCount: 3 },
  { id: 'medical', name: 'Medical', minAmount: 200, maxAmount: 1000, transactionCount: 2 },
  { id: 'travel', name: 'Travel', minAmount: 300, maxAmount: 1500, transactionCount: 3 },
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

function randomAmount(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function randomDate(year: number, month: number): string {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateSampleTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = new Date().toISOString();
  const transactions: Transaction[] = [];

  // Income: Salary 59000
  transactions.push({
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

  // Variable expense transactions (fixed expenses handled via parameters)
  for (const cat of CATEGORIES) {
    const merchants = MERCHANTS[cat.name] ?? ['Store'];
    for (let i = 0; i < cat.transactionCount; i++) {
      const amount = randomAmount(cat.minAmount, cat.maxAmount);
      const d = randomDate(year, month);
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];

      transactions.push({
        id: generateId(),
        user_id: 'demo-user',
        account_id: null,
        category_id: cat.id,
        amount: -amount,
        description: `${cat.name} at ${merchant}`,
        merchant,
        date: d,
        type: 'expense',
        is_recurring: false,
        tags: [],
        created_at: timestamp,
        updated_at: timestamp,
      });
    }
  }

  return transactions;
}

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
      // Income: Salary 59000
      const totalIncome = 59000;
      // Fixed expenses: Rent 21000 + Electricity 1200 + Internet 1000 + SIP 7000
      const fixedExpenses = 21000 + 1200 + 1000 + 7000;

      // Generate random sample transactions for the current month
      const transactions = generateSampleTransactions();

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
