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
import type { InventoryItem } from "@/lib/types"


type TopProductsTableProps = {
    items: InventoryItem[];
}

export function TopProductsTable({ items }: TopProductsTableProps) {
  // This is a simplified version. A real implementation would need sales data to calculate top selling.
  // Here, we'll just show the most profitable items based on price vs cost.
  const topItems = items
    .map(item => ({ ...item, profit: (item.price - item.cost) * item.quantity }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Items</CardTitle>
        <CardDescription>
          Your best-performing products this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Est. Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                </TableCell>
                <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-right">₦{item.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}
             {topItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No items to display.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
