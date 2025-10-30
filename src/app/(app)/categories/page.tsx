
import { Button } from "@/components/ui/button";
import { categories, inventoryItems } from "@/lib/data";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryModal } from "@/components/categories/category-modal";
import { PlusCircle, FolderKanban } from "lucide-react";
import type { EnrichedCategory } from "@/lib/types";


export default function CategoriesPage() {
    const enrichedCategories: EnrichedCategory[] = categories.map(category => {
        const itemsInCategory = inventoryItems.filter(item => item.category === category.name);
        const totalStock = itemsInCategory.reduce((sum, item) => sum + item.quantity, 0);
        const itemCount = itemsInCategory.length;
        
        return {
            ...category,
            itemCount,
            totalStock,
            // Assuming unit is consistent for a category for simplicity, or just show count
            unit: itemsInCategory.length > 0 ? itemsInCategory[0].unit : ''
        };
    });

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
