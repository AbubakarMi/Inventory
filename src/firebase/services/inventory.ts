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
} from 'firebase/firestore';

const { firestore } = initializeFirebase();
const inventoryCollection = collection(firestore, 'inventory');

export const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'status'>) => {
  const status = item.quantity > item.threshold ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock';
  return addDoc(inventoryCollection, { ...item, status });
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
  const itemRef = doc(firestore, 'inventory', id);
  let finalUpdate = { ...item };
  if (item.quantity !== undefined && item.threshold !== undefined) {
    const status = item.quantity > item.threshold ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock';
    finalUpdate.status = status;
  }
  return updateDoc(itemRef, finalUpdate);
};

export const deleteInventoryItem = async (id: string) => {
  const itemRef = doc(firestore, 'inventory', id);
  return deleteDoc(itemRef);
};


export const updateStockAfterSale = async (itemName: string, quantitySold: number) => {
    const q = query(inventoryCollection, where("name", "==", itemName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error(`Item ${itemName} not found in inventory.`);
    }

    const batch = writeBatch(firestore);
    querySnapshot.forEach(documentSnapshot => {
        const item = documentSnapshot.data() as InventoryItem;
        const newQuantity = item.quantity - quantitySold;
        const newStatus = newQuantity > item.threshold ? 'In Stock' : newQuantity > 0 ? 'Low Stock' : 'Out of Stock';
        const itemRef = doc(firestore, 'inventory', documentSnapshot.id);
        batch.update(itemRef, { quantity: newQuantity, status: newStatus });
    });

    await batch.commit();
}
