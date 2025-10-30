
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sales } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/sales/columns";
import { TransactionModal } from "@/components/sales/transaction-modal";

export default function SalesPage() {
    const salesData = sales.filter(s => s.type === 'Sale');
    const usageData = sales.filter(s => s.type === 'Usage');

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
                    <DataTable columns={columns} data={salesData} />
                </TabsContent>
                <TabsContent value="usage">
                    <DataTable columns={columns} data={usageData} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
