
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm px-6">
       {isMobile && <SidebarTrigger className="sm:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-all" />}

      {/* Breadcrumb & Overview */}
      <div className="hidden md:flex flex-col gap-1 flex-1 max-w-2xl">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== '/dashboard' && pathname !== '/' && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-medium text-slate-900 dark:text-slate-100">{getBreadcrumb(pathname)}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
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
                className="group h-10 gap-3 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xs">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">{userData.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{userData.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-lg"
            >
              <DropdownMenuLabel className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">{userData.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{userData.email}</p>
                    <Badge
                      variant={getRoleBadgeVariant(userData.role)}
                      className="h-5 text-[10px] font-semibold px-2 w-fit"
                    >
                      {userData.role}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer rounded-md hover:bg-primary/10 hover:text-primary p-2">
                <Link href="/settings" className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 mr-2">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 p-2"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-red-100 dark:bg-red-950/50 mr-2">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
