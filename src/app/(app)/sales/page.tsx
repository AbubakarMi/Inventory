
"use client"

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/sales/columns";
import { TransactionModal } from "@/components/sales/transaction-modal";
import { initializeFirebase, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Sale } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FileWarning } from "lucide-react";

export default function SalesPage() {
    const { firestore } = initializeFirebase();

    const salesQuery = React.useMemo(() => 
        firestore ? query(collection(firestore, 'sales'), where('type', '==', 'Sale')) : null
    , [firestore]);

    const usageQuery = React.useMemo(() => 
        firestore ? query(collection(firestore, 'sales'), where('type', '==', 'Usage')) : null
    , [firestore]);

    const { data: salesData, loading: loadingSales } = useCollection<Sale>(salesQuery);
    const { data: usageData, loading: loadingUsage } = useCollection<Sale>(usageQuery);

    const loading = loadingSales || loadingUsage;

    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold text-lg md:text-2xl">Sales / Usage</h1>
                    <Skeleton className="h-10 w-40" />
                </div>
                <Skeleton className="h-10 w-48" />
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
                    <DataTable 
                        columns={columns} 
                        data={salesData || []}
                        emptyState={
                            <div className="flex flex-col items-center gap-4 text-center py-12">
                                <FileWarning className="h-16 w-16 text-muted-foreground" />
                                <h3 className="text-xl font-bold tracking-tight">No sales recorded</h3>
                                <p className="text-sm text-muted-foreground">Start by recording your first sale.</p>
                                <TransactionModal><Button>Record Sale</Button></TransactionModal>
                            </div>
                        }
                    />
                </TabsContent>
                <TabsContent value="usage">
                    <DataTable 
                        columns={columns} 
                        data={usageData || []}
                        emptyState={
                             <div className="flex flex-col items-center gap-4 text-center py-12">
                                <FileWarning className="h-16 w-16 text-muted-foreground" />
                                <h3 className="text-xl font-bold tracking-tight">No usage recorded</h3>
                                <p className="text-sm text-muted-foreground">Start by recording your first item usage.</p>
                                <TransactionModal><Button>Record Usage</Button></TransactionModal>
                            </div>
                        }
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
