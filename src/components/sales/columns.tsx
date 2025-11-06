
"use client"

import { Badge } from "@/components/ui/badge"
import type { Sale, Toast } from "@/lib/types"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ActionConfirmationDialog } from "../action-confirmation-dialog"
import { deleteSale } from "@/lib/services/sales"
import { useToast } from "@/hooks/use-toast"

export type ColumnDef<TData> = {
  accessorKey: keyof TData | string
  header: string
  cell: (props: { row: { original: TData } }) => React.ReactNode
}

export const getColumns = (toast: (options: Toast) => void, onRefresh?: () => void) => {
    const handleDelete = async (transaction: Sale) => {
        if (!transaction.id) return;
        try {
            await deleteSale(transaction.id);
            toast({
                title: "Success!",
                description: `Transaction record has been deleted.`,
            });

            // Call refresh callback if provided
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete the transaction. Please try again.",
            });
        }
    };
    
    return [
      {
        accessorKey: "item_name",
        header: "Item Name",
        cell: ({ row }: { row: { original: Sale } }) => <div className="font-medium">{row.original.item_name}</div>,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }: { row: { original: Sale } }) => <div>{row.original.quantity.toLocaleString('en-US')}</div>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }: { row: { original: Sale } }) => {
          const variant = row.original.type === "Sale" ? "secondary" : "outline";
          return <Badge variant={variant}>{row.original.type}</Badge>
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }: { row: { original: Sale } }) => <div>{new Date(row.original.date).toLocaleDateString()}</div>,
      },
      {
        accessorKey: "total",
        header: "Total Amount",
        cell: ({ row }: { row: { original: Sale } }) => <div>₦{Number(row.original.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: Sale } }) => {
            const transaction = row.original;
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
                    <ActionConfirmationDialog
                      title="Are you absolutely sure?"
                      description={`This action cannot be undone. This will permanently delete this transaction record.`}
                      onConfirm={() => handleDelete(transaction)}
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
