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
import type { Notification } from "@/lib/types"
import { cn } from "@/lib/utils"

// TODO: Replace with real data from Firestore
const notifications: Notification[] = [];


export function NotificationsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex items-start gap-3">
              {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 mt-1 text-warning" />}
              {notification.type === 'error' && <Bug className="h-4 w-4 mt-1 text-destructive" />}
              <span className="text-sm text-muted-foreground whitespace-normal">{notification.message}</span>
            </DropdownMenuItem>
          ))}
        </div>
        {notifications.length === 0 && <p className="p-4 text-sm text-muted-foreground">No new notifications</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
