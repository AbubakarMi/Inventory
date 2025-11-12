"use client"

import { useState, useEffect } from "react"
import { Bell, AlertTriangle, Bug, CheckCircle2, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-client"
import type { Notification } from "@/lib/types"

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      const notifs = response?.notifications || []
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n: Notification) => !n.is_read).length)
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      // Set empty array on error to prevent issues
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: number) => {
    try {
      await api.put('/notifications', { notification_id: id })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications', { mark_all_read: true })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case 'error':
        return <Bug className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      default:
        return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'warning':
        return "bg-orange-100 dark:bg-orange-950/50"
      case 'error':
        return "bg-red-100 dark:bg-red-950/50"
      case 'success':
        return "bg-green-100 dark:bg-green-950/50"
      default:
        return "bg-blue-100 dark:bg-blue-950/50"
    }
  }

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
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 ring-2 ring-white dark:ring-slate-950 text-[10px] font-bold text-white items-center justify-center">{unreadCount}</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="text-sm font-bold text-slate-900 dark:text-slate-100 p-0">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                "flex items-start gap-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 p-3 my-1 cursor-pointer relative",
                !notification.is_read && "bg-primary/5"
              )}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg shrink-0",
                getBackgroundColor(notification.type)
              )}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{notification.title}</p>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1"></span>
                  )}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{notification.message}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {new Date(notification.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        {notifications.length === 0 && !loading && (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-3">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No new notifications</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">You're all caught up!</p>
          </div>
        )}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">Loading notifications...</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
