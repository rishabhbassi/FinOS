// Finance OS - Transaction Actions
// Currently uses in-memory mock data. Supabase integration comes later.

import type { Transaction } from '@/types/database';
import type { TransactionFormData, TransactionFilters } from '@/types/app';
import { toDateString } from '@/lib/utils';

// Helper to generate dates in the current month
function d(day: number): string {
  const now = new Date();
  return toDateString(new Date(now.getFullYear(), now.getMonth(), day));
}

function isoDate(day: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), day);
  return date.toISOString();
}

const SAMPLE_TRANSACTIONS: Transaction[] = [
  // Income
  {
    id: 'tx-001', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-salary', amount: 85000,
    description: 'Monthly Salary', merchant: null,
    date: d(1), type: 'income', is_recurring: true, tags: ['salary', 'monthly'],
    created_at: isoDate(1), updated_at: isoDate(1),
  },
  {
    id: 'tx-002', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-freelancing', amount: 15000,
    description: 'Freelance project - website redesign', merchant: 'Upwork',
    date: d(5), type: 'income', is_recurring: false, tags: ['freelance', 'project'],
    created_at: isoDate(5), updated_at: isoDate(5),
  },
  {
    id: 'tx-003', user_id: 'mock-user', account_id: 'acc-002',
    category_id: 'cat-interest', amount: 1250,
    description: 'Savings account interest', merchant: null,
    date: d(1), type: 'income', is_recurring: true, tags: ['interest', 'passive'],
    created_at: isoDate(1), updated_at: isoDate(1),
  },
  {
    id: 'tx-004', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-dividend', amount: 3200,
    description: 'Stock dividends', merchant: 'Zerodha',
    date: d(10), type: 'income', is_recurring: false, tags: ['investment', 'dividend'],
    created_at: isoDate(10), updated_at: isoDate(10),
  },
  {
    id: 'tx-005', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-bonus', amount: 10000,
    description: 'Performance bonus', merchant: null,
    date: d(15), type: 'income', is_recurring: false, tags: ['bonus', 'performance'],
    created_at: isoDate(15), updated_at: isoDate(15),
  },

  // Expenses - Daily essentials
  {
    id: 'tx-006', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-food', amount: 450,
    description: 'Lunch at office cafeteria', merchant: 'Cafe Blue',
    date: d(2), type: 'expense', is_recurring: false, tags: ['lunch', 'office'],
    created_at: isoDate(2), updated_at: isoDate(2),
  },
  {
    id: 'tx-007', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-food', amount: 180,
    description: 'Morning coffee', merchant: 'Starbucks',
    date: d(2), type: 'expense', is_recurring: false, tags: ['coffee', 'morning'],
    created_at: isoDate(2), updated_at: isoDate(2),
  },
  {
    id: 'tx-008', user_id: 'mock-user', account_id: 'acc-003',
    category_id: 'cat-groceries', amount: 2340,
    description: 'Weekly grocery shopping', merchant: 'BigBasket',
    date: d(3), type: 'expense', is_recurring: false, tags: ['groceries', 'weekly'],
    created_at: isoDate(3), updated_at: isoDate(3),
  },
  {
    id: 'tx-009', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-food', amount: 320,
    description: 'Dinner at Italian restaurant', merchant: 'Little Italy',
    date: d(4), type: 'expense', is_recurring: false, tags: ['dinner', 'outing'],
    created_at: isoDate(4), updated_at: isoDate(4),
  },
  {
    id: 'tx-010', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-fuel', amount: 1800,
    description: 'Fuel refill', merchant: 'Indian Oil',
    date: d(5), type: 'expense', is_recurring: false, tags: ['fuel', 'car'],
    created_at: isoDate(5), updated_at: isoDate(5),
  },

  // Bills & subscriptions
  {
    id: 'tx-011', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-electricity', amount: 3120,
    description: 'Monthly electricity bill', merchant: 'Tata Power',
    date: d(6), type: 'expense', is_recurring: true, tags: ['utility', 'electricity'],
    created_at: isoDate(6), updated_at: isoDate(6),
  },
  {
    id: 'tx-012', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-internet', amount: 999,
    description: 'Broadband internet', merchant: 'Jio Fiber',
    date: d(7), type: 'expense', is_recurring: true, tags: ['internet', 'subscription'],
    created_at: isoDate(7), updated_at: isoDate(7),
  },
  {
    id: 'tx-013', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-subscription', amount: 299,
    description: 'Netflix subscription', merchant: 'Netflix',
    date: d(8), type: 'expense', is_recurring: true, tags: ['streaming', 'entertainment'],
    created_at: isoDate(8), updated_at: isoDate(8),
  },
  {
    id: 'tx-014', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-subscription', amount: 149,
    description: 'Spotify Premium', merchant: 'Spotify',
    date: d(8), type: 'expense', is_recurring: true, tags: ['music', 'subscription'],
    created_at: isoDate(8), updated_at: isoDate(8),
  },
  {
    id: 'tx-015', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-rent', amount: 15000,
    description: 'Monthly rent', merchant: 'Landlord',
    date: d(5), type: 'expense', is_recurring: true, tags: ['rent', 'housing'],
    created_at: isoDate(5), updated_at: isoDate(5),
  },

  // Shopping & lifestyle
  {
    id: 'tx-016', user_id: 'mock-user', account_id: 'acc-003',
    category_id: 'cat-shopping', amount: 5499,
    description: 'New running shoes', merchant: 'Nike',
    date: d(9), type: 'expense', is_recurring: false, tags: ['shoes', 'sports'],
    created_at: isoDate(9), updated_at: isoDate(9),
  },
  {
    id: 'tx-017', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-entertainment', amount: 1200,
    description: 'Movie tickets', merchant: 'PVR Cinemas',
    date: d(10), type: 'expense', is_recurring: false, tags: ['movie', 'entertainment'],
    created_at: isoDate(10), updated_at: isoDate(10),
  },
  {
    id: 'tx-018', user_id: 'mock-user', account_id: 'acc-003',
    category_id: 'cat-shopping', amount: 2999,
    description: 'Smartwatch band', merchant: 'Amazon',
    date: d(12), type: 'expense', is_recurring: false, tags: ['accessory', 'online'],
    created_at: isoDate(12), updated_at: isoDate(12),
  },

  // Medical & Health
  {
    id: 'tx-019', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-medical', amount: 800,
    description: 'General checkup', merchant: 'Apollo Clinic',
    date: d(11), type: 'expense', is_recurring: false, tags: ['health', 'checkup'],
    created_at: isoDate(11), updated_at: isoDate(11),
  },
  {
    id: 'tx-020', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-insurance', amount: 4500,
    description: 'Health insurance premium', merchant: 'HDFC Life',
    date: d(15), type: 'expense', is_recurring: true, tags: ['insurance', 'health'],
    created_at: isoDate(15), updated_at: isoDate(15),
  },

  // Travel
  {
    id: 'tx-021', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-travel', amount: 560,
    description: 'Cab to client meeting', merchant: 'Uber',
    date: d(13), type: 'expense', is_recurring: false, tags: ['travel', 'cab'],
    created_at: isoDate(13), updated_at: isoDate(13),
  },
  {
    id: 'tx-022', user_id: 'mock-user', account_id: 'acc-003',
    category_id: 'cat-travel', amount: 3200,
    description: 'Weekend trip bus tickets', merchant: 'RedBus',
    date: d(14), type: 'expense', is_recurring: false, tags: ['travel', 'weekend'],
    created_at: isoDate(14), updated_at: isoDate(14),
  },

  // EMI
  {
    id: 'tx-023', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-emi', amount: 8500,
    description: 'Car loan EMI', merchant: 'HDFC Bank',
    date: d(5), type: 'expense', is_recurring: true, tags: ['loan', 'car'],
    created_at: isoDate(5), updated_at: isoDate(5),
  },
  {
    id: 'tx-024', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-bills', amount: 399,
    description: 'Mobile phone bill', merchant: 'Jio',
    date: d(10), type: 'expense', is_recurring: true, tags: ['mobile', 'bill'],
    created_at: isoDate(10), updated_at: isoDate(10),
  },

  // Education
  {
    id: 'tx-025', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-education', amount: 2500,
    description: 'Online course - React Advanced', merchant: 'Udemy',
    date: d(16), type: 'expense', is_recurring: false, tags: ['course', 'learning'],
    created_at: isoDate(16), updated_at: isoDate(16),
  },

  // More daily expenses
  {
    id: 'tx-026', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-food', amount: 350,
    description: 'Breakfast at cafe', merchant: 'Corner House',
    date: d(17), type: 'expense', is_recurring: false, tags: ['breakfast'],
    created_at: isoDate(17), updated_at: isoDate(17),
  },
  {
    id: 'tx-027', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-food', amount: 620,
    description: 'Team lunch', merchant: 'Barbeque Nation',
    date: d(18), type: 'expense', is_recurring: false, tags: ['team', 'lunch'],
    created_at: isoDate(18), updated_at: isoDate(18),
  },
  {
    id: 'tx-028', user_id: 'mock-user', account_id: 'acc-003',
    category_id: 'cat-groceries', amount: 1870,
    description: 'Fruits and vegetables', merchant: 'Local Market',
    date: d(19), type: 'expense', is_recurring: false, tags: ['groceries', 'fresh'],
    created_at: isoDate(19), updated_at: isoDate(19),
  },

  // Gift
  {
    id: 'tx-029', user_id: 'mock-user', account_id: 'acc-001',
    category_id: 'cat-gift', amount: 2000,
    description: 'Birthday gift for friend', merchant: null,
    date: d(20), type: 'expense', is_recurring: false, tags: ['gift', 'birthday'],
    created_at: isoDate(20), updated_at: isoDate(20),
  },

  // Misc
  {
    id: 'tx-030', user_id: 'mock-user', account_id: 'acc-003',
    category_id: 'cat-misc', amount: 350,
    description: 'Parking charges', merchant: 'Parking Lot',
    date: d(21), type: 'expense', is_recurring: false, tags: ['parking', 'misc'],
    created_at: isoDate(21), updated_at: isoDate(21),
  },
];

