
"use client"

import * as React from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types"
import { UserModal } from "./user-modal";

type UserDetailsModalProps = {
  children: React.ReactNode;
  user: User;
}

export function UserDetailsModal({ children, user }: UserDetailsModalProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const statusVariant = user.status === "Active" ? "success" : user.status === "Suspended" ? "warning" : "destructive";

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{user.name}</DialogTitle>
                    <DialogDescription>
                        User Details
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-muted-foreground text-right">Email</Label>
                        <div className="col-span-2 font-medium">{user.email}</div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-muted-foreground text-right">Role</Label>
                        <div className="col-span-2 font-medium">{user.role}</div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-muted-foreground text-right">Status</Label>
                        <div className="col-span-2">
                             <Badge variant={statusVariant}>{user.status}</Badge>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <UserModal userToEdit={user} onOpenChange={() => setIsOpen(false)}>
                        <Button>Edit User</Button>
                    </UserModal>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
