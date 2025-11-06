'use client';
import { api } from '@/lib/api-client';
import type { InventoryItem } from '@/lib/types';

export const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'status'>) => {
  const status = item.quantity > item.threshold ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock';
  const response = await api.post('/inventory', { ...item, status });
  return response.item;
};

export const updateInventoryItem = async (id: string | number, item: Partial<InventoryItem>) => {
  const response = await api.put('/inventory', { id, ...item });
  return response.item;
};

export const deleteInventoryItem = async (id: string | number) => {
  await api.delete(`/inventory?id=${id}`);
};

export const getInventoryItems = async () => {
  const response = await api.get('/inventory');
  return response.items || [];
};
