
"use client"

import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { dailyTrendsData } from "@/lib/data"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"

const chartConfig = {
  value: { 
    label: "Sales",
    color: "hsl(var(--primary))",
  },
}

export default function ReportsPage() {
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
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-muted rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                            <p className="text-2xl font-bold">₦12,450.00</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Cost</h3>
                            <p className="text-2xl font-bold">₦7,820.00</p>
                        </div>
                        <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Net Profit</h3>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-400">₦4,630.00</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sales Report</CardTitle>
                        <CardDescription>A summary of sales within the selected date range.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyTrendsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} />
                                    <ChartTooltip cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                </LineChart>
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
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Value</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                <TableRow>
                                    <TableCell>Organic Apples</TableCell>
                                    <TableCell>Fruits</TableCell>
                                    <TableCell>150 kg</TableCell>
                                    <TableCell>₦180.00</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Carrots</TableCell>
                                    <TableCell>Vegetables</TableCell>
                                    <TableCell>80 kg</TableCell>
                                    <TableCell>₦64.00</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
