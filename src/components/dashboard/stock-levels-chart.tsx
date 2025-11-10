"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts"
import type { InventoryItem } from "@/lib/types"

const chartConfig = {
  quantity: { label: "Quantity", color: "hsl(var(--primary))" },
}

// Enhanced color palette for bars with shadow effects
const COLORS = [
  'hsl(122, 47%, 45%)',   // Primary green - brighter
  'hsl(172, 100%, 40%)',  // Accent teal - enhanced
  'hsl(207, 82%, 58%)',   // Secondary blue - vibrant
  'hsl(42, 100%, 55%)',   // Warning yellow - bright
  'hsl(27, 87%, 65%)',    // Coral - warm
  'hsl(340, 75%, 60%)',   // Pink - vivid
  'hsl(280, 65%, 60%)',   // Purple
  'hsl(160, 70%, 45%)',   // Emerald
]

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
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 10)
  }, [items])

  const maxQuantity = React.useMemo(() => {
    return Math.max(...chartData.map(d => d.quantity), 0)
  }, [chartData])

  const totalQuantity = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.quantity, 0)
  }, [chartData])

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-200 bg-clip-text text-transparent">
              Stock Levels by Category
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium mt-1">
              Current inventory distribution across top categories
            </CardDescription>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-3xl font-extrabold text-primary">
              {totalQuantity.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Total Items
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-8">
        <ChartContainer config={chartConfig} className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              barSize={32}
              margin={{ top: 5, right: 80, left: 5, bottom: 5 }}
              barGap={8}
            >
              <defs>
                {COLORS.map((color, index) => (
                  <filter key={`shadow-${index}`} id={`shadow${index}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                  </filter>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200/40 dark:stroke-slate-700/40"
                strokeOpacity={0.25}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                domain={[0, maxQuantity * 1.15]}
                className="text-xs md:text-sm font-medium"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1.5 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis
                type="category"
                dataKey="category"
                className="text-xs md:text-sm font-semibold"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
                width={130}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--primary))', opacity: 0.08, radius: 8 }}
                content={<ChartTooltipContent
                  formatter={(value, name, props) => {
                    const percentage = ((Number(value) / totalQuantity) * 100).toFixed(1)
                    return [
                      <div key="value" className="flex flex-col gap-1">
                        <span className="font-bold text-base">{Number(value).toLocaleString()} items</span>
                        <span className="text-xs text-muted-foreground">{percentage}% of total stock</span>
                      </div>,
                      'Stock Level'
                    ]
                  }}
                  labelClassName="font-semibold text-sm"
                />}
              />
              <Bar
                dataKey="quantity"
                radius={[0, 16, 16, 0]}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    filter={`url(#shadow${index % COLORS.length})`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
                <LabelList
                  dataKey="quantity"
                  position="right"
                  formatter={(value: number) => value.toLocaleString()}
                  className="fill-slate-700 dark:fill-slate-300 text-xs font-bold"
                  offset={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
