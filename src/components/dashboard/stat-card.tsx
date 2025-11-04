import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  linkHref: string
  variant?: "default" | "warning" | "destructive"
}

export default function StatCard({ title, value, icon, description, linkHref, variant = "default" }: StatCardProps) {
  const variantClasses = {
      default: "",
      warning: "bg-warning/10 border-warning/50 text-warning-foreground",
      destructive: "bg-destructive/10 border-destructive/50 text-destructive-foreground",
  }
  const iconVariantClasses = {
    default: "text-muted-foreground",
    warning: "text-warning",
    destructive: "text-destructive"
  }


  return (
    <Card className={cn(variantClasses[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn(iconVariantClasses[variant])}>{icon}</div>
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

    