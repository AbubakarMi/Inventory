
"use client"

import { Badge } from "@/components/ui/badge"
import type { Sale } from "@/lib/types"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TransactionModal } from "./transaction-modal"
import { ActionConfirmationDialog } from "../action-confirmation-dialog"


export type ColumnDef<TData> = {
  accessorKey: keyof TData | string
  header: string
  cell: (props: { row: { original: TData } }) => React.ReactNode
}

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "itemName",
    header: "Item Name",
    cell: ({ row }) => <div className="font-medium">{row.original.itemName}</div>,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <div>{row.original.quantity}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const variant = row.original.type === "Sale" ? "secondary" : "outline";
      return <Badge variant={variant}>{row.original.type}</Badge>
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div>{new Date(row.original.date).toLocaleDateString()}</div>,
  },
  {
    accessorKey: "total",
    header: "Total Amount",
    cell: ({ row }) => <div>₦{row.original.total.toFixed(2)}</div>,
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
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
                <TransactionModal transactionToEdit={transaction}>
                    <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                        Edit
                    </button>
                </TransactionModal>
                <ActionConfirmationDialog
                  title="Are you absolutely sure?"
                  description={`This action cannot be undone. This will permanently delete this transaction record.`}
                  onConfirm={() => console.log(`Deleting ${transaction.id}`)}
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
