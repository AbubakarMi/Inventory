'use client';
import { initializeFirebase } from '@/firebase';
import type { Sale, InventoryItem } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { updateStockAfterSale } from './inventory';

const { firestore } = initializeFirebase();
const salesCollection = collection(firestore, 'sales');

export const addSale = async (sale: Omit<Sale, 'id'|'date'|'total'>) => {
    const inventoryRef = doc(firestore, 'inventory', sale.itemName);
  
    // Use a transaction to ensure atomic read and write
    await runTransaction(firestore, async (transaction) => {
        const inventoryDoc = await transaction.get(inventoryRef);
        if (!inventoryDoc.exists()) {
            throw new Error("Item not found in inventory!");
        }

        const inventoryItem = inventoryDoc.data() as InventoryItem;

        if (inventoryItem.quantity < sale.quantity) {
            throw new Error(`Not enough stock for ${inventoryItem.name}. Only ${inventoryItem.quantity} available.`);
        }

        const newSale = {
            ...sale,
            date: new Date().toISOString(),
            total: sale.quantity * inventoryItem.price,
        };

        // Add the new sale document
        transaction.set(doc(collection(firestore, 'sales')), newSale);

        // Update the inventory stock
        const newQuantity = inventoryItem.quantity - sale.quantity;
        const newStatus = newQuantity > inventoryItem.threshold ? 'In Stock' : newQuantity > 0 ? 'Low Stock' : 'Out of Stock';
        transaction.update(inventoryRef, { quantity: newQuantity, status: newStatus });
    });
};

export const updateSale = async (id: string, sale: Partial<Sale>) => {
  // Note: This simplified update doesn't adjust inventory.
  // A real implementation would require more complex logic to handle quantity changes.
  const saleRef = doc(firestore, 'sales', id);
  return updateDoc(saleRef, sale);
};

export const deleteSale = async (id: string) => {
    // Note: Deleting a sale doesn't automatically restock inventory.
    const saleRef = doc(firestore, 'sales', id);
    return deleteDoc(saleRef);
};
