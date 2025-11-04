
"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { MoreVertical, FolderKanban, Package, Sigma } from "lucide-react";
import type { EnrichedCategory } from "@/lib/types";
import { CategoryModal } from "./category-modal";
import { Separator } from "../ui/separator";
import { ActionConfirmationDialog } from "../action-confirmation-dialog";
import { deleteCategory } from "@/firebase/services/categories";
import { useToast } from "@/hooks/use-toast";

type CategoryCardProps = {
    category: EnrichedCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!category.id) return;
        try {
            await deleteCategory(category.id);
            toast({
                title: "Success!",
                description: `Category "${category.name}" has been deleted.`,
            });
        } catch (error) {
            console.error("Error deleting category:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete the category. Please try again.",
            });
        }
    };
    
    return (
        <Card className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <FolderKanban className="text-accent" />
                        {category.name}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground pl-8">
                        {category.parent ? `Sub-category of ${category.parent}` : 'Parent Category'}
                    </div>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <CategoryModal categoryToEdit={category}>
                             <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground">Edit</button>
                        </CategoryModal>
                        <ActionConfirmationDialog
                            title="Are you absolutely sure?"
                            description={`This will delete the "${category.name}" category. This action cannot be undone.`}
                            onConfirm={handleDelete}
                            variant="destructive"
                        >
                            <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:text-destructive focus:bg-destructive/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                Delete
                            </button>
                        </ActionConfirmationDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1">
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4"/>
                        <span>Items</span>
                    </div>
                    <span className="font-semibold text-right">{category.itemCount}</span>

                     <div className="flex items-center gap-2 text-muted-foreground">
                        <Sigma className="h-4 w-4"/>
                        <span>Total Stock</span>
                    </div>
                    <span className="font-semibold text-right">{category.totalStock} {category.unit && ` ${category.unit}`}</span>
                </div>
            </CardContent>
        </Card>
    );
}