// In-memory store
let transactions = [...SAMPLE_TRANSACTIONS];

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  await new Promise((r) => setTimeout(r, 100));

  let result = [...transactions];

  if (filters) {
    if (filters.type) {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.dateFrom) {
      result = result.filter((t) => t.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((t) => t.date <= filters.dateTo!);
    }
    if (filters.category_id) {
      result = result.filter((t) => t.category_id === filters.category_id);
    }
    if (filters.account_id) {
      result = result.filter((t) => t.account_id === filters.account_id);
    }
    if (filters.minAmount !== undefined) {
      result = result.filter((t) => t.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      result = result.filter((t) => t.amount <= filters.maxAmount!);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.description ?? '').toLowerCase().includes(q) ||
          (t.merchant ?? '').toLowerCase().includes(q) ||
          (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
      );
    }
  }

  // Sort by date descending
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return result;
}

export async function createTransaction(data: TransactionFormData): Promise<Transaction> {
  await new Promise((r) => setTimeout(r, 150));

  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    user_id: 'mock-user',
    account_id: data.account_id ?? null,
    category_id: data.category_id,
    amount: data.type === 'expense' ? Math.abs(data.amount) : data.amount,
    description: data.description || null,
    merchant: data.merchant || null,
    date: data.date,
    type: data.type,
    is_recurring: false,
    tags: data.tags ?? [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  transactions.unshift(newTx);
  return newTx;
}

export async function updateTransaction(id: string, data: Partial<TransactionFormData>): Promise<Transaction> {
  await new Promise((r) => setTimeout(r, 150));

  const idx = transactions.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Transaction not found');

  const updated = { ...transactions[idx] };

  if (data.amount !== undefined) {
    updated.amount = data.amount;
  }
  if (data.type !== undefined) {
    updated.type = data.type;
  }
  if (data.category_id !== undefined) {
    updated.category_id = data.category_id;
  }
  if (data.account_id !== undefined) {
    updated.account_id = data.account_id ?? null;
  }
  if (data.description !== undefined) {
    updated.description = data.description || null;
  }
  if (data.merchant !== undefined) {
    updated.merchant = data.merchant || null;
  }
  if (data.date !== undefined) {
    updated.date = data.date;
  }
  if (data.tags !== undefined) {
    updated.tags = data.tags;
  }

  updated.updated_at = new Date().toISOString();
  transactions[idx] = updated;

  return updated;
}

export async function deleteTransaction(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));

  const idx = transactions.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Transaction not found');

  transactions.splice(idx, 1);
}

