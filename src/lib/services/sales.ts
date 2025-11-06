'use client';
import { api } from '@/lib/api-client';
import type { Sale } from '@/lib/types';

export const addSale = async (sale: Omit<Sale, 'id' | 'createdAt'>) => {
  const response = await api.post('/sales', sale);
  return response.sale;
};

export const deleteSale = async (id: string | number) => {
  await api.delete(`/sales?id=${id}`);
};

export const getSales = async (type?: 'Sale' | 'Usage') => {
  const url = type ? `/sales?type=${type}` : '/sales';
  const response = await api.get(url);
  return response.sales || [];
};
