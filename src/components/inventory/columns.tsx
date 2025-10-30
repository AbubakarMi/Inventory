
"use client"

import { Badge } from "@/components/ui/badge"
import type { InventoryItem } from "@/lib/types"
import { ItemModal } from "./item-modal"
import { Button } from "../ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ActionConfirmationDialog } from "../action-confirmation-dialog"
import { useFirestore, useCollection } from "@/firebase"
import { deleteDocument } from "@/firebase/firestore/mutations"
import { collection } from "firebase/firestore"
import type { Category } from "@/lib/types"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ColumnDef<TData> = {
  accessorKey: keyof TData | string
  header: string
  cell: (props: { row: { original: TData } }) => React.ReactNode
}

const getStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return "Out of Stock";
    if (item.quantity <= item.threshold) return "Low Stock";
    return "In Stock";
}

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "name",
    header: "Item Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.original.category}</div>,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <div>{`${row.original.quantity} ${row.original.unit}`}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = getStatus(row.original);
      const variant =
        status === "In Stock"
          ? "success"
          : status === "Low Stock"
          ? "warning"
          : "destructive"
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
        const item = row.original;
        const firestore = useFirestore();
        const { data: categories } = useCollection<Category>(firestore ? collection(firestore, 'categories') : null);

        const handleDelete = () => {
          if (!firestore) return;
          deleteDocument(firestore, 'inventory', item.id);
        }

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
                <ItemModal itemToEdit={item} categories={categories || []}>
                    <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                        Edit
                    </button>
                </ItemModal>
                <ActionConfirmationDialog
                  title="Are you absolutely sure?"
                  description={`This action cannot be undone. This will permanently delete "${item.name}".`}
                  onConfirm={handleDelete}
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
