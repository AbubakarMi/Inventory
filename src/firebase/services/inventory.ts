'use client';
import { initializeFirebase } from '@/firebase';
import type { InventoryItem } from '@/lib/types';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  getDocs,
  getDoc,
  Transaction,
} from 'firebase/firestore';

const { firestore } = initializeFirebase();
const inventoryCollection = collection(firestore, 'inventory');

export const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'status'>) => {
  const status = item.quantity > item.threshold ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock';
  return addDoc(inventoryCollection, { ...item, status });
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
  const itemRef = doc(firestore, 'inventory', id);
  
  // Use a transaction to safely read and then write
  const docSnap = await getDoc(itemRef);
  if (!docSnap.exists()) {
    throw new Error("Document does not exist!");
  }
  
  const currentData = docSnap.data();
  const updateData = { ...item };

  // Recalculate status if quantity or threshold is being changed
  const quantity = item.quantity ?? currentData.quantity;
  const threshold = item.threshold ?? currentData.threshold;

  if (item.quantity !== undefined || item.threshold !== undefined) {
    updateData.status = quantity > threshold ? 'In Stock' : quantity > 0 ? 'Low Stock' : 'Out of Stock';
  }
  
  return updateDoc(itemRef, updateData);
};

export const deleteInventoryItem = async (id: string) => {
  const itemRef = doc(firestore, 'inventory', id);
  return deleteDoc(itemRef);
};


export const updateStockAfterSale = async (transaction: Transaction, itemName: string, quantitySold: number) => {
    const q = query(inventoryCollection, where("name", "==", itemName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error(`Item ${itemName} not found in inventory.`);
    }

    const docSnapshot = querySnapshot.docs[0];
    const item = docSnapshot.data() as InventoryItem;
    const newQuantity = item.quantity - quantitySold;

    if (newQuantity < 0) {
        throw new Error(`Not enough stock for ${itemName}.`);
    }

    const newStatus = newQuantity > item.threshold ? 'In Stock' : newQuantity > 0 ? 'Low Stock' : 'Out of Stock';
    const itemRef = doc(firestore, 'inventory', docSnapshot.id);
    transaction.update(itemRef, { quantity: newQuantity, status: newStatus });
}
