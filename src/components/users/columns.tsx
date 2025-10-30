"use client"

import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types"

export type ColumnDef<TData> = {
  accessorKey: keyof TData | string
  header: string
  cell: (props: { row: { original: TData } }) => React.ReactNode
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <div>{row.original.role}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.original.email}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const variant = row.original.status === "Active" ? "success" : "destructive";
      return <Badge variant={variant}>{row.original.status}</Badge>
    },
  },
]
