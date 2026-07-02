// Finance OS - Recurring Expenses Store
// Shared store so Planner stays in sync with Settings' RecurringManager

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RecurringExpense } from '@/types/database';
import { recurringQueries } from '@/lib/supabase/queries';

// Start empty — populated from Supabase via syncWithSupabase

interface RecurringState {
  expenses: RecurringExpense[];
  supabaseSynced: boolean;
  addExpense: (expense: RecurringExpense) => Promise<void>;
  updateExpense: (id: string, updates: Partial<RecurringExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setExpenses: (expenses: RecurringExpense[]) => void;
  syncWithSupabase: () => Promise<void>;
}

export const useRecurringStore = create<RecurringState>()(
  persist(
    (set) => ({
      expenses: [],
      supabaseSynced: false,

      addExpense: async (expense) => {
        // Strip server-managed fields before creating via Supabase
        const created = await recurringQueries.create({
          name: expense.name,
          category_id: expense.category_id,
          account_id: expense.account_id,
          amount: expense.amount,
          frequency: expense.frequency,
          day_of_month: expense.day_of_month,
          day_of_week: expense.day_of_week,
          is_active: expense.is_active,
        });
        set((state) => ({ expenses: [...state.expenses, created] }));
      },

      updateExpense: async (id, updates) => {
        await recurringQueries.update(id, updates);
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e,
          ),
        }));
      },

      deleteExpense: async (id) => {
        await recurringQueries.delete(id);
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      setExpenses: (expenses) => set({ expenses }),

      syncWithSupabase: async () => {
        try {
          const expenses = await recurringQueries.list();
          set({ expenses, supabaseSynced: true });
        } catch {
          set({ supabaseSynced: true });
        }
      },
    }),
    {
      name: 'finos-recurring',
      // Only persist expenses; supabaseSynced is derived at runtime
      partialize: (state) => ({ expenses: state.expenses }),
    },
  ),
);
