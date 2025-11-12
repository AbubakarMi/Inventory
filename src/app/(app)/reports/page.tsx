
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
                // Fetch data with individual error handling to prevent one failure from blocking all data
                const [salesRes, inventoryRes] = await Promise.all([
                    api.get('/sales').catch((error) => {
                        // Silently handle expected errors (401 Unauthorized)
                        if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
                            console.error('Error fetching sales:', error);
                        }
                        return { sales: [] };
                    }),
                    api.get('/inventory').catch((error) => {
                        if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
                            console.error('Error fetching inventory:', error);
                        }
                        return { items: [] };
                    }),
                ]);
                setSales(salesRes.sales || []);
                setInventoryItems(inventoryRes.items || []);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error fetching reports data:', error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const { totalRevenue, costOfGoodsSold, netProfit, totalStockValue, totalItems, lowStockCount, outOfStockCount, averageItemValue, salesChartData } = useMemo(() => {
        if (!sales || !inventoryItems) {
            return {
                totalRevenue: 0,
                costOfGoodsSold: 0,
                netProfit: 0,
                totalStockValue: 0,
                totalItems: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                averageItemValue: 0,
                salesChartData: []
            };
        }

        const totalRevenue = sales
            .filter(sale => sale.type === 'Sale')
            .reduce((sum, sale) => sum + Number(sale.total), 0);

        const costOfGoodsSold = sales
            .filter(sale => sale.type === 'Sale')
            .reduce((sum, sale) => {
                const item = inventoryItems.find(i => i.name === sale.item_name);
                return sum + (item ? Number(item.cost) * Number(sale.quantity) : 0);
            }, 0);

        const netProfit = totalRevenue - costOfGoodsSold;

        // Calculate total stock value
        const totalStockValue = inventoryItems.reduce((sum, item) => {
            return sum + (Number(item.cost) * Number(item.quantity));
        }, 0);

        // Calculate total items in stock
        const totalItems = inventoryItems.reduce((sum, item) => sum + Number(item.quantity), 0);

        // Count low stock items
        const lowStockCount = inventoryItems.filter(item => {
            const quantity = Number(item.quantity) || 0;
            const threshold = Number(item.threshold) || 0;
            return quantity > 0 && quantity <= threshold;
        }).length;

        // Count out of stock items
        const outOfStockCount = inventoryItems.filter(item => Number(item.quantity) === 0).length;

        // Calculate average item value
        const averageItemValue = inventoryItems.length > 0 ? totalStockValue / inventoryItems.length : 0;

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


        return { totalRevenue, costOfGoodsSold, netProfit, totalStockValue, totalItems, lowStockCount, outOfStockCount, averageItemValue, salesChartData };

    }, [sales, inventoryItems]);

    const exportToPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Colors - simplified
        const primaryGreen = [45, 122, 62];
        const darkGray = [50, 50, 50];
        const lightGray = [100, 100, 100];
        const bgGray = [245, 245, 245];

        let yPos = 20;

        // Add logo
        const logoImg = new Image();
        logoImg.src = '/albarka-logo.jpg';

        // Center logo at top
        const logoSize = 25;
        const logoX = (pageWidth - logoSize) / 2;
        doc.addImage(logoImg, 'JPEG', logoX, yPos, logoSize, logoSize);

        // Add large transparent watermark in the center
        const watermarkWidth = 140;
        const watermarkHeight = 140;
        const watermarkX = (pageWidth - watermarkWidth) / 2;
        const watermarkY = (pageHeight - watermarkHeight) / 2;
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.05 }));
        doc.addImage(logoImg, 'JPEG', watermarkX, watermarkY, watermarkWidth, watermarkHeight, undefined, 'NONE');
        doc.restoreGraphicsState();

        yPos += logoSize + 5;

        // Header - Company Name (centered)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
        doc.text('ALBARKA PS INTERTRADE', pageWidth / 2, yPos, { align: 'center' });

        yPos += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Inventory Management System', pageWidth / 2, yPos, { align: 'center' });

        yPos += 8;

        // Report Title and Date
        yPos += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('Inventory Report', 14, yPos);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - 14, yPos, { align: 'right' });

        // Line separator
        yPos += 5;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(14, yPos, pageWidth - 14, yPos);

        // Financial Summary
        yPos += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('Financial Summary', 14, yPos);

        yPos += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

        doc.text('Total Revenue:', 14, yPos);
        doc.text(`N${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 80, yPos);

        yPos += 5;
        doc.text('Cost of Goods Sold:', 14, yPos);
        doc.text(`N${costOfGoodsSold.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 80, yPos);

        yPos += 5;
        doc.setFont('helvetica', 'bold');
        const profitColor = netProfit >= 0 ? [45, 122, 62] : [220, 38, 38];
        doc.setTextColor(profitColor[0], profitColor[1], profitColor[2]);
        doc.text('Net Profit:', 14, yPos);
        doc.text(`N${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 80, yPos);

        // Inventory Overview
        yPos += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('Inventory Overview', 14, yPos);

        yPos += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        doc.text('Total Stock Value:', 14, yPos);
        doc.text(`N${totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 80, yPos);

        yPos += 5;
        doc.text('Total Items:', 14, yPos);
        doc.text(`${totalItems.toLocaleString('en-US')} (${inventoryItems.length} unique)`, 80, yPos);

        yPos += 5;
        doc.text('Low Stock Items:', 14, yPos);
        doc.text(`${lowStockCount}`, 80, yPos);

        yPos += 5;
        doc.text('Out of Stock Items:', 14, yPos);
        doc.text(`${outOfStockCount}`, 80, yPos);

        yPos += 5;
        doc.text('Average Item Value:', 14, yPos);
        doc.text(`N${averageItemValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 80, yPos);

        yPos += 5;
        doc.text('Profit Margin:', 14, yPos);
        doc.text(`${totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : '0.00'}%`, 80, yPos);

        // Inventory Table
        yPos += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('Inventory Items', 14, yPos);

        yPos += 5;

        const inventoryData = inventoryItems.map(item => [
            item.name,
            item.category || 'N/A',
            `${item.quantity} ${item.unit}`,
            item.status || 'N/A',
            `N${(item.quantity * item.cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Item', 'Category', 'Qty', 'Status', 'Value']],
            body: inventoryData,
            theme: 'plain',
            styles: {
                lineWidth: 0.3,
                lineColor: [200, 200, 200],
                cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
                minCellHeight: 7,
                fontSize: 8,
                textColor: darkGray
            },
            headStyles: {
                textColor: darkGray,
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left',
                lineWidth: 0.3,
                lineColor: [200, 200, 200],
                cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }
            },
            bodyStyles: {
                fontSize: 8,
                textColor: darkGray,
                lineWidth: 0.3,
                lineColor: [200, 200, 200],
                cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }
            },
            columnStyles: {
                0: { cellWidth: 55 },
                1: { cellWidth: 30 },
                2: { cellWidth: 25, halign: 'center' },
                3: { cellWidth: 25, halign: 'center' },
                4: { cellWidth: 50, halign: 'right' }
            },
            margin: { left: 14, right: 14 },
            didDrawPage: function(data) {
                // Footer
                const footerY = pageHeight - 10;
                doc.setFontSize(8);
                doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
                doc.setFont('helvetica', 'normal');
                doc.text('APS Intertrade Inventory System', 14, footerY);
                doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth - 14, footerY, { align: 'right' });
            }
        });

        // Save the PDF
        doc.save(`APS-Intertrade-Inventory-Report-${new Date().toISOString().split('T')[0]}.pdf`);
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
            [],
            ['Inventory Overview'],
            [],
            ['Total Stock Value', totalStockValue],
            ['Total Items', totalItems],
            ['Unique Items', inventoryItems.length],
            ['Low Stock Items', lowStockCount],
            ['Out of Stock Items', outOfStockCount],
            ['Average Item Value', averageItemValue],
            ['Profit Margin (%)', totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : '0.00'],
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
                sale.item_name,
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
                        <CardTitle>Inventory Overview</CardTitle>
                        <CardDescription>Comprehensive inventory statistics and metrics.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {/* Row 1: Total Stock Value + Average Item Value */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Stock Value</h3>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">₦{totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400">Average Item Value</h3>
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">₦{averageItemValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        {/* Rows 2-3: Remaining cards in 3-column grid */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
                                <p className="text-2xl font-bold">{totalItems.toLocaleString('en-US')}</p>
                                <p className="text-xs text-muted-foreground mt-1">{inventoryItems.length} unique items</p>
                            </div>
                            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                                <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Low Stock</h3>
                                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{lowStockCount}</p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">items need reorder</p>
                            </div>
                            <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                <h3 className="text-sm font-medium text-red-700 dark:text-red-400">Out of Stock</h3>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{outOfStockCount}</p>
                                <p className="text-xs text-red-700 dark:text-red-400 mt-1">items unavailable</p>
                            </div>
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                                <h3 className="text-sm font-medium text-orange-700 dark:text-orange-400">Expiring Soon</h3>
                                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{inventoryItems.filter(item => item.expiry && new Date(item.expiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && new Date(item.expiry) >= new Date()).length}</p>
                                <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">within 30 days</p>
                            </div>
                            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-400">Expired Items</h3>
                                <p className="text-2xl font-bold text-slate-700 dark:text-slate-400">{inventoryItems.filter(item => item.expiry && new Date(item.expiry) < new Date()).length}</p>
                                <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">past expiry date</p>
                            </div>
                            <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Profit Margin</h3>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : '0.00'}%
                                </p>
                            </div>
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
                                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                >
                                    <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} width={60} />
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

    
