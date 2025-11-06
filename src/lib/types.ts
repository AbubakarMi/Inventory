

// The 'id' is optional for new items that don't have an ID from Firestore yet.
export type InventoryItem = {
    id?: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    cost: number;
    price: number;
    expiry?: string;
    supplier?: string;
    threshold: number;
    grade?: 'A' | 'B' | 'C';
};

export type Category = {
    id?: string | number;
    name: string;
    parent: string | null;
    parent_id?: number | null;
};

export type EnrichedCategory = Category & {
    itemCount: number;
    totalStock: number;
    unit: string;
    children?: EnrichedCategory[];
};

export type Sale = {
    id?: string;
    itemName: string;
    quantity: number;
    type: 'Sale' | 'Usage';
    date: string;
    total: number;
};

export type User = {
    id?: string; // Corresponds to Firebase Auth UID
    name: string;
    role: 'Admin' | 'Manager' | 'Staff' | 'Storekeeper';
    email: string;
    status: 'Active' | 'Inactive' | 'Suspended';
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

export type Supplier = {
    id?: string;
    name: string;
    phone: string;
    address: string;
    products: string[];
    rating: number;
};

export type Toast = {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
};

    