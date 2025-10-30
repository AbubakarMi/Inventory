
"use client"

import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserModal } from "./user-modal"
import { UserDetailsModal } from "./user-details-modal"
import { ActionConfirmationDialog } from "../action-confirmation-dialog"

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
      const variant = row.original.status === "Active" ? "success" : row.original.status === "Suspended" ? "warning" : "destructive";
      return <Badge variant={variant}>{row.original.status}</Badge>
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
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
            <UserDetailsModal user={user}>
                 <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    View
                </button>
            </UserDetailsModal>
             <UserModal userToEdit={user}>
               <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Edit
                </button>
            </UserModal>
            <DropdownMenuSeparator />
            <ActionConfirmationDialog
              title="Are you sure?"
              description={`This will suspend ${user.name}'s account. They will not be able to log in.`}
              onConfirm={() => console.log(`Suspending ${user.name}`)}
            >
              <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-orange-600 focus:text-orange-600 focus:bg-orange-100 dark:focus:bg-orange-900/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                Suspend
              </button>
            </ActionConfirmationDialog>
            <ActionConfirmationDialog
              title="Are you absolutely sure?"
              description={`This action cannot be undone. This will permanently delete ${user.name}'s account and remove their data from our servers.`}
              onConfirm={() => console.log(`Deleting ${user.name}`)}
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

    