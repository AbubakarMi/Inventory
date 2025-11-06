
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, User } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Button } from "../ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"


function getBreadcrumb(path: string) {
  const pathParts = path.split('/').filter(Boolean);
  // a/b/c -> a
  // a -> a
  const appPath = pathParts.length > 1 ? pathParts[1] : pathParts[0];
  const breadcrumb = appPath || 'Dashboard';
  return breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1);
}

export default function Header() {
  const pathname = usePathname()
  const { isMobile } = useSidebar();
  const { userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'default';
      case 'Manager':
        return 'secondary';
      case 'Storekeeper':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[73px] items-center gap-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-[0_0_40px_rgba(0,0,0,0.08)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] px-6">
       {isMobile && <SidebarTrigger className="sm:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-all hover:scale-110" />}

      {/* FarmSight Branding */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            FarmSight
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-widest uppercase">INVENTORY SYSTEM</span>
        </div>
      </div>

      {/* Breadcrumb & Overview */}
      <div className="hidden md:flex flex-col gap-1 flex-1 max-w-2xl">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-sm font-semibold transition-colors hover:text-primary">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== '/dashboard' && pathname !== '/' && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-semibold text-slate-900 dark:text-slate-100">{getBreadcrumb(pathname)}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        {pathname === '/dashboard' && (
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Overview of your inventory and operations
          </p>
        )}
      </div>

      {/* Right Side - Notifications & User */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <div className="relative group">
          <NotificationsDropdown />
        </div>

        {/* User Menu */}
        {userData && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group h-12 gap-3 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <Avatar className="h-9 w-9 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <p className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100">{userData.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{userData.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl"
            >
              <DropdownMenuLabel className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100">{userData.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{userData.email}</p>
                    <Badge
                      variant={getRoleBadgeVariant(userData.role)}
                      className="h-5 text-[10px] font-bold px-2 w-fit"
                    >
                      {userData.role}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-primary/10 hover:text-primary p-3 my-1">
                <Link href="/settings" className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 mr-3">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 p-3 my-1"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-100 dark:bg-red-950/50 mr-3">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-semibold">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
