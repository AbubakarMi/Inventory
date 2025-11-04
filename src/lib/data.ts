

import type { InventoryItem, Category, Sale, User, Notification, ChartData, PieChartData, Supplier } from '@/lib/types';

export const inventoryItems: InventoryItem[] = [
  // This data is now fetched from Firestore. This is for reference only.
  // { id: '1', name: 'Organic Apples', category: 'Fruits', quantity: 150, unit: 'kg', status: 'In Stock', cost: 1.2, price: 2.5, expiry: '2024-12-01', supplier: 'Green Farms', threshold: 20 },
];

export const categories: Category[] = [
  // This data is now fetched from Firestore. This is for reference only.
  // { id: '1', name: 'Fruits', parent: null },
];

export const sales: Sale[] = [
    // This data is now fetched from Firestore. This is for reference only.
  // { id: '1', itemName: 'Organic Apples', quantity: 20, type: 'Sale', date: '2024-07-20', total: 50.00 },
];

export const users: User[] = [
    // This data is now fetched from Firestore. This is for reference only.
  // { id: '1', name: 'Alice Johnson', role: 'Admin', email: 'admin@gmail.com', status: 'Active' },
];

export const notifications: Notification[] = [
    { id: '1', message: 'Low stock: Chicken Feed (15 bags left)', type: 'warning' },
    { id: '2', message: 'Low stock: Strawberry Jam (9 jars left)', type: 'warning' },
    { id: '3', message: 'Item expired: Fertilizer (Batch #123)', type: 'error' },
];

export const dailyTrendsData: ChartData[] = [
    { date: 'Mon', value: 1200 },
    { date: 'Tue', value: 1500 },
    { date: 'Wed', value: 1300 },
    { date: 'Thu', value: 1800 },
    { date: 'Fri', value: 1600 },
    { date: 'Sat', value: 2200 },
    { date: 'Sun', value: 2100 },
];

export const categoryBreakdownData: PieChartData[] = [
    { name: 'Fruits', value: 150, fill: 'var(--color-fruits)' },
    { name: 'Vegetables', value: 80, fill: 'var(--color-vegetables)' },
    { name: 'Dairy', value: 500, fill: 'var(--color-dairy)' },
    { name: 'Feed', value: 15, fill: 'var(--color-feed)' },
    { name: 'Supplies', value: 45, fill: 'var(--color-supplies)' },
    { name: 'Processed Goods', value: 9, fill: 'var(--color-processed-goods)' },
];

export const topSellingItems = [
    { name: 'Organic Apples', quantity: 520, profit: 676 },
    { name: 'Cow Milk', quantity: 1200, profit: 840 },
    { name: 'Free-range Eggs', quantity: 2500, profit: 750 },
    { name: 'Carrots', quantity: 400, profit: 280 },
];

export const suppliers: Supplier[] = [
    // This data is now fetched from Firestore. This is for reference only.
    // { id: '1', name: 'Green Farms', contact: 'contact@greenfarms.com', products: ['Organic Apples', 'Carrots'], rating: 5 },
];
