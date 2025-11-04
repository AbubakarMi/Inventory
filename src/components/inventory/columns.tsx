"use client"

import { Badge } from "@/components/ui/badge"
import type { InventoryItem, Category } from "@/lib/types"
import { ItemModal } from "./item-modal"
import { Button } from "../ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ActionConfirmationDialog } from "../action-confirmation-dialog"
import { deleteInventoryItem } from "@/firebase/services/inventory"
import { useToast } from "@/hooks/use-toast"

type ColumnsProps = {
    categories: Category[];
}

export const getColumns = ({ categories }: ColumnsProps) => {
    const { toast } = useToast();

    const handleDelete = async (item: InventoryItem) => {
        if (!item.id) return;
        try {
            await deleteInventoryItem(item.id);
            toast({
                title: "Success!",
                description: `Item "${item.name}" has been deleted.`,
            });
        } catch (error) {
            console.error("Error deleting item:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete the item. Please try again.",
            });
        }
    };
    
    return [
      {
        accessorKey: "name",
        header: "Item Name",
        cell: ({ row }: { row: { original: InventoryItem } }) => <div className="font-medium">{row.original.name}</div>,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: { row: { original: InventoryItem } }) => <div>{row.original.category}</div>,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }: { row: { original: InventoryItem } }) => <div>{`${row.original.quantity} ${row.original.unit}`}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: { original: InventoryItem } }) => {
          const variant =
            row.original.status === "In Stock"
              ? "success"
              : row.original.status === "Low Stock"
              ? "warning"
              : "destructive"
          return <Badge variant={variant}>{row.original.status}</Badge>
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: InventoryItem } }) => {
            const item = row.original;
          return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <ItemModal itemToEdit={item} categories={categories}>
                        <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                            Edit
                        </button>
                    </ItemModal>
                    <ActionConfirmationDialog
                      title="Are you absolutely sure?"
                      description={`This action cannot be undone. This will permanently delete "${item.name}".`}
                      onConfirm={() => handleDelete(item)}
                      variant="destructive"
                    >
                      <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:text-destructive focus:bg-destructive/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                        Delete
                      </button>
                    </ActionConfirmationDialog>
                </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
}
