
"use client"

import * as React from "react"
import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryModal } from "@/components/categories/category-modal";
import { PlusCircle, FolderKanban } from "lucide-react";
import type { EnrichedCategory, Category, InventoryItem } from "@/lib/types";
import { api } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton";


export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [categoriesRes, inventoryRes] = await Promise.all([
                api.get('/categories'),
                api.get('/inventory'),
            ]);
            setCategories(categoriesRes.categories || []);
            setInventoryItems(inventoryRes.items || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshKey]);
    
    const enrichedCategories: EnrichedCategory[] = useMemo(() => {
        if (!categories || !inventoryItems) return [];

        // First, enrich all categories with their stats
        const enriched = categories.map(category => {
            const itemsInCategory = inventoryItems.filter(item => item.category === category.name);
            const totalStock = itemsInCategory.reduce((sum, item) => sum + item.quantity, 0);
            const itemCount = itemsInCategory.length;

            return {
                ...category,
                itemCount,
                totalStock,
                unit: itemsInCategory.length > 0 ? itemsInCategory[0].unit : '',
                children: []
            };
        });

        // Build hierarchy: find top-level categories (no parent)
        const topLevel = enriched.filter(cat => !cat.parent_id);

        // Attach children to their parents
        enriched.forEach(cat => {
            if (cat.parent_id) {
                const parent = enriched.find(p => p.id === cat.parent_id);
                if (parent) {
                    if (!parent.children) parent.children = [];
                    parent.children.push(cat);
                }
            }
        });

        return topLevel;
    }, [categories, inventoryItems]);

    if (loading) {
        return (
             <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold text-lg md:text-2xl">Categories</h1>
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
                </div>
            </div>
        )
    }

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Categories</h1>
                <CategoryModal onSuccess={handleRefresh}>
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Category
                    </Button>
                </CategoryModal>
            </div>
            {enrichedCategories.length > 0 ? (
                <div className="space-y-6">
                    {enrichedCategories.map(category => (
                        <div key={category.id} className="space-y-3">
                            <CategoryCard category={category} onRefresh={handleRefresh} />
                            {category.children && category.children.length > 0 && (
                                <div className="ml-8 pl-4 border-l-2 border-muted space-y-3">
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Subcategories of {category.name}:
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {category.children.map(child => (
                                            <CategoryCard key={child.id} category={child} onRefresh={handleRefresh} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <FolderKanban className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-xl font-bold tracking-tight">
                            No categories found
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Get started by creating your first category.
                        </p>
                        <CategoryModal>
                            <Button>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </CategoryModal>
                    </div>
                </div>
            )}
        </div>
    )
}
