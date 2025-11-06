import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TopProduct = {
    name: string;
    quantity: number;
    profit: number;
}

type TopProductsTableProps = {
    items: TopProduct[];
}

export function TopProductsTable({ items }: TopProductsTableProps) {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50">Top Selling Items</CardTitle>
        <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
          Your best-performing products this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Item</TableHead>
              <TableHead className="text-right text-slate-700 dark:text-slate-300 font-semibold">Quantity</TableHead>
              <TableHead className="text-right text-slate-700 dark:text-slate-300 font-semibold">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.name} className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell>
                  <div className="font-medium text-slate-900 dark:text-slate-50">{item.name}</div>
                </TableCell>
                <TableCell className="text-right text-slate-700 dark:text-slate-300">{item.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-500 font-semibold">₦{item.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

    