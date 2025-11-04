
'use client'

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/sales/columns";
import { TransactionModal } from "@/components/sales/transaction-modal";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Sale } from "@/lib/types";
import { useMemo } from "react";

export default function SalesPage() {
    const firestore = useFirestore();

    const salesQuery = useMemo(() => firestore ? query(collection(firestore, 'sales'), where('type', '==', 'Sale')) : null, [firestore]);
    const { data: salesData, loading: salesLoading } = useCollection<Sale>(salesQuery);

    const usageQuery = useMemo(() => firestore ? query(collection(firestore, 'sales'), where('type', '==', 'Usage')) : null, [firestore]);
    const { data: usageData, loading: usageLoading } = useCollection<Sale>(usageQuery);

    const isLoading = salesLoading || usageLoading;

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
             <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Sales / Usage</h1>
                <TransactionModal>
                    <Button>Record Transaction</Button>
                </TransactionModal>
            </div>
            <Tabs defaultValue="sales">
                <TabsList>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                </TabsList>
                <TabsContent value="sales">
                    <DataTable columns={columns} data={salesData || []} />
                </TabsContent>
                <TabsContent value="usage">
                    <DataTable columns={columns} data={usageData || []} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
