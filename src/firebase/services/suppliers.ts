
'use client';
import { initializeFirebase } from '@/firebase';
import type { Supplier } from '@/lib/types';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const { firestore } = initializeFirebase();
const suppliersCollection = collection(firestore, 'suppliers');

export const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
  return addDoc(suppliersCollection, supplier);
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
  const supplierRef = doc(firestore, 'suppliers', id);
  return updateDoc(supplierRef, supplier);
};

export const deleteSupplier = async (id: string) => {
  const supplierRef = doc(firestore, 'suppliers', id);
  return deleteDoc(supplierRef);
};
