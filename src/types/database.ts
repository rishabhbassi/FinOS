// FinOS - Database Type Definitions
// These match the Supabase schema exactly

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'savings' | 'current' | 'credit' | 'cash' | 'wallet' | 'upi';
  balance: number;
  credit_limit: number | null;
  billing_date: number | null;
  due_date: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer';
  icon: string;
  color: string;
  is_system: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  amount: number;
  description: string | null;
  merchant: string | null;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  is_recurring: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface BudgetRule {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'fixed';
  amount: number;
  day_multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  category_id: string | null;
  account_id: string | null;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'weekly';
  day_of_month: number | null;
  day_of_week: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  type: 'sip' | 'stock' | 'mutual_fund' | 'fd' | 'ppf' | 'gold' | 'crypto' | 'other';
  name: string;
  amount_invested: number;
  current_value: number;
  sip_amount: number | null;
  sip_day: number | null;
  provider: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  monthly_contribution: number | null;
  icon: string;
  color: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlySnapshot {
  id: string;
  user_id: string;
  month: string;
  total_income: number;
  total_expenses: number;
  fixed_expenses: number;
  variable_expenses: number;
  savings: number;
  savings_rate: number;
  net_worth: number;
  created_at: string;
}
