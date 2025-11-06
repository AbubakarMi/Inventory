
"use client"

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { getColumns } from "@/components/users/columns";
import { UserModal } from "@/components/users/user-modal";
import { api } from "@/lib/api-client";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Users2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const columns = useMemo(() => getColumns(toast, handleRefresh), [toast]);


    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
                    <Skeleton className="h-10 w-28" />
                </div>
                <div className="rounded-md border overflow-auto">
                    <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                    <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                    <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
                <UserModal onSuccess={handleRefresh}>
                    <Button>Add User</Button>
                </UserModal>
            </div>
            <DataTable 
                columns={columns} 
                data={users || []} 
                emptyState={
                     <div className="flex flex-col items-center gap-4 text-center py-12">
                        <Users2 className="h-16 w-16 text-muted-foreground" />
                        <h3 className="text-xl font-bold tracking-tight">No users found</h3>
                        <p className="text-sm text-muted-foreground">Create your first user to get started.</p>
                        <UserModal onSuccess={handleRefresh}>
                            <Button>Add User</Button>
                        </UserModal>
                    </div>
                }
            />
        </div>
    )
}
