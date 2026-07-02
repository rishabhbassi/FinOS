// Finance OS - Category Actions
// Real Supabase queries

import { categoryQueries } from '@/lib/supabase/queries';
import type { Category } from '@/types/database';

export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  try {
    const categories = await categoryQueries.list();
    if (type) {
      return categories.filter((c) => c.type === type);
    }
    return categories;
  } catch {
    return [];
  }
}

export async function createCategory(data: {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}): Promise<Category> {
  return categoryQueries.create({
    name: data.name,
    type: data.type,
    icon: data.icon,
    color: data.color,
    is_system: false,
    user_id: '',
  });
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  await categoryQueries.update(id, data);
}

export async function deleteCategory(id: string): Promise<void> {
  await categoryQueries.delete(id);
}
