import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Download } from "lucide-react";

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
                        <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
                            <BarChart className="h-16 w-16 text-muted-foreground" />
                            <p className="ml-4 text-muted-foreground">Sales chart would be displayed here.</p>
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
