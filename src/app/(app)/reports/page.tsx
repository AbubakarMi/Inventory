
"use client"

import { useMemo, useState, useEffect } from "react";
import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { api } from "@/lib/api-client";
import type { Sale, InventoryItem, ChartData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const chartConfig = {
  value: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
}

export default function ReportsPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [salesRes, inventoryRes] = await Promise.all([
                    api.get('/sales'),
                    api.get('/inventory'),
                ]);
                setSales(salesRes.sales || []);
                setInventoryItems(inventoryRes.items || []);
            } catch (error) {
                console.error('Error fetching reports data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
            .reduce((sum, sale) => sum + Number(sale.total), 0);

        const costOfGoodsSold = sales
            .filter(sale => sale.type === 'Sale')
            .reduce((sum, sale) => {
                const item = inventoryItems.find(i => i.name === sale.itemName);
                return sum + (item ? Number(item.cost) * Number(sale.quantity) : 0);
            }, 0);

        const netProfit = totalRevenue - costOfGoodsSold;

        // Group sales by date for the chart
        const dailyTrends: { [date: string]: number } = {};
        sales.forEach(sale => {
            const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dailyTrends[date]) {
                dailyTrends[date] = 0;
            }
            dailyTrends[date] += Number(sale.total);
        });

        const salesChartData: ChartData[] = Object.entries(dailyTrends)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


        return { totalRevenue, costOfGoodsSold, netProfit, salesChartData };

    }, [sales, inventoryItems]);

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text('Inventory Report', 14, 22);

        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Add financial summary
        doc.setFontSize(14);
        doc.text('Profit/Loss Summary', 14, 45);
        doc.setFontSize(10);
        doc.text(`Total Revenue: ₦${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 55);
        doc.text(`Cost of Goods Sold: ₦${costOfGoodsSold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 62);
        doc.text(`Net Profit: ₦${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 69);

        // Add inventory table
        const inventoryData = inventoryItems.map(item => [
            item.name,
            item.category,
            `${item.quantity} ${item.unit}`,
            `₦${(item.quantity * item.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);

        autoTable(doc, {
            startY: 80,
            head: [['Item', 'Category', 'Quantity', 'Inventory Value']],
            body: inventoryData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
        });

        // Save the PDF
        doc.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const exportToExcel = () => {
        // Create workbook
        const wb = XLSX.utils.book_new();

        // Financial Summary sheet
        const summaryData = [
            ['Profit/Loss Summary'],
            [],
            ['Total Revenue', totalRevenue],
            ['Cost of Goods Sold', costOfGoodsSold],
            ['Net Profit', netProfit],
        ];
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Financial Summary');

        // Inventory Report sheet
        const inventoryData = [
            ['Item', 'Category', 'Quantity', 'Unit', 'Cost per Unit', 'Inventory Value'],
            ...inventoryItems.map(item => [
                item.name,
                item.category,
                item.quantity,
                item.unit,
                item.cost,
                item.quantity * item.cost
            ])
        ];
        const inventoryWs = XLSX.utils.aoa_to_sheet(inventoryData);
        XLSX.utils.book_append_sheet(wb, inventoryWs, 'Inventory Report');

        // Sales Data sheet
        const salesData = [
            ['Item Name', 'Quantity', 'Type', 'Date', 'Total'],
            ...sales.map((sale: any) => [
                sale.itemName || sale.item_name,
                sale.quantity,
                sale.type,
                new Date(sale.date).toLocaleDateString(),
                Number(sale.total || 0)
            ])
        ];
        const salesWs = XLSX.utils.aoa_to_sheet(salesData);
        XLSX.utils.book_append_sheet(wb, salesWs, 'Sales Data');

        // Save the Excel file
        XLSX.writeFile(wb, `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

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
                    <Button variant="outline" onClick={exportToPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                     <Button variant="outline" onClick={exportToExcel}>
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

    
