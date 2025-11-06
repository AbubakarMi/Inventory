'use client';
import { api } from '@/lib/api-client';
import type { Category } from '@/lib/types';

export const addCategory = async (category: Omit<Category, 'id'>) => {
  const response = await api.post('/categories', category);
  return response.category;
};

export const updateCategory = async (id: string | number, category: Partial<Category>) => {
  const response = await api.put('/categories', { id, ...category });
  return response.category;
};

export const deleteCategory = async (id: string | number) => {
  await api.delete(`/categories?id=${id}`);
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.categories || [];
};
