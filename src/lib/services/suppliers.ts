'use client';
import { api } from '@/lib/api-client';
import type { Supplier } from '@/lib/types';

export const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
  const response = await api.post('/suppliers', supplier);
  return response.supplier;
};

export const updateSupplier = async (id: string | number, supplier: Partial<Supplier>) => {
  const response = await api.put('/suppliers', { id, ...supplier });
  return response.supplier;
};

export const deleteSupplier = async (id: string | number) => {
  await api.delete(`/suppliers?id=${id}`);
};

export const getSuppliers = async () => {
  const response = await api.get('/suppliers');
  return response.suppliers || [];
};
