import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

type StatCardProps = {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  linkHref: string
  variant?: "default" | "warning" | "destructive"
  trend?: {
    value: number
    label: string
  }
}

export default function StatCard({ title, value, icon, description, linkHref, variant = "default", trend }: StatCardProps) {
  const variantClasses = {
      default: "hover:shadow-xl transition-all duration-300 hover:border-primary/40 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:-translate-y-1",
      warning: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 hover:shadow-xl transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-800 hover:-translate-y-1",
      destructive: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 hover:shadow-xl transition-all duration-300 hover:border-red-300 dark:hover:border-red-800 hover:-translate-y-1",
  }
  const iconVariantClasses = {
    default: "text-primary bg-primary/10 p-3 rounded-xl shadow-sm",
    warning: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl shadow-sm",
    destructive: "text-red-600 bg-red-100 dark:bg-red-900/30 p-3 rounded-xl shadow-sm"
  }


  return (
    <Link href={linkHref}>
      <Card className={cn("cursor-pointer group", variantClasses[variant])}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{title}</CardTitle>
          <div className={cn(iconVariantClasses[variant])}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</div>
            {trend && (
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.value > 0 ? "text-green-600 dark:text-green-500" : trend.value < 0 ? "text-red-600 dark:text-red-500" : "text-slate-500"
              )}>
                {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{description}</p>}
        </CardContent>
      </Card>
    </Link>
  )
}

    