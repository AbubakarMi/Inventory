
'use client';
import { initializeFirebase } from '@/firebase';
import type { Category } from '@/lib/types';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const { firestore } = initializeFirebase();
const categoriesCollection = collection(firestore, 'categories');

export const addCategory = async (category: Omit<Category, 'id'>) => {
  return addDoc(categoriesCollection, category);
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const categoryRef = doc(firestore, 'categories', id);
  return updateDoc(categoryRef, category);
};

export const deleteCategory = async (id: string) => {
  // Note: Consider what should happen to items in this category before deleting.
  const categoryRef = doc(firestore, 'categories', id);
  return deleteDoc(categoryRef);
};
