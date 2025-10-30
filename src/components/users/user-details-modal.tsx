
"use client"

import * as React from "react";
import Image from "next/image";
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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";

type UserDetailsModalProps = {
  children: React.ReactNode;
  user: User;
}

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');


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
                <DialogTrigger asChild onClick={() => setIsViewOpen(true)}>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            A complete overview of the user's profile.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center space-x-4">
                            {userAvatar && (
                                <Image
                                    src={userAvatar.imageUrl}
                                    alt="User avatar"
                                    width={64}
                                    height={64}
                                    className="rounded-full"
                                    data-ai-hint={userAvatar.imageHint}
                                />
                            )}
                            <div className="space-y-1">
                                <h2 className="text-xl font-semibold">{user.name}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
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
