
"use client"

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { suppliers } from "@/lib/data";
import { columns } from "@/components/suppliers/columns";
import { SupplierModal } from "@/components/suppliers/supplier-modal";

export default function SuppliersPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Suppliers</h1>
                <SupplierModal>
                    <Button>Add Supplier</Button>
                </SupplierModal>
            </div>
            <DataTable columns={columns} data={suppliers} />
        </div>
    )
}
