
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
    <Card className="flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50">Category Breakdown</CardTitle>
        <CardDescription className="text-sm text-slate-600 dark:text-slate-400">Distribution of items across categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-full max-w-[280px]"
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
                  innerRadius={70}
                  outerRadius={110}
                  strokeWidth={2}
                  paddingAngle={2}
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
                              className="fill-slate-900 dark:fill-slate-50 text-4xl font-bold"
                            >
                              {totalValue.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 28}
                              className="fill-slate-500 dark:fill-slate-400 text-sm"
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

          <div className="flex-1 space-y-3 w-full">
            {data.map((item) => {
              const percentage = ((item.value / totalValue) * 100).toFixed(1)
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">{item.name}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
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
