// Finance OS - Recurring Expenses Store
// Shared store so Planner stays in sync with Settings' RecurringManager

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RecurringExpense } from '@/types/database';

const DEFAULT_RECURRING: RecurringExpense[] = [
  { id: 'rec-1', user_id: '', category_id: 'Rent', account_id: null, name: 'Rent', amount: 21000, frequency: 'monthly', day_of_month: 1, day_of_week: null, is_active: true, created_at: '', updated_at: '' },
  { id: 'rec-2', user_id: '', category_id: 'Electricity', account_id: null, name: 'Electricity Bill', amount: 1200, frequency: 'monthly', day_of_month: 5, day_of_week: null, is_active: true, created_at: '', updated_at: '' },
  { id: 'rec-3', user_id: '', category_id: 'Internet', account_id: null, name: 'Internet Plan', amount: 1000, frequency: 'monthly', day_of_month: 10, day_of_week: null, is_active: true, created_at: '', updated_at: '' },
  { id: 'rec-4', user_id: '', category_id: 'SIP', account_id: null, name: 'SIP Investment', amount: 7000, frequency: 'monthly', day_of_month: 3, day_of_week: null, is_active: true, created_at: '', updated_at: '' },
  { id: 'rec-5', user_id: '', category_id: 'Entertainment', account_id: null, name: 'Netflix', amount: 500, frequency: 'monthly', day_of_month: 15, day_of_week: null, is_active: true, created_at: '', updated_at: '' },
  { id: 'rec-6', user_id: '', category_id: 'Misc', account_id: null, name: 'Gym Membership', amount: 2000, frequency: 'monthly', day_of_month: 1, day_of_week: null, is_active: false, created_at: '', updated_at: '' },
];

interface RecurringState {
  expenses: RecurringExpense[];
  addExpense: (expense: RecurringExpense) => void;
  updateExpense: (id: string, updates: Partial<RecurringExpense>) => void;
  deleteExpense: (id: string) => void;
  setExpenses: (expenses: RecurringExpense[]) => void;
}

export const useRecurringStore = create<RecurringState>()(
  persist(
    (set) => ({
      expenses: DEFAULT_RECURRING,

      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, expense] })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      setExpenses: (expenses) => set({ expenses }),
    }),
    { name: 'finos-recurring' },
  ),
);
