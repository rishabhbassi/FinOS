// FinOS - Application Type Definitions

export interface BudgetDay {
  date: string;
  dayName: string;
  dayOfWeek: number;
  baseBudget: number;
  carryForward: number;
  available: number;
  spent: number;
  remaining: number;
  transactions: import('./database').Transaction[];
}

export interface BudgetWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalBudget: number;
  totalSpent: number;
  surplus: number;
  carryForward: number;
  days: BudgetDay[];
}

export interface BudgetMonth {
  month: string;
  totalIncome: number;
  fixedExpenses: number;
  variableBudget: number;
  totalSpent: number;
  savings: number;
  savingsRate: number;
  dailyBudget: number;
  weeks: BudgetWeek[];
}

export interface DailyDecision {
  available: number;
  spent: number;
  remaining: number;
  status: 'comfortable' | 'tight' | 'over';
  tomorrowBudget: number;
  daysLeftInMonth: number;
  monthlyRemaining: number;
}

export interface PlannerData {
  income: PlannerIncomeEntry[];
  fixedExpenses: PlannerExpenseEntry[];
  variableCategories: PlannerVariableEntry[];
  summary: PlannerSummary;
}

export interface PlannerIncomeEntry {
  categoryId: string;
  categoryName: string;
  planned: number;
  actual: number;
}

export interface PlannerExpenseEntry {
  categoryId: string;
  categoryName: string;
  planned: number;
  actual: number;
  isRecurring: boolean;
}

export type BudgetFrequency = 'daily' | 'weekly' | 'monthly';

export interface PlannerVariableEntry {
  categoryId: string;
  categoryName: string;
  dailyLimit: number;
  monthlyBudget: number;
  spent: number;
  remaining: number;
  frequency?: BudgetFrequency;
}

export interface PlannerSummary {
  totalIncome: number;
  totalFixed: number;
  totalVariable: number;
  projectedSavings: number;
  savingsRate: number;
  dailyBudget: number;
  weeklyBudget: number;
  remainingBudget: number;
}

export interface DashboardData {
  dailyDecision: DailyDecision;
  weekOverview: {
    available: number;
    spent: number;
    remaining: number;
    surplus: number;
  };
  monthOverview: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    projectedSavings: number;
  };
  categoryBreakdown: { name: string; amount: number; color: string; percentage: number }[];
  recentTransactions: import('./database').Transaction[];
  budgetTimeline: { day: string; available: number; spent: number }[];
  monthlyComparison: {
    thisMonth: { savings: number; expenses: number };
    lastMonth: { savings: number; expenses: number };
    change: { savings: number; expenses: number };
  };
}

export interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  categoryBreakdown: { name: string; amount: number; color: string; percentage: number }[];
  topExpenses: import('./database').Transaction[];
  dailyAverage: number;
  budgetUtilization: { category: string; budget: number; spent: number; percentage: number }[];
  monthlyTrend: { month: string; income: number; expenses: number; savings: number }[];
  netWorth: { month: string; value: number }[];
}

export interface TransactionFormData {
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category_id: string;
  account_id?: string;
  description: string;
  merchant: string;
  date: string;
  tags: string[];
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: 'income' | 'expense' | 'transfer';
  category_id?: string;
  account_id?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}
