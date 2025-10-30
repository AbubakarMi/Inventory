
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Pie, PieChart, ResponsiveContainer, Label } from "recharts"
import type { InventoryItem } from "@/lib/types"

const chartConfig = {
  // Colors will be assigned dynamically
}

export function CategoryBreakdownChart({ items }: { items: InventoryItem[] }) {
  
  const categoryData = React.useMemo(() => {
    if (!items) return [];

    const breakdown = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          name: item.category,
          value: 0,
        };
      }
      acc[item.category].value += 1; // counting number of items per category
      return acc;
    }, {} as Record<string, { name: string; value: number }>);

    return Object.values(breakdown);
  }, [items]);
  
  const chartConfig = React.useMemo(() => {
    const config: any = {};
    categoryData.forEach((category, index) => {
        config[category.name] = {
            label: category.name,
            color: `hsl(var(--chart-${(index % 5) + 1}))`
        }
    });
    return config;
  }, [categoryData]);

  const totalValue = React.useMemo(() => {
    return categoryData.reduce((acc, curr) => acc + curr.value, 0)
  }, [categoryData])

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Distribution of items across categories.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                //@ts-ignore
                fillFor={(entry) => chartConfig[entry.name]?.color}
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
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalValue.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Items
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
               <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
