
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { dailyTrendsData, categoryBreakdownData } from "@/lib/data"
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartConfig = {
  value: { 
    label: "Sales",
    color: "hsl(var(--primary))",
  },
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
                <AreaChart 
                  data={dailyTrendsData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} />
                    <ChartTooltip cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
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
