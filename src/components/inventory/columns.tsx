"use client"

import { Badge } from "@/components/ui/badge"
import type { InventoryItem, Category, Toast } from "@/lib/types"
import { ItemModal } from "./item-modal"
import { Button } from "../ui/button"
import { MoreHorizontal, AlertTriangle, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ActionConfirmationDialog } from "../action-confirmation-dialog"
import { deleteInventoryItem } from "@/lib/services/inventory"
import { differenceInDays, isBefore } from "date-fns"

type ColumnsProps = {
    categories: Category[];
    toast: (options: Toast) => void;
    onRefresh?: () => void;
}

export const getColumns = ({ categories, toast, onRefresh }: ColumnsProps) => {
    
    const handleDelete = async (item: InventoryItem) => {
        if (!item.id) return;
        try {
            await deleteInventoryItem(item.id);
            toast({
                title: "Success!",
                description: `Item "${item.name}" has been deleted.`,
            });

            // Call refresh callback if provided
            if (onRefresh) {
                onRefresh();
            }
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
        accessorKey: "expiry",
        header: "Expiry Date",
        cell: ({ row }: { row: { original: InventoryItem } }) => {
          const item = row.original;

          if (!item.expiry) {
            return <div className="text-muted-foreground text-sm">N/A</div>;
          }

          const expiryDate = new Date(item.expiry);
          const today = new Date();

          // Reset time to start of day for accurate comparison
          expiryDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          const daysUntilExpiry = differenceInDays(expiryDate, today);
          const isExpired = daysUntilExpiry < 0;
          const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

          return (
            <div className="flex items-center gap-2">
              {isExpired ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                  <span className="text-red-600 dark:text-red-500 font-semibold text-sm">
                    {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <Badge variant="destructive" className="text-xs">Expired</Badge>
                </>
              ) : isExpiringSoon ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-500 font-semibold text-sm">
                    {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <Badge variant="warning" className="text-xs">Soon</Badge>
                </>
              ) : (
                <span className="text-sm font-medium">
                  {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          );
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
                    <ItemModal itemToEdit={item} categories={categories} onSuccess={onRefresh}>
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
