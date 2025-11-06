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
      default: "group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 rounded-2xl overflow-hidden",
      warning: "group bg-gradient-to-br from-orange-50/80 via-orange-50/60 to-orange-100/50 dark:from-orange-950/40 dark:via-orange-950/30 dark:to-orange-900/20 backdrop-blur-xl border border-orange-200/30 dark:border-orange-900/30 shadow-[0_8px_32px_rgba(251,146,60,0.15)] dark:shadow-[0_8px_32px_rgba(251,146,60,0.25)] hover:shadow-[0_12px_48px_rgba(251,146,60,0.25)] dark:hover:shadow-[0_12px_48px_rgba(251,146,60,0.35)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 rounded-2xl overflow-hidden",
      destructive: "group bg-gradient-to-br from-red-50/80 via-red-50/60 to-red-100/50 dark:from-red-950/40 dark:via-red-950/30 dark:to-red-900/20 backdrop-blur-xl border border-red-200/30 dark:border-red-900/30 shadow-[0_8px_32px_rgba(239,68,68,0.15)] dark:shadow-[0_8px_32px_rgba(239,68,68,0.25)] hover:shadow-[0_12px_48px_rgba(239,68,68,0.25)] dark:hover:shadow-[0_12px_48px_rgba(239,68,68,0.35)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 rounded-2xl overflow-hidden",
  }
  const iconVariantClasses = {
    default: "text-primary bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 sm:p-3 rounded-xl shadow-lg ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300",
    warning: "text-orange-600 dark:text-orange-400 bg-gradient-to-br from-orange-200/80 to-orange-100/60 dark:from-orange-900/60 dark:to-orange-900/40 p-2.5 sm:p-3 rounded-xl shadow-lg ring-1 ring-orange-300/50 dark:ring-orange-800/50 group-hover:scale-110 transition-transform duration-300",
    destructive: "text-red-600 dark:text-red-400 bg-gradient-to-br from-red-200/80 to-red-100/60 dark:from-red-900/60 dark:to-red-900/40 p-2.5 sm:p-3 rounded-xl shadow-lg ring-1 ring-red-300/50 dark:ring-red-800/50 group-hover:scale-110 transition-transform duration-300"
  }


  return (
    <Link href={linkHref} className="w-full max-w-[320px] mx-auto">
      <Card className={cn("cursor-pointer relative", variantClasses[variant])} style={{ minHeight: "140px", maxHeight: "160px" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider line-clamp-1">{title}</CardTitle>
          <div className={iconVariantClasses[variant]}>{icon}</div>
        </CardHeader>
        <CardContent className="relative z-10 pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-200 bg-clip-text text-transparent flex-1 leading-none whitespace-nowrap overflow-hidden" style={{ fontSize: "clamp(0.875rem, 1.5vw + 0.5rem, 1.25rem)", textOverflow: "ellipsis" }}>{value}</div>
            {trend && (
              <div className={cn(
                "text-xs md:text-sm font-bold flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0",
                trend.value > 0 ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950" : trend.value < 0 ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950" : "text-slate-500 bg-slate-100 dark:bg-slate-800"
              )}>
                {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {description && <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium line-clamp-1">{description}</p>}
        </CardContent>
      </Card>
    </Link>
  )
}

    