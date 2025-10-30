
"use client"

import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Sale, InventoryItem } from "@/lib/types";

export default function ReportsPage() {
    const firestore = useFirestore();

    const { data: sales, loading: salesLoading } = useCollection<Sale>(
        firestore ? query(collection(firestore, 'sales')) : null
    );

    const { data: inventoryItems, loading: inventoryLoading } = useCollection<InventoryItem>(
        firestore ? query(collection(firestore, 'inventory')) : null
    );

    if (salesLoading || inventoryLoading) {
        return <div>Loading reports...</div>;
    }

    const totalRevenue = sales
        ?.filter(sale => sale.type === 'Sale')
        .reduce((sum, sale) => sum + sale.total, 0) || 0;

    const costOfGoodsSold = sales
        ?.filter(sale => sale.type === 'Sale')
        .reduce((sum, sale) => {
            const item = inventoryItems?.find(i => i.name === sale.itemName);
            return sum + (item ? item.cost * sale.quantity : 0);
        }, 0) || 0;

    const netProfit = totalRevenue - costOfGoodsSold;


    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Reports</h1>
                <div className="flex items-center gap-2">
                    <DateRangePicker />
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                     <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Profit/Loss Summary</CardTitle>
                        <CardDescription>Financial summary based on the selected date range.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-muted rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                            <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground">Cost of Goods Sold</h3>
                            <p className="text-2xl font-bold">₦{costOfGoodsSold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${netProfit >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                            <h3 className={`text-sm font-medium ${netProfit >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>Net Profit</h3>
                            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>₦{netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Report</CardTitle>
                        <CardDescription>Current stock levels and values.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Inventory Value</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {inventoryItems?.map(item => (
                                     <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                                        <TableCell className="text-right">₦{(item.quantity * item.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                )) || (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No inventory items.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
