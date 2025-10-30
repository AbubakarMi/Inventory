import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryModal } from "@/components/categories/category-modal";
import { PlusCircle } from "lucide-react";


export default function CategoriesPage() {
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map(category => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
        </div>
    )
}
