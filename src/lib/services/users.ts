'use client';
import { api } from '@/lib/api-client';
import type { User } from '@/lib/types';

export const addUser = async (user: Omit<User, 'id' | 'emailVerified' | 'createdAt'>) => {
  const response = await api.post('/users', user);
  return response.user;
};

export const updateUser = async (id: string | number, user: Partial<User>) => {
  const response = await api.put('/users', { id, ...user });
  return response.user;
};

export const deleteUser = async (id: string | number) => {
  await api.delete(`/users?id=${id}`);
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.users || [];
};
