// Finance OS - useTransactions Hook

import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/types/database';
import type { TransactionFormData, TransactionFilters } from '@/types/app';
import * as transactionActions from '@/actions/transactions';

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTransaction: (data: TransactionFormData) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

export function useTransactions(filters?: TransactionFilters): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionActions.getTransactions(filters);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters?.dateFrom, filters?.dateTo, filters?.type, filters?.category_id, filters?.account_id, filters?.minAmount, filters?.maxAmount, filters?.search]);

  const createTransaction = useCallback(async (data: TransactionFormData) => {
    const newTx = await transactionActions.createTransaction(data);
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionFormData>) => {
    const updated = await transactionActions.updateTransaction(id, data);
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await transactionActions.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

// Hook to get accounts
export function useAccounts() {
  const [accounts, setAccounts] = useState<import('@/types/database').Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionActions.getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, error, refetch: fetchAccounts };
}
