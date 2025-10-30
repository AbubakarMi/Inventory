
"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Sale } from "@/lib/types"

const userAvatars: {[key: string]: string} = {
  "Organic Apples": "/placeholder-images/apple.png",
  "Carrots": "/placeholder-images/carrot.png",
  "Cow Milk": "/placeholder-images/milk.png",
  "Free-range Eggs": "/placeholder-images/eggs.png",
  "Chicken Feed": "/placeholder-images/feed.png",
}

export function RecentSales({ sales }: { sales: Sale[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>You made {sales.length} sales this month.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8">
        {sales.map(sale => (
        <div key={sale.id} className="flex items-center gap-4">
          <Avatar className="hidden h-9 w-9 sm:flex">
            <AvatarImage src={userAvatars[sale.itemName] || "/placeholder-images/box.png"} alt="Avatar" />
            <AvatarFallback>{sale.itemName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">{sale.itemName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(sale.date).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto font-medium">+₦{sale.total.toFixed(2)}</div>
        </div>
        ))}
      </CardContent>
    </Card>
  )
}
