
'use client'

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/users/columns";
import { UserModal } from "@/components/users/user-modal";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import type { User as UserType } from "@/lib/types";
import { useMemo } from "react";

export default function UsersPage() {
    const firestore = useFirestore();
    const { user: currentUser, claims } = useUser();

    // Use a different name for the data from useCollection to avoid conflict with the type
    const { data: usersData, loading } = useCollection<UserType>(
        firestore ? collection(firestore, 'users') : null
    );

    // Filter out the current user from the list
    const users = useMemo(() => {
        if (!usersData || !currentUser) return [];
        return usersData.filter(user => user.id !== currentUser.uid);
    }, [usersData, currentUser]);
    
    const canAddUser = claims?.role === 'Admin';


    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
                {canAddUser && (
                    <UserModal>
                        <Button>Add User</Button>
                    </UserModal>
                )}
            </div>
            <DataTable columns={columns} data={users || []} />
        </div>
    )
}
