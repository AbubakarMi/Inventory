import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type StatCardProps = {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  linkHref: string
}

export default function StatCard({ title, value, icon, description, linkHref }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        <Link href={linkHref} className="text-xs font-medium text-primary hover:underline mt-2 inline-block">
            View
        </Link>
      </CardContent>
    </Card>
  )
}
