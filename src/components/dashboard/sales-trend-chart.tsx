"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, ComposedChart, Dot } from "recharts"
import type { Sale } from "@/lib/types"
import { TrendingUp, TrendingDown } from "lucide-react"

const chartConfig = {
  salesArea: { label: "Sales", color: "hsl(var(--primary))" },
  salesLine: { label: "Sales Line", color: "hsl(var(--primary))" },
  average: { label: "Average", color: "hsl(var(--muted-foreground))" },
}

type SalesTrendChartProps = {
  sales: Sale[]
}

export function SalesTrendChart({ sales }: SalesTrendChartProps) {
  const chartData = React.useMemo(() => {
    // Group sales by date, keeping track of original date for sorting
    const salesByDate: { [key: string]: { total: number; timestamp: number } } = {}

    sales.forEach(sale => {
      const dateObj = new Date(sale.date)
      const dateKey = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { total: 0, timestamp: dateObj.getTime() }
      }
      salesByDate[dateKey].total += Number(sale.total)
    })

    // Sort by timestamp (chronological order) and get last 10 days
    const sortedEntries = Object.entries(salesByDate)
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(-10)

    return sortedEntries.map(([date, data]) => ({
      date,
      sales: Number(data.total)
    }))
  }, [sales])

  const totalSales = Number(chartData.reduce((sum, item) => sum + Number(item.sales), 0))

  const averageSales = React.useMemo(() => {
    return chartData.length > 0 ? totalSales / chartData.length : 0
  }, [totalSales, chartData.length])

  const trend = React.useMemo(() => {
    if (chartData.length < 2) return 0
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2))
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2))
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.sales, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.sales, 0) / secondHalf.length
    return ((secondAvg - firstAvg) / firstAvg) * 100
  }, [chartData])

  const maxSales = React.useMemo(() => Math.max(...chartData.map(d => d.sales), 0), [chartData])

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-200 bg-clip-text text-transparent">
              Sales Trend
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium mt-1">
              Last {chartData.length} days performance
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-extrabold text-primary">
                ₦{totalSales.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Total Sales
              </div>
            </div>
            {trend !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                trend > 0
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-8">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200/40 dark:stroke-slate-700/40"
                strokeOpacity={0.25}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                className="text-xs md:text-sm font-medium"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1.5 }}
                height={40}
              />
              <YAxis
                className="text-xs md:text-sm font-medium"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
                width={65}
                domain={[0, maxSales * 1.15]}
              />
              <ChartTooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }}
                content={<ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === 'average') return null; // Don't show tooltip for average line
                    return [
                      <div key={`tooltip-${name}-${value}`} className="flex flex-col gap-1">
                        <span className="font-bold text-base">₦{Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-xs text-muted-foreground">
                          {((Number(value) / totalSales) * 100).toFixed(1)}% of total
                        </span>
                      </div>,
                      'Daily Sales'
                    ];
                  }}
                  labelClassName="font-semibold text-sm"
                />}
              />
              {/* Reference line for average */}
              <Line
                type="monotone"
                dataKey={() => averageSales}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                opacity={0.5}
                legendType="line"
                name="average"
                id="average-line"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                fill="hsl(var(--primary))"
                fillOpacity={0.15}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-in-out"
                name="salesArea"
                id="sales-area"
                dot={(props) => {
                  const { cx, cy, payload, index } = props
                  const isHighest = payload.sales === maxSales
                  return (
                    <Dot
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={isHighest ? 8 : 6}
                      fill="hsl(var(--primary))"
                      stroke="white"
                      strokeWidth={2.5}
                      className="transition-all duration-200"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
                    />
                  )
                }}
                activeDot={{ r: 9, strokeWidth: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
