

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
};

export type Category = {
    id?: string;
    name: string;
    parent: string | null;
};

export type EnrichedCategory = Category & {
    itemCount: number;
    totalStock: number;
    unit: string;
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
    name:string;
    contact: string;
    products: string[];
    rating: number;
};
