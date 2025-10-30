"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { dailyTrendsData, categoryBreakdownData } from "@/lib/data"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartConfig = {
  value: { label: "Sales" },
  fruits: { label: "Fruits", color: "hsl(var(--chart-1))" },
  vegetables: { label: "Vegetables", color: "hsl(var(--chart-2))" },
  dairy: { label: "Dairy", color: "hsl(var(--chart-3))" },
  feed: { label: "Feed", color: "hsl(var(--chart-4))" },
  supplies: { label: "Supplies", color: "hsl(var(--chart-5))" },
}

export function DashboardCharts() {
  return (
    <div className="grid gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Daily Trends</CardTitle>
          <CardDescription>A look at sales over the last week.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrendsData}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Distribution of items across categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={categoryBreakdownData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
