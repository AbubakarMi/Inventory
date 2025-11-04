
"use client"

import * as React from "react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryModal } from "@/components/categories/category-modal";
import { PlusCircle, FolderKanban } from "lucide-react";
import type { EnrichedCategory, Category, InventoryItem } from "@/lib/types";
import { initializeFirebase, useCollection } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton";


export default function CategoriesPage() {
    const { firestore } = initializeFirebase();
    
    const categoriesQuery = useMemo(() => firestore ? query(collection(firestore, 'categories')) : null, [firestore]);
    const inventoryQuery = useMemo(() => firestore ? query(collection(firestore, 'inventory')) : null, [firestore]);

    const { data: categories, loading: loadingCategories } = useCollection<Category>(categoriesQuery);
    const { data: inventoryItems, loading: loadingInventory } = useCollection<InventoryItem>(inventoryQuery);
    
    const enrichedCategories: EnrichedCategory[] = useMemo(() => {
        if (!categories || !inventoryItems) return [];
        return categories.map(category => {
            const itemsInCategory = inventoryItems.filter(item => item.category === category.name);
            const totalStock = itemsInCategory.reduce((sum, item) => sum + item.quantity, 0);
            const itemCount = itemsInCategory.length;
            
            return {
                ...category,
                itemCount,
                totalStock,
                unit: itemsInCategory.length > 0 ? itemsInCategory[0].unit : ''
            };
        });
    }, [categories, inventoryItems]);

    const loading = loadingCategories || loadingInventory;

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

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Categories</h1>
                <CategoryModal>
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Category
                    </Button>
                </CategoryModal>
            </div>
            {enrichedCategories.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {enrichedCategories.map(category => (
                        <CategoryCard key={category.id} category={category} />
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