export async function getAccounts(): Promise<import('@/types/database').Account[]> {
  await new Promise((r) => setTimeout(r, 50));

  return [
    {
      id: 'acc-001',
      user_id: 'mock-user',
      name: 'Savings Account',
      type: 'savings',
      balance: 125000,
      credit_limit: null,
      billing_date: null,
      due_date: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
    },
    {
      id: 'acc-002',
      user_id: 'mock-user',
      name: 'Salary Account',
      type: 'current',
      balance: 45000,
      credit_limit: null,
      billing_date: null,
      due_date: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
    },
    {
      id: 'acc-003',
      user_id: 'mock-user',
      name: 'Credit Card',
      type: 'credit',
      balance: -12500,
      credit_limit: 150000,
      billing_date: 5,
      due_date: 20,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
    },
    {
      id: 'acc-004',
      user_id: 'mock-user',
      name: 'Cash Wallet',
      type: 'cash',
      balance: 3500,
      credit_limit: null,
      billing_date: null,
      due_date: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
    },
    {
      id: 'acc-005',
      user_id: 'mock-user',
      name: 'Paytm Wallet',
      type: 'wallet',
      balance: 1200,
      credit_limit: null,
      billing_date: null,
      due_date: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
    },
  ];
}

export function resetTransactions(): void {
  transactions = [...SAMPLE_TRANSACTIONS];
}
