
'use client'

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/users/columns";
import { UserModal } from "@/components/users/user-modal";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import type { User } from "@/lib/types";

export default function UsersPage() {
    const firestore = useFirestore();
    const { data: users, loading } = useCollection<User>(
        firestore ? collection(firestore, 'users') : null
    );

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
                <UserModal>
                    <Button>Add User</Button>
                </UserModal>
            </div>
            <DataTable columns={columns} data={users || []} />
        </div>
    )
}
