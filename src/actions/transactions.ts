// FinOS - Transaction Actions
// Real Supabase queries

import { transactionQueries } from '@/lib/supabase/queries';
import type { Transaction } from '@/types/database';
import type { TransactionFilters, TransactionFormData } from '@/types/app';

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  try {
    const all = await transactionQueries.list(500);
    let filtered = all;

    if (filters?.dateFrom) {
      filtered = filtered.filter((t) => t.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      filtered = filtered.filter((t) => t.date <= filters.dateTo!);
    }
    if (filters?.type && filters.type !== 'transfer') {
      filtered = filtered.filter((t) => t.type === filters.type);
    }
    if (filters?.category_id) {
      filtered = filtered.filter((t) => t.category_id === filters.category_id);
    }
    if (filters?.account_id) {
      filtered = filtered.filter((t) => t.account_id === filters.account_id);
    }
    if (filters?.minAmount !== undefined) {
      filtered = filtered.filter((t) => Math.abs(t.amount) >= filters.minAmount!);
    }
    if (filters?.maxAmount !== undefined) {
      filtered = filtered.filter((t) => Math.abs(t.amount) <= filters.maxAmount!);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.merchant?.toLowerCase().includes(q) ||
          t.category_id?.toLowerCase().includes(q),
      );
    }

    return filtered;
  } catch {
    return [];
  }
}

export async function createTransaction(data: {
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category_id: string;
  account_id?: string | null;
  description: string;
  merchant?: string;
  date: string;
  tags?: string[];
  is_recurring?: boolean;
}): Promise<Transaction> {
  return transactionQueries.create({
    amount: data.amount,
    type: data.type === 'transfer' ? 'expense' : data.type,
    category_id: data.category_id,
    account_id: data.account_id ?? null,
    description: data.description,
    merchant: data.merchant ?? '',
    date: data.date,
    tags: data.tags ?? [],
    is_recurring: data.is_recurring ?? false,
  });
}

export async function updateTransaction(id: string, data: Partial<TransactionFormData>): Promise<Transaction> {
  const updates: Partial<Transaction> = { ...data };
  if (data.type === 'transfer') updates.type = 'expense';
  await transactionQueries.update(id, updates);
  const txns = await transactionQueries.list(500);
  const updated = txns.find((t) => t.id === id);
  if (!updated) throw new Error('Transaction not found after update');
  return updated;
}

export async function deleteTransaction(id: string): Promise<void> {
  await transactionQueries.delete(id);
}

export async function getAccounts(): Promise<import('@/types/database').Account[]> {
  try {
    const { accountQueries } = await import('@/lib/supabase/queries');
    return await accountQueries.list();
  } catch {
    return [];
  }
}
