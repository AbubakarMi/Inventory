
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 sm:px-6 shadow-sm">
       {isMobile && <SidebarTrigger className="sm:hidden" />}
      <Breadcrumb className="hidden md:flex">
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
      <div className="ml-auto flex items-center gap-2.5">
        <NotificationsDropdown />

        {userData && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 gap-2 px-2.5 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <p className="text-sm font-medium leading-none">{userData.name}</p>
                  <p className="text-xs text-muted-foreground">{userData.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userData.name}</p>
                  <p className="text-xs text-muted-foreground">{userData.email}</p>
                  <Badge
                    variant={getRoleBadgeVariant(userData.role)}
                    className="h-5 text-xs font-medium px-2 mt-1 w-fit"
                  >
                    {userData.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
