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
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-200 bg-clip-text text-transparent">Top Selling Items</CardTitle>
        <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium mt-1">
          Your best-performing products this month.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200/60 dark:border-slate-800/60 hover:bg-transparent">
              <TableHead className="text-slate-800 dark:text-slate-200 font-bold text-sm">Item</TableHead>
              <TableHead className="text-right text-slate-800 dark:text-slate-200 font-bold text-sm">Quantity</TableHead>
              <TableHead className="text-right text-slate-800 dark:text-slate-200 font-bold text-sm">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.name} className="border-slate-200/60 dark:border-slate-800/60 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent dark:hover:from-slate-800/50 dark:hover:to-transparent transition-all duration-200">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <div className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-50">{item.name}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right text-slate-700 dark:text-slate-300 font-semibold py-4">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{item.quantity.toLocaleString()}</span>
                </TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-500 font-bold py-4">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-950 rounded-lg">₦{item.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

    