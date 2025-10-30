

import type { InventoryItem, Category, Sale, User, Notification, ChartData, PieChartData, Supplier } from '@/lib/types';

export const inventoryItems: InventoryItem[] = [
  { id: '1', name: 'Organic Apples', category: 'Fruits', quantity: 150, unit: 'kg', status: 'In Stock', cost: 1.2, price: 2.5, expiry: '2024-12-01', supplier: 'Green Farms', threshold: 20 },
  { id: '2', name: 'Carrots', category: 'Vegetables', quantity: 80, unit: 'kg', status: 'In Stock', cost: 0.8, price: 1.5, expiry: '2024-11-15', supplier: 'Valley Veggies', threshold: 25 },
  { id: '3', name: 'Chicken Feed', category: 'Feed', quantity: 15, unit: 'bags', status: 'Low Stock', cost: 20, price: 35, expiry: '2025-05-01', supplier: 'Feed Co.', threshold: 20 },
  { id: '4', name: 'Cow Milk', category: 'Dairy', quantity: 200, unit: 'liters', status: 'In Stock', cost: 0.5, price: 1.2, expiry: '2024-10-30', supplier: 'Happy Cow Dairy', threshold: 50 },
  { id: '5', name: 'Organic Fertilizer', category: 'Supplies', quantity: 45, unit: 'bags', status: 'In Stock', cost: 15, price: 25, expiry: '2026-01-01', supplier: 'Garden Essentials', threshold: 10 },
  { id: '6', name: 'Strawberry Jam', category: 'Processed Goods', quantity: 9, unit: 'jars', status: 'Low Stock', cost: 2, price: 5, expiry: '2025-08-01', supplier: 'Farm Kitchen', threshold: 10 },
  { id: '7', name: 'Free-range Eggs', category: 'Dairy', quantity: 300, unit: 'units', status: 'In Stock', cost: 0.2, price: 0.5, expiry: '2024-11-20', supplier: 'Happy Hens', threshold: 100 },
];

export const categories: Category[] = [
  { id: '1', name: 'Fruits', parent: null },
  { id: '2', name: 'Vegetables', parent: null },
  { id: '3', name: 'Dairy', parent: null },
  { id: '4', name: 'Feed', parent: null },
  { id: '5', 'name': 'Supplies', parent: null},
  { id: '6', 'name': 'Processed Goods', parent: null}
];

export const sales: Sale[] = [
  { id: '1', itemName: 'Organic Apples', quantity: 20, type: 'Sale', date: '2024-07-20', total: 50.00, avatarUrl: 'https://picsum.photos/seed/1/40/40' },
  { id: '2', itemName: 'Carrots', quantity: 15, type: 'Sale', date: '2024-07-20', total: 22.50, avatarUrl: 'https://picsum.photos/seed/2/40/40' },
  { id: '3', itemName: 'Chicken Feed', quantity: 2, type: 'Usage', date: '2024-07-19', total: 70.00, avatarUrl: 'https://picsum.photos/seed/3/40/40' },
  { id: '4', itemName: 'Cow Milk', quantity: 50, type: 'Sale', date: '2024-07-19', total: 60.00, avatarUrl: 'https://picsum.photos/seed/4/40/40' },
  { id: '5', itemName: 'Free-range Eggs', quantity: 100, type: 'Sale', date: '2024-07-18', total: 50.00, avatarUrl: 'https://picsum.photos/seed/5/40/40' },
];

export const users: User[] = [
  { id: '1', name: 'Alice Johnson', role: 'Admin', email: 'admin@gmail.com', status: 'Active' },
  { id: '2', name: 'Bob Williams', role: 'Manager', email: 'manager@gmail.com', status: 'Active' },
  { id: '3', name: 'Charlie Brown', role: 'Staff', email: 'staff@gmail.com', status: 'Inactive' },
  { id: '4', name: 'David Smith', role: 'Storekeeper', email: 'storekeeper@gmail.com', status: 'Suspended' },
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
    { id: '1', name: 'Green Farms', contact: 'contact@greenfarms.com', products: ['Organic Apples', 'Carrots'], rating: 5 },
    { id: '2', name: 'Valley Veggies', contact: 'sales@valleyveggies.com', products: ['Carrots'], rating: 4 },
    { id: '3', name: 'Feed Co.', contact: 'orders@feedco.com', products: ['Chicken Feed'], rating: 4 },
    { id: '4', name: 'Happy Cow Dairy', contact: 'info@happydairy.com', products: ['Cow Milk'], rating: 5 },
    { id: '5', name: 'Garden Essentials', contact: 'support@gardenessentials.com', products: ['Organic Fertilizer'], rating: 3 },
    { id: '6', name: 'Farm Kitchen', contact: 'kitchen@farm.com', products: ['Strawberry Jam'], rating: 4 },
    { id: '7', name: 'Happy Hens', contact: 'eggs@happyhens.com', products: ['Free-range Eggs'], rating: 5 },
];
