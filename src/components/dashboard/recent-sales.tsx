
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Sale } from "@/lib/types"
import { TrendingUp } from "lucide-react"

export function RecentSales({ sales }: { sales: Sale[] }) {
  const totalSalesValue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-200 bg-clip-text text-transparent">Recent Sales</CardTitle>
            <CardDescription className="mt-1.5 text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
              {sales.length} transactions
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-sm md:text-base font-bold text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-950 px-3 py-2 rounded-xl shadow-sm">
            <TrendingUp className="h-5 w-5" />
            ₦{totalSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {sales.map((sale, index) => (
        <div key={sale.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent dark:hover:from-slate-800/50 dark:hover:to-transparent transition-all duration-200 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-sm shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-sm">
              {sale.item_name ? sale.item_name.substring(0, 2).toUpperCase() : 'IT'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight truncate text-slate-900 dark:text-slate-50">{sale.item_name || 'Unknown Item'}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              {new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-[90px]">
            <Badge variant="secondary" className="text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-lg shadow-sm whitespace-nowrap w-fit">
              {sale.quantity}x
            </Badge>
            <div className="font-semibold text-sm text-green-600 dark:text-green-500 whitespace-nowrap">
              +₦{Number(sale.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        ))}
      </CardContent>
    </Card>
  )
}
