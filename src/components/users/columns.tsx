
"use client"

import { Badge } from "@/components/ui/badge"
import type { User, Toast } from "@/lib/types"
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
import { UserDetailsModal } from "./user-details-modal"
import { ActionConfirmationDialog } from "../action-confirmation-dialog"
import { UserModal } from "./user-modal"
import { deleteUser, updateUser } from "@/firebase/services/users"
import { useToast } from "@/hooks/use-toast"

export type ColumnDef<TData> = {
  accessorKey: keyof TData | string
  header: string
  cell: (props: { row: { original: TData } }) => React.ReactNode
}

export const getColumns = (toast: (options: Toast) => void): ColumnDef<User>[] => {
    
    const handleDelete = async (user: User) => {
        if (!user.id) return;
        try {
            await deleteUser(user.id);
            toast({
                title: "Success!",
                description: `User "${user.name}" has been deleted.`,
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete the user. Please try again.",
            });
        }
    };

    const handleSuspend = async (user: User) => {
        if (!user.id) return;
        const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
        try {
            await updateUser(user.id, { status: newStatus });
            toast({
                title: "Success!",
                description: `User "${user.name}" has been ${newStatus.toLowerCase()}.`,
            });
        } catch (error) {
            console.error("Error updating user status:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not update the user's status. Please try again.",
            });
        }
    }
    
    return [
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
                 <UserModal userToEdit={user}>
                    <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                        Edit
                    </button>
                </UserModal>
                <ActionConfirmationDialog
                  title="Are you sure?"
                  description={`This will ${user.status === 'Suspended' ? 'reactivate' : 'suspend'} ${user.name}'s account.`}
                  onConfirm={() => handleSuspend(user)}
                >
                  <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-orange-600 focus:text-orange-600 focus:bg-orange-100 dark:focus:bg-orange-900/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    {user.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                  </button>
                </ActionConfirmationDialog>
                <ActionConfirmationDialog
                  title="Are you absolutely sure?"
                  description={`This action cannot be undone. This will permanently delete ${user.name}'s account and remove their data from our servers.`}
                  onConfirm={() => handleDelete(user)}
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
