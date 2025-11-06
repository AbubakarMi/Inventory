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
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-200 bg-clip-text text-transparent">Sales Trend</CardTitle>
        <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium mt-1">
          Recent sales performance - ₦{totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" className="stroke-slate-200 dark:stroke-slate-800" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                className="text-xs md:text-sm font-medium"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
              />
              <YAxis
                className="text-xs md:text-sm font-medium"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
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
                strokeWidth={3}
                fill="url(#colorSales)"
                animationBegin={0}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
