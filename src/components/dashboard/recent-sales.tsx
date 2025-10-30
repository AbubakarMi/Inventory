
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Sale } from "@/lib/types"

export function RecentSales({ sales }: { sales: Sale[] }) {
  const totalSalesValue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
            You made {sales.length} sales with a total of ₦{totalSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {sales.map(sale => (
        <div key={sale.id} className="flex items-center gap-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">{sale.itemName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(sale.date).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto font-medium">+₦{sale.total.toFixed(2)}</div>
        </div>
        ))}
      </CardContent>
    </Card>
  )
}
