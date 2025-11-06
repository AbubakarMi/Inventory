import { Bell, AlertTriangle, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notifications } from "@/lib/data"
import { cn } from "@/lib/utils"

export function NotificationsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-12 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
        >
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
            <Bell className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="sr-only">Toggle notifications</span>
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 ring-2 ring-white dark:ring-slate-950 text-[10px] font-bold text-white items-center justify-center">{notifications.length}</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl"
      >
        <DropdownMenuLabel className="text-sm font-bold text-slate-900 dark:text-slate-100 px-3 py-2">
          Notifications
          {notifications.length > 0 && (
            <span className="ml-2 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
        <div className="max-h-64 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex items-start gap-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 p-3 my-1 cursor-pointer"
            >
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg shrink-0",
                notification.type === 'warning' && "bg-orange-100 dark:bg-orange-950/50",
                notification.type === 'error' && "bg-red-100 dark:bg-red-950/50"
              )}>
                {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                {notification.type === 'error' && <Bug className="h-4 w-4 text-red-600 dark:text-red-400" />}
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-normal leading-relaxed">{notification.message}</span>
            </DropdownMenuItem>
          ))}
        </div>
        {notifications.length === 0 && (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-3">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No new notifications</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">You're all caught up!</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
