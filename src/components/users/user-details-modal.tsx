
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
    const [isViewOpen, setIsViewOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);

    const statusVariant = user.status === "Active" ? "success" : user.status === "Suspended" ? "warning" : "destructive";

    const handleEditClick = () => {
        setIsViewOpen(false);
        setIsEditOpen(true);
    };

    return (
        <>
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{user.name}</DialogTitle>
                        <DialogDescription>
                            User Details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-3 gap-4 items-center">
                            <Label className="text-muted-foreground text-right">Email</Label>
                            <div className="col-span-2 font-medium">{user.email}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                            <Label className="text-muted-foreground text-right">Role</Label>
                            <div className="col-span-2 font-medium">{user.role}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
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
                        <Button onClick={handleEditClick}>Edit User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <UserModal userToEdit={user} open={isEditOpen} onOpenChange={setIsEditOpen}>
                {/* This trigger is hidden and controlled programmatically */}
                <button className="hidden"></button>
            </UserModal>
        </>
    )
}
