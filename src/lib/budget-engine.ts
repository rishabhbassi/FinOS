// Finance OS - The Budget Engine
// Core logic: calculates what you can spend at any given moment.
// Everything revolves around remaining money, not money already spent.

import type {
  Transaction, BudgetRule, BudgetDay, BudgetWeek,
  BudgetMonth, DailyDecision, PlannerSummary
} from '../types/app';
import { getDaysLeftInMonth, getDaysInMonth, getDayName, getWeekNumber, toDateString, getStatus } from './utils';

/**
 * Calculate the monthly budget derivation:
 * Total income - fixed expenses = available for the month
 * Then divide by days remaining for daily budget
 */
export function calculateMonthlyBudget(
  totalIncome: number,
  fixedExpenses: number,
  transactions: Transaction[],
  rules: BudgetRule[],
  date: Date = new Date()
): BudgetMonth {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Available for variable spending
  const variableBudget = totalIncome - fixedExpenses;
  const dailyBudget = variableBudget / daysInMonth;

  // Get transactions for this month
  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === year && tDate.getMonth() === month;
  });

  // Build day-by-day budget
  const weeks: BudgetWeek[] = [];
  let weekCarryForward = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dateStr = toDateString(currentDate);
    const dayOfWeek = currentDate.getDay();

    // Day's transactions
    const dayTransactions = monthTransactions.filter(t => t.date === dateStr);
    const daySpent = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Apply daily budget with carry forward
    const baseBudget = dailyBudget;
    const available = baseBudget + weekCarryForward;
    const remaining = available - daySpent;
    const carryForward = remaining;

    const budgetDay: BudgetDay = {
      date: dateStr,
      dayName: getDayName(currentDate),
      dayOfWeek,
      baseBudget,
      carryForward,
      available,
      spent: daySpent,
      remaining,
      transactions: dayTransactions,
    };

    weekCarryForward = carryForward;

    // Group into weeks
    const weekNum = getWeekNumber(currentDate);
    if (!weeks[weekNum - 1]) {
      weeks[weekNum - 1] = {
        weekNumber: weekNum,
        startDate: dateStr,
        endDate: dateStr,
        totalBudget: 0,
        totalSpent: 0,
        surplus: 0,
        carryForward: 0,
        days: [],
      };
    }

    weeks[weekNum - 1].days.push(budgetDay);
    weeks[weekNum - 1].endDate = dateStr;
  }

  // Calculate week totals
  for (const week of weeks) {
    week.totalBudget = week.days.reduce((sum, d) => sum + d.baseBudget, 0);
    week.totalSpent = week.days.reduce((sum, d) => sum + d.spent, 0);
    week.surplus = week.totalBudget - week.totalSpent;
    week.carryForward = week.days[week.days.length - 1]?.carryForward ?? 0;
  }

  const totalSpent = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    month: monthStr,
    totalIncome,
    fixedExpenses,
    variableBudget,
    totalSpent,
    savings: totalIncome - fixedExpenses - totalSpent,
    savingsRate: totalIncome > 0 ? ((totalIncome - fixedExpenses - totalSpent) / totalIncome) * 100 : 0,
    dailyBudget,
    weeks,
  };
}

/**
 * Get today's decision: "Can I afford this?"
 * Returns what you need to know right now.
 */
