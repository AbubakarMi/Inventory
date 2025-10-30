export type InventoryItem = {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    cost: number;
    price: number;
    expiry: string;
    supplier: string;
    threshold: number;
};

export type Category = {
    id: string;
    name: string;
    parent: string | null;
};

export type Sale = {
    id: string;
    itemName: string;
    quantity: number;
    type: 'Sale' | 'Usage';
    date: string;
    total: number;
};

export type User = {
    id: string;
    name: string;
    role: 'Admin' | 'Manager' | 'Staff';
    email: string;
    status: 'Active' | 'Inactive';
};

export type Notification = {
    id: string;
    message: string;
    type: 'warning' | 'error' | 'info';
}

export type ChartData = {
    date: string;
    value: number;
};
  
export type PieChartData = {
    name: string;
    value: number;
    fill: string;
};
