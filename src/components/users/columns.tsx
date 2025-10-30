
"use client"

import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserDetailsModal } from "./user-details-modal"
import { ActionConfirmationDialog } from "../action-confirmation-dialog"
import { useFirestore } from "@/firebase"
import { updateDocument } from "@/firebase/firestore/mutations"
import { useToast } from "@/hooks/use-toast"

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
      const user = row.original;
      const variant = user.status === "Active" ? "success" : user.status === "Suspended" ? "warning" : "destructive";
      return <Badge variant={variant}>{row.original.status}</Badge>
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      const firestore = useFirestore();
      const { toast } = useToast();

      const handleStatusChange = async (status: 'Active' | 'Suspended' | 'Inactive') => {
        if (!firestore) return;
        try {
          await updateDocument(firestore, 'users', user.id, { status });
          toast({ title: "Success", description: `User status changed to ${status}.`})
        } catch (error) {
          toast({ variant: 'destructive', title: "Error", description: "Failed to update user status."})
        }
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
            <DropdownMenuSeparator />
            <UserDetailsModal user={user}>
                 <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    View
                </button>
            </UserDetailsModal>
            <ActionConfirmationDialog
              title="Are you sure?"
              description={`This will change ${user.name}'s status to 'Suspended'.`}
              onConfirm={() => handleStatusChange('Suspended')}
            >
              <button disabled={user.status === 'Suspended'} className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-orange-600 focus:text-orange-600 focus:bg-orange-100 dark:focus:bg-orange-900/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                Suspend
              </button>
            </ActionConfirmationDialog>
            <ActionConfirmationDialog
              title="Are you sure?"
              description={`This will change ${user.name}'s status to 'Inactive'.`}
              onConfirm={() => handleStatusChange('Inactive')}
              variant="destructive"
            >
              <button disabled={user.status === 'Inactive'} className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:text-destructive focus:bg-destructive/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  Deactivate
              </button>
            </ActionConfirmationDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
