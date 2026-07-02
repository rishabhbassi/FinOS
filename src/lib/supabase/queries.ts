// Finance OS - Supabase CRUD Queries
// Centralized typed queries for all database operations

import { supabase } from './client';
import type {
  Category,
  Account,
  Transaction,
  BudgetRule,
  RecurringExpense,
  Investment,
  Goal,
} from '@/types/database';

// ─── Helper ────────────────────────────────────────────────────────────────

function getUserId(): string | null {
  try {
    const raw = localStorage.getItem('finos-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Categories ────────────────────────────────────────────────────────────

export const categoryQueries = {
  async list(): Promise<Category[]> {
    const user_id = getUserId();
    if (!user_id) return [];
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user_id)
      .order('name');
    if (error) throw error;
    return data ?? [];
  },

  async create(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const user_id = getUserId();
    if (!user_id) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, user_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Category>): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ─── Accounts ──────────────────────────────────────────────────────────────

export const accountQueries = {
  async list(): Promise<Account[]> {
    const user_id = getUserId();
    if (!user_id) return [];
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .order('name');
    if (error) throw error;
    return data ?? [];
  },

  async create(account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const user_id = getUserId();
    if (!user_id) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('accounts')
      .insert([{ ...account, user_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Account>): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ─── Transactions ──────────────────────────────────────────────────────────

export const transactionQueries = {
  async list(limit = 50): Promise<Transaction[]> {
    const user_id = getUserId();
    if (!user_id) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async create(tx: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const user_id = getUserId();
    if (!user_id) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...tx, user_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getByDateRange(from: string, to: string): Promise<Transaction[]> {
    const user_id = getUserId();
    if (!user_id) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

// ─── Recurring Expenses ────────────────────────────────────────────────────

export const recurringQueries = {
  async list(): Promise<RecurringExpense[]> {
    const user_id = getUserId();
    if (!user_id) return [];
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user_id)
      .order('name');
    if (error) throw error;
    return data ?? [];
  },

  async create(expense: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<RecurringExpense> {
    const user_id = getUserId();
    if (!user_id) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert([{ ...expense, user_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<RecurringExpense>): Promise<void> {
    const { error } = await supabase
      .from('recurring_expenses')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ─── Goals ─────────────────────────────────────────────────────────────────

export const goalQueries = {
  async list(): Promise<Goal[]> {
    const user_id = getUserId();
    if (!user_id) return [];
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const user_id = getUserId();
    if (!user_id) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goal, user_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Goal>): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ─── Investments ───────────────────────────────────────────────────────────

export const investmentQueries = {
  async list(): Promise<Investment[]> {
    const user_id = getUserId();
    if (!user_id) return [];
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user_id)
      .order('name');
    if (error) throw error;
    return data ?? [];
  },

  async create(investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Investment> {
    const user_id = getUserId();
    if (!user_id) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('investments')
      .insert([{ ...investment, user_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Investment>): Promise<void> {
    const { error } = await supabase
      .from('investments')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ─── Budget Rules ──────────────────────────────────────────────────────────

export const budgetRuleQueries = {
  async list(): Promise<BudgetRule[]> {
    const user_id = getUserId();
    if (!user_id) return [];
    const { data, error } = await supabase
      .from('budget_rules')
      .select('*')
      .eq('user_id', user_id)
      .order('name');
    if (error) throw error;
    return data ?? [];
  },

  async create(rule: Omit<BudgetRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<BudgetRule> {
    const user_id = getUserId();
    if (!user_id) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('budget_rules')
      .insert([{ ...rule, user_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<BudgetRule>): Promise<void> {
    const { error } = await supabase
      .from('budget_rules')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('budget_rules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getActive(): Promise<BudgetRule[]> {
    const user_id = getUserId();
    if (!user_id) return [];
    const { data, error } = await supabase
      .from('budget_rules')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true);
    if (error) throw error;
    return data ?? [];
  },
};

// ─── Monthly Snapshots ─────────────────────────────────────────────────────

export const snapshotQueries = {
  async getByMonth(month: string): Promise<{ total_income: number; total_expenses: number; savings: number } | null> {
    const user_id = getUserId();
    if (!user_id) return null;
    const { data, error } = await supabase
      .from('monthly_snapshots')
      .select('total_income, total_expenses, savings')
      .eq('user_id', user_id)
      .eq('month', month)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};
