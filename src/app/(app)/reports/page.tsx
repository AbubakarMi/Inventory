
"use client"

import { useMemo } from "react";
import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { initializeFirebase, useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Sale, InventoryItem, ChartData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  value: { 
    label: "Sales",
    color: "hsl(var(--primary))",
  },
}

export default function ReportsPage() {
    const { firestore } = initializeFirebase();

    const salesQuery = useMemo(() => firestore ? query(collection(firestore, 'sales')) : null, [firestore]);
    const inventoryQuery = useMemo(() => firestore ? query(collection(firestore, 'inventory')) : null, [firestore]);
    
    const { data: sales, loading: loadingSales } = useCollection<Sale>(salesQuery);
    const { data: inventoryItems, loading: loadingInventory } = useCollection<InventoryItem>(inventoryQuery);

    const { totalRevenue, costOfGoodsSold, netProfit, salesChartData } = useMemo(() => {
        if (!sales || !inventoryItems) {
            return {
                totalRevenue: 0,
                costOfGoodsSold: 0,
                netProfit: 0,
                salesChartData: []
            };
        }

        const totalRevenue = sales
            .filter(sale => sale.type === 'Sale')
            .reduce((sum, sale) => sum + sale.total, 0);

        const costOfGoodsSold = sales
            .filter(sale => sale.type === 'Sale')
            .reduce((sum, sale) => {
                const item = inventoryItems.find(i => i.name === sale.itemName);
                return sum + (item ? item.cost * sale.quantity : 0);
            }, 0);

        const netProfit = totalRevenue - costOfGoodsSold;

        // Group sales by date for the chart
        const dailyTrends: { [date: string]: number } = {};
        sales.forEach(sale => {
            const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dailyTrends[date]) {
                dailyTrends[date] = 0;
            }
            dailyTrends[date] += sale.total;
        });

        const salesChartData: ChartData[] = Object.entries(dailyTrends)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


        return { totalRevenue, costOfGoodsSold, netProfit, salesChartData };

    }, [sales, inventoryItems]);

    const loading = loadingSales || loadingInventory;

    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold text-lg md:text-2xl">Reports</h1>
                     <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-[300px]" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
                 <div className="grid gap-4 md:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profit/Loss Summary</CardTitle>
                            <CardDescription>Financial summary based on the selected date range.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Trend</CardTitle>
                            <CardDescription>A summary of sales within the selected date range.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Report</CardTitle>
                            <CardDescription>Current stock levels and values.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                             <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                             <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

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

            <div className="grid gap-4 md:gap-8">
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
                        <CardTitle>Sales Trend</CardTitle>
                        <CardDescription>A summary of sales within the selected date range.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart 
                                data={salesChartData}
                                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                >
                                    <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} />
                                    <ChartTooltip cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
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
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    