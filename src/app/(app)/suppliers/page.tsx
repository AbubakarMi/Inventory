
"use client"

import * as React from "react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { getColumns } from "@/components/suppliers/columns";
import { SupplierModal } from "@/components/suppliers/supplier-modal";
import { initializeFirebase, useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Supplier } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SuppliersPage() {
    const { firestore } = initializeFirebase();
    const { toast } = useToast();
    const suppliersQuery = useMemo(() => firestore ? query(collection(firestore, 'suppliers')) : null, [firestore]);
    const { data: suppliers, loading } = useCollection<Supplier>(suppliersQuery);
    const columns = useMemo(() => getColumns(toast), [toast]);


    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold text-lg md:text-2xl">Suppliers</h1>
                    <Skeleton className="h-10 w-32" />
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
                <h1 className="font-semibold text-lg md:text-2xl">Suppliers</h1>
                <SupplierModal>
                    <Button>Add Supplier</Button>
                </SupplierModal>
            </div>
            <DataTable 
                columns={columns} 
                data={suppliers || []} 
                emptyState={
                    <div className="flex flex-col items-center gap-4 text-center py-12">
                        <Truck className="h-16 w-16 text-muted-foreground" />
                        <h3 className="text-xl font-bold tracking-tight">No suppliers found</h3>
                        <p className="text-sm text-muted-foreground">Add your first supplier to see them here.</p>
                        <SupplierModal>
                            <Button>Add Supplier</Button>
                        </SupplierModal>
                    </div>
                }
            />
        </div>
    )
}
