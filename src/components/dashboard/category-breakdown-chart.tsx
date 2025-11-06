
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { PieChartData } from "@/lib/types"
import { Pie, PieChart, ResponsiveContainer, Label } from "recharts"

const chartConfig = {
  fruits: { label: "Fruits", color: "hsl(var(--chart-1))" },
  vegetables: { label: "Vegetables", color: "hsl(var(--chart-2))" },
  dairy: { label: "Dairy", color: "hsl(var(--chart-3))" },
  feed: { label: "Feed", color: "hsl(var(--chart-4))" },
  supplies: { label: "Supplies", color: "hsl(var(--chart-5))" },
  "processed goods": { label: "Processed Goods", color: "hsl(var(--destructive))" },
}

type CategoryBreakdownChartProps = {
    data: PieChartData[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  return (
    <Card className="flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-200 bg-clip-text text-transparent">Category Breakdown</CardTitle>
        <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium mt-1">Distribution of items across categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-8 pt-6">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-full max-w-[320px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={130}
                  strokeWidth={3}
                  paddingAngle={4}
                  animationBegin={0}
                  animationDuration={800}
                >
                   <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-slate-900 dark:fill-slate-50 text-5xl font-extrabold"
                            >
                              {totalValue.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 32}
                              className="fill-slate-600 dark:fill-slate-400 text-base font-semibold"
                            >
                              Total Items
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="flex-1 space-y-4 w-full">
            {data.map((item) => {
              const percentage = ((item.value / totalValue) * 100).toFixed(1)
              return (
                <div key={item.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-lg ring-2 ring-white dark:ring-slate-900"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-50 truncate">{item.name}</span>
                      <span className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.fill
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
