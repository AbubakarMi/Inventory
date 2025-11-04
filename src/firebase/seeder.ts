
'use client';

import { initializeFirebase } from '@/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const { firestore } = initializeFirebase();

const parentCategories = [
    { name: 'Fruits', parent: null },
    { name: 'Vegetables', parent: null },
    { name: 'Dairy', parent: null },
    { name: 'Grains', parent: null },
    { name: 'Feed', parent: null },
    { name: 'Supplies', parent: null },
    { name: 'Processed Goods', parent: null },
];

export const seedDatabase = async () => {
    try {
        const categoriesCollection = collection(firestore, 'categories');
        const snapshot = await getDocs(categoriesCollection);

        if (snapshot.empty) {
            console.log('Categories collection is empty. Seeding...');
            const seedPromises = parentCategories.map(category => addDoc(categoriesCollection, category));
            await Promise.all(seedPromises);
            console.log('Seeding complete.');
        } else {
            console.log('Categories collection already contains data. No seeding needed.');
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};
