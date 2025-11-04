
'use client'

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/users/columns";
import { UserModal } from "@/components/users/user-modal";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { User as UserType } from "@/lib/types";
import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
    const firestore = useFirestore();
    const { user: currentUser, claims } = useUser();
    const router = useRouter();
    const [isFirstUser, setIsFirstUser] = useState(false);

    // Use a different name for the data from useCollection to avoid conflict with the type
    const usersQuery = useMemo(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: usersData, loading } = useCollection<UserType>(usersQuery);

    useEffect(() => {
        const checkUsers = async () => {
            if (firestore) {
                const usersSnapshot = await getDocs(collection(firestore, "users"));
                if (usersSnapshot.empty) {
                    setIsFirstUser(true);
                }
            }
        };
        checkUsers();
    }, [firestore]);

    // Filter out the current user from the list, so they can't edit themselves here.
    const users = useMemo(() => {
        if (!usersData || !currentUser) return usersData || [];
        return usersData.filter(user => user.id !== currentUser.uid);
    }, [usersData, currentUser]);
    
    // An admin can always add a user. Also, allow adding if there are no users yet.
    const canAddUser = claims?.role === 'Admin' || isFirstUser;
    
    if (loading) {
        return <div>Loading...</div>
    }
    
    // This logic is now handled by the AuthGuard.
    // If not first user and no current user, guard will redirect to login.

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
