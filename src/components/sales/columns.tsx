"use client"

import { Badge } from "@/components/ui/badge"
import type { Sale } from "@/lib/types"

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
    cell: ({ row }) => <div>${row.original.total.toFixed(2)}</div>,
  },
]
