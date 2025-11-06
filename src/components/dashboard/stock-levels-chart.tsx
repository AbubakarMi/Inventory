"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { InventoryItem } from "@/lib/types"

const chartConfig = {
  quantity: { label: "Quantity", color: "hsl(var(--primary))" },
}

type StockLevelsChartProps = {
  items: InventoryItem[]
}

export function StockLevelsChart({ items }: StockLevelsChartProps) {
  const chartData = React.useMemo(() => {
    // Group by category
    const stockByCategory: { [key: string]: number } = {}

    items.forEach(item => {
      stockByCategory[item.category] = (stockByCategory[item.category] || 0) + item.quantity
    })

    return Object.entries(stockByCategory).map(([category, quantity]) => ({
      category,
      quantity
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 6)
  }, [items])

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-200 bg-clip-text text-transparent">Stock Levels by Category</CardTitle>
        <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium mt-1">
          Current inventory distribution across top categories
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" barSize={32}>
              <CartesianGrid strokeDasharray="5 5" className="stroke-slate-200 dark:stroke-slate-800" strokeOpacity={0.5} horizontal={false} />
              <XAxis
                type="number"
                className="text-xs md:text-sm font-medium"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                className="text-xs md:text-sm font-semibold"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                width={110}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent
                  formatter={(value) => `${Number(value).toLocaleString()} items`}
                />}
              />
              <Bar
                dataKey="quantity"
                fill="hsl(var(--primary))"
                radius={[0, 8, 8, 0]}
                animationBegin={0}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
