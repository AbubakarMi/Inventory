import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical, FolderKanban } from "lucide-react";
import type { Category } from "@/lib/types";
import { CategoryModal } from "./category-modal";

type CategoryCardProps = {
    category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FolderKanban className="text-accent" />
                    {category.name}
                </CardTitle>
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
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground">
                    {category.parent ? `Sub-category of ${category.parent}` : 'Parent Category'}
                </div>
            </CardContent>
        </Card>
    );
}