export function calculateDailyDecision(
  totalIncome: number,
  fixedExpenses: number,
  transactions: Transaction[],
  date: Date = new Date()
): DailyDecision {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const variableBudget = totalIncome - fixedExpenses;
  const dailyBudget = variableBudget / daysInMonth;
  const daysLeft = getDaysLeftInMonth(date);

  // Month's expenses so far
  const monthExpenses = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year
        && tDate.getMonth() === month
        && t.type === 'expense';
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Today's expenses
  const todayStr = toDateString(date);
  const todaySpent = transactions
    .filter(t => t.date === todayStr && t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Remaining for today after carry-over
  const daysElapsed = date.getDate();
  const expectedSoFar = dailyBudget * daysElapsed;
  const surplusOrDeficit = expectedSoFar - monthExpenses;
  const todayBase = dailyBudget;
  const todayAvailable = todayBase + surplusOrDeficit;
  const todayRemaining = todayAvailable - todaySpent;

  // Tomorrow's budget preview
  const tomorrowSurplus = todayRemaining;
  const tomorrowBudget = dailyBudget + tomorrowSurplus;

  const monthRemaining = variableBudget - monthExpenses;
  const status = getStatus(todayRemaining);

  return {
    available: Math.round(todayAvailable),
    spent: Math.round(todaySpent),
    remaining: Math.round(todayRemaining),
    status,
    tomorrowBudget: Math.round(tomorrowBudget),
    daysLeftInMonth: daysLeft,
    monthlyRemaining: Math.round(monthRemaining),
  };
}

/**
 * Calculate the planner summary based on income and expense targets
 */
export function calculatePlannerSummary(
  incomeEntries: { planned: number; actual: number }[],
  fixedExpenseEntries: { planned: number; actual: number }[],
  variableCategories: { dailyLimit: number }[],
  transactions: Transaction[],
  date: Date = new Date()
): PlannerSummary {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.planned, 0);
  const totalFixed = fixedExpenseEntries.reduce((sum, e) => sum + e.planned, 0);
  const totalVariableBudget = variableCategories.reduce((sum, c) => sum + (c.dailyLimit * daysInMonth), 0);
  const projectedSavings = totalIncome - totalFixed - totalVariableBudget;
  const savingsRate = totalIncome > 0 ? (projectedSavings / totalIncome) * 100 : 0;

  // Actual spending this month
  const monthSpent = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year
        && tDate.getMonth() === month
        && t.type === 'expense';
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const variableBudget = totalVariableBudget;
  const remaining = variableBudget - monthSpent;

  return {
    totalIncome,
    totalFixed,
    totalVariable: variableBudget,
    projectedSavings,
    savingsRate,
    dailyBudget: Math.round(variableBudget / daysInMonth),
    weeklyBudget: Math.round(variableBudget / daysInMonth * 7),
    remainingBudget: Math.round(remaining),
  };
}

/**
 * Calculate category breakdown for dashboard/reports
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: { id: string; name: string; color: string }[]
): { name: string; amount: number; color: string; percentage: number }[] {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const total = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const grouped = new Map<string, number>();
  for (const t of expenseTransactions) {
    const catId = t.category_id || 'uncategorized';
    grouped.set(catId, (grouped.get(catId) || 0) + Math.abs(t.amount));
  }

  const catMap = new Map(categories.map(c => [c.id, c]));

  return Array.from(grouped.entries())
    .map(([catId, amount]) => {
      const cat = catMap.get(catId);
      return {
        name: cat?.name ?? 'Uncategorized',
        amount: Math.round(amount),
        color: cat?.color ?? '#6b7280',
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate budget utilization (spent vs budget per category)
 */
export function calculateBudgetUtilization(
  rules: BudgetRule[],
  transactions: Transaction[],
  date: Date = new Date()
): { category: string; budget: number; spent: number; percentage: number }[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === year && tDate.getMonth() === month && t.type === 'expense';
  });

  return rules.map(rule => {
    const spent = monthTransactions
      .filter(t => t.category_id === rule.category_id)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const budget = rule.type === 'daily'
      ? rule.amount * getDaysInMonth(year, month)
      : rule.type === 'weekly'
        ? rule.amount * Math.ceil(getDaysInMonth(year, month) / 7)
        : rule.amount;

    return {
      category: rule.name,
      budget: Math.round(budget),
      spent: Math.round(spent),
      percentage: budget > 0 ? Math.round((spent / budget) * 100) : 0,
    };
  });
}

/**
 * Calculate net worth (total assets - total liabilities)
 */
export function calculateNetWorth(
  accounts: { type: string; balance: number; credit_limit: number | null }[],
  investments: { current_value: number }[]
): number {
  const totalBalance = accounts
    .filter(a => a.type !== 'credit')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalCredit = accounts
    .filter(a => a.type === 'credit')
    .reduce((sum, a) => sum + a.balance, 0); // positive = debt owed

  const totalInvestments = investments.reduce((sum, i) => sum + i.current_value, 0);

  return totalBalance - totalCredit + totalInvestments;
}
