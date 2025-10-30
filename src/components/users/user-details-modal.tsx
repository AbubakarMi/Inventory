
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
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types"
import { UserModal } from "./user-modal";
import { Separator } from "@/components/ui/separator";

type UserDetailsModalProps = {
  children: React.ReactNode;
  user: User;
}

export function UserDetailsModal({ children, user }: UserDetailsModalProps) {
    const statusVariant = user.status === "Active" ? "success" : user.status === "Suspended" ? "warning" : "destructive";

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                    <DialogDescription>
                        A detailed view of the user's information.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="flex flex-col space-y-1">
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Separator />
                        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                        <p className="text-sm text-muted-foreground">Role</p>
                        <p className="col-span-2 font-medium text-sm">{user.role}</p>
                    </div>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-2 items-center">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="col-span-2">
                                <Badge variant={statusVariant}>{user.status}</Badge>
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-6">
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
