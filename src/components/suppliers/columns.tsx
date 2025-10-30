
"use client"

import { Badge } from "@/components/ui/badge"
import type { Supplier } from "@/lib/types"
import { MoreHorizontal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ActionConfirmationDialog } from "../action-confirmation-dialog"
import { SupplierModal } from "./supplier-modal"

export type ColumnDef<TData> = {
  accessorKey: keyof TData | string
  header: string
  cell: (props: { row: { original: TData } }) => React.ReactNode
}

const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        )
    }
    return <div className="flex items-center gap-0.5">{stars}</div>
}

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => <div className="text-muted-foreground">{row.original.contact}</div>,
  },
  {
    accessorKey: "products",
    header: "Products Supplied",
    cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.products.map(p => <Badge key={p} variant="outline" className="font-normal">{p}</Badge>)}</div>,
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => renderStars(row.original.rating)
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const supplier = row.original;
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
            <SupplierModal supplierToEdit={supplier}>
                 <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Edit
                </button>
            </SupplierModal>
            <ActionConfirmationDialog
              title="Are you absolutely sure?"
              description={`This action cannot be undone. This will permanently delete ${supplier.name} and remove their data from our servers.`}
              onConfirm={() => console.log(`Deleting ${supplier.name}`)}
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
