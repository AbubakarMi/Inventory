'use client';
import { initializeFirebase } from '@/firebase';
import type { Sale } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateStockAfterSale } from './inventory';

const { firestore } = initializeFirebase();
const salesCollection = collection(firestore, 'sales');

export const addSale = async (sale: Omit<Sale, 'id'|'date'|'total'>) => {
  const inventoryItem = {
      name: sale.itemName,
      price: 1, // This should be fetched from the inventory item
  }
  const newSale = {
      ...sale,
      date: new Date().toISOString(),
      total: sale.quantity * inventoryItem.price, // Use actual item price
  };
  
  // This should ideally be a transaction
  await updateStockAfterSale(sale.itemName, sale.quantity);
  return addDoc(salesCollection, newSale);
};

export const updateSale = async (id: string, sale: Partial<Sale>) => {
  const saleRef = doc(firestore, 'sales', id);
  return updateDoc(saleRef, sale);
};

export const deleteSale = async (id: string) => {
  const saleRef = doc(firestore, 'sales', id);
  return deleteDoc(saleRef);
};
