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
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50">Stock Levels by Category</CardTitle>
        <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
          Current inventory distribution across top categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                type="category"
                dataKey="category"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                width={100}
              />
              <ChartTooltip
                content={<ChartTooltipContent
                  formatter={(value) => `${Number(value).toLocaleString()} items`}
                />}
              />
              <Bar
                dataKey="quantity"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
