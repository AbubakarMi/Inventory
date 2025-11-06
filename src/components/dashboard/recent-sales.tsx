
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Sale } from "@/lib/types"
import { TrendingUp } from "lucide-react"

export function RecentSales({ sales }: { sales: Sale[] }) {
  const totalSalesValue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50">Recent Sales</CardTitle>
            <CardDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {sales.length} transactions
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-500">
            <TrendingUp className="h-4 w-4" />
            ₦{totalSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sales.map((sale, index) => (
        <div key={sale.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {sale.itemName ? sale.itemName.substring(0, 2).toUpperCase() : 'IT'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate text-slate-900 dark:text-slate-50">{sale.itemName || 'Unknown Item'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {sale.quantity}x
            </Badge>
            <div className="font-semibold text-sm text-green-600 dark:text-green-500">
              +₦{Number(sale.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        ))}
      </CardContent>
    </Card>
  )
}
