"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { Sale } from "@/lib/types"

const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--primary))" },
}

type SalesTrendChartProps = {
  sales: Sale[]
}

export function SalesTrendChart({ sales }: SalesTrendChartProps) {
  const chartData = React.useMemo(() => {
    // Group sales by date
    const salesByDate: { [key: string]: number } = {}

    sales.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      salesByDate[date] = (salesByDate[date] || 0) + sale.total
    })

    // Get last 7 days or available data
    const dates = Object.keys(salesByDate).slice(-7)

    return dates.map(date => ({
      date,
      sales: salesByDate[date]
    }))
  }, [sales])

  const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0)

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50">Sales Trend</CardTitle>
        <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
          Recent sales performance - ₦{totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={<ChartTooltipContent
                  formatter={(value) => `₦${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                />}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
