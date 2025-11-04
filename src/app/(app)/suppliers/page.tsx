
'use client'

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/suppliers/columns";
import { SupplierModal } from "@/components/suppliers/supplier-modal";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Supplier } from "@/lib/types";
import { useMemo } from "react";

export default function SuppliersPage() {
    const firestore = useFirestore();

    const suppliersQuery = useMemo(() => firestore ? collection(firestore, 'suppliers') : null, [firestore]);
    const { data: suppliers, loading } = useCollection<Supplier>(suppliersQuery);

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Suppliers</h1>
                <SupplierModal>
                    <Button>Add Supplier</Button>
                </SupplierModal>
            </div>
            <DataTable columns={columns} data={suppliers || []} />
        </div>
    )
}
