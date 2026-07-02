// Finance OS - Category Actions
// Currently uses in-memory mock data. Supabase integration comes later.

import type { Category } from '@/types/database';

const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  { id: 'cat-salary', user_id: 'mock-user', name: 'Salary', type: 'income', icon: 'banknote', color: '#22c55e', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-bonus', user_id: 'mock-user', name: 'Bonus', type: 'income', icon: 'gift', color: '#16a34a', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-freelancing', user_id: 'mock-user', name: 'Freelancing', type: 'income', icon: 'laptop', color: '#15803d', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-refund', user_id: 'mock-user', name: 'Refund', type: 'income', icon: 'rotate-ccw', color: '#65a30d', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-interest', user_id: 'mock-user', name: 'Interest', type: 'income', icon: 'percent', color: '#ca8a04', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-dividend', user_id: 'mock-user', name: 'Dividend', type: 'income', icon: 'coins', color: '#d97706', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-other-income', user_id: 'mock-user', name: 'Other Income', type: 'income', icon: 'plus-circle', color: '#a16207', is_system: true, created_at: '2024-01-01T00:00:00Z' },

  // Expense categories
  { id: 'cat-food', user_id: 'mock-user', name: 'Food', type: 'expense', icon: 'utensils-crossed', color: '#ef4444', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-groceries', user_id: 'mock-user', name: 'Groceries', type: 'expense', icon: 'shopping-basket', color: '#dc2626', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-fuel', user_id: 'mock-user', name: 'Fuel', type: 'expense', icon: 'fuel', color: '#f97316', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-rent', user_id: 'mock-user', name: 'Rent', type: 'expense', icon: 'building', color: '#eab308', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-electricity', user_id: 'mock-user', name: 'Electricity', type: 'expense', icon: 'zap', color: '#a855f7', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-internet', user_id: 'mock-user', name: 'Internet', type: 'expense', icon: 'wifi', color: '#6366f1', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-shopping', user_id: 'mock-user', name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-entertainment', user_id: 'mock-user', name: 'Entertainment', type: 'expense', icon: 'clapperboard', color: '#f43f5e', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-medical', user_id: 'mock-user', name: 'Medical', type: 'expense', icon: 'heart-pulse', color: '#e11d48', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-travel', user_id: 'mock-user', name: 'Travel', type: 'expense', icon: 'plane', color: '#0ea5e9', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-education', user_id: 'mock-user', name: 'Education', type: 'expense', icon: 'graduation-cap', color: '#06b6d4', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-gift', user_id: 'mock-user', name: 'Gift', type: 'expense', icon: 'present', color: '#d946ef', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-subscription', user_id: 'mock-user', name: 'Subscription', type: 'expense', icon: 'repeat', color: '#8b5cf6', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-bills', user_id: 'mock-user', name: 'Bills', type: 'expense', icon: 'file-text', color: '#7c3aed', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-emi', user_id: 'mock-user', name: 'EMI', type: 'expense', icon: 'credit-card', color: '#f59e0b', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-insurance', user_id: 'mock-user', name: 'Insurance', type: 'expense', icon: 'shield', color: '#10b981', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-misc', user_id: 'mock-user', name: 'Misc', type: 'expense', icon: 'ellipsis', color: '#6b7280', is_system: true, created_at: '2024-01-01T00:00:00Z' },

  // Transfer category
  { id: 'cat-transfer', user_id: 'mock-user', name: 'Transfer', type: 'transfer', icon: 'arrow-left-right', color: '#3b82f6', is_system: true, created_at: '2024-01-01T00:00:00Z' },
];

let categories = [...DEFAULT_CATEGORIES];

export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  await new Promise((r) => setTimeout(r, 80));
  if (type) {
    return categories.filter((c) => c.type === type);
  }
  return categories;
}

export async function createCategory(data: {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}): Promise<Category> {
  await new Promise((r) => setTimeout(r, 150));
  const newCategory: Category = {
    id: `cat-${Date.now()}`,
    user_id: 'mock-user',
    name: data.name,
    type: data.type,
    icon: data.icon,
    color: data.color,
    is_system: false,
    created_at: new Date().toISOString(),
  };
  categories.push(newCategory);
  return newCategory;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  await new Promise((r) => setTimeout(r, 150));
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  categories[idx] = { ...categories[idx], ...data };
  return categories[idx];
}

export async function deleteCategory(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  categories.splice(idx, 1);
}

export function resetCategories(): void {
  categories = [...DEFAULT_CATEGORIES];
}
