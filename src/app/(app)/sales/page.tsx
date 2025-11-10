
"use client"

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { getColumns } from "@/components/sales/columns";
import { TransactionForm } from "@/components/sales/transaction-form";
import { api } from "@/lib/api-client";
import type { Sale, InventoryItem, Category, Supplier } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FileWarning } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getInventoryItems } from "@/lib/services/inventory";
import { getCategories } from "@/lib/services/categories";
import { getSuppliers } from "@/lib/services/suppliers";

export default function SalesPage() {
    const { toast } = useToast();

    const [salesData, setSalesData] = useState<Sale[]>([]);
    const [usageData, setUsageData] = useState<Sale[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [salesRes, usageRes, items, cats, sups] = await Promise.all([
                api.get('/sales?type=Sale').catch((error) => {
                    // Silently handle expected errors (401 Unauthorized)
                    if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
                        console.error('Error fetching sales:', error);
                    }
                    return { sales: [] };
                }),
                api.get('/sales?type=Usage').catch((error) => {
                    if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
                        console.error('Error fetching usage:', error);
                    }
                    return { sales: [] };
                }),
                getInventoryItems().catch((error) => {
                    if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
                        console.error('Error fetching inventory:', error);
                    }
                    return [];
                }),
                getCategories().catch((error) => {
                    if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
                        console.error('Error fetching categories:', error);
                    }
                    return [];
                }),
                getSuppliers().catch((error) => {
                    if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
                        console.error('Error fetching suppliers:', error);
                    }
                    return [];
                })
            ]);

            setSalesData(salesRes.sales || []);
            setUsageData(usageRes.sales || []);
            setInventoryItems(items);
            setCategories(cats);
            setSuppliers(sups);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error fetching sales data:', error);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleNewSale = (newSale: Sale) => {
        if (newSale.type === 'Sale') {
            setSalesData(prev => [newSale, ...prev]);
        } else {
            setUsageData(prev => [newSale, ...prev]);
        }
        // Also update inventory items to reflect the reduced quantity
        setInventoryItems(prev => prev.map(item => {
            if (item.name === newSale.item_name) {
                return { ...item, quantity: item.quantity - newSale.quantity };
            }
            return item;
        }));
    };

    const columns = useMemo(() => getColumns(toast, handleRefresh), [toast]);

    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold text-lg md:text-2xl">Sales / Usage</h1>
                    <Skeleton className="h-10 w-40" />
                </div>
                <Skeleton className="h-10 w-48" />
                <div className="rounded-md border overflow-auto">
                     <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                    <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                    <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Sales / Usage</h1>
                <TransactionForm categories={categories} inventoryItems={inventoryItems} suppliers={suppliers} onSaleAdded={handleNewSale}>
                    <Button>Record Transaction</Button>
                </TransactionForm>
            </div>
            <Tabs defaultValue="sales">
                <TabsList>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                </TabsList>
                <TabsContent value="sales">
                    <DataTable
                        columns={columns}
                        data={salesData || []}
                        emptyState={
                            <div className="flex flex-col items-center gap-4 text-center py-12">
                                <FileWarning className="h-16 w-16 text-muted-foreground" />
                                <h3 className="text-xl font-bold tracking-tight">No sales recorded</h3>
                                <p className="text-sm text-muted-foreground">Start by recording your first sale.</p>
                                <TransactionForm categories={categories} inventoryItems={inventoryItems} suppliers={suppliers} onSaleAdded={handleNewSale}>
                                    <Button>Record Sale</Button>
                                </TransactionForm>
                            </div>
                        }
                    />
                </TabsContent>
                <TabsContent value="usage">
                    <DataTable
                        columns={columns}
                        data={usageData || []}
                        emptyState={
                             <div className="flex flex-col items-center gap-4 text-center py-12">
                                <FileWarning className="h-16 w-16 text-muted-foreground" />
                                <h3 className="text-xl font-bold tracking-tight">No usage recorded</h3>
                                <p className="text-sm text-muted-foreground">Start by recording your first item usage.</p>
                                <TransactionForm categories={categories} inventoryItems={inventoryItems} suppliers={suppliers} onSaleAdded={handleNewSale}>
                                    <Button>Record Usage</Button>
                                </TransactionForm>
                            </div>
                        }
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
