"use client"

import Link from "next/link"
import {
  Tractor,
  LayoutDashboard,
  Package,
  FolderKanban,
  ShoppingCart,
  BarChart,
  Users,
  Settings,
  PanelLeft,
  Search,
} from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserNav } from "@/components/layout/user-nav"
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: Package, label: "Inventory" },
  { href: "/categories", icon: FolderKanban, label: "Categories" },
  { href: "/sales", icon: ShoppingCart, label: "Sales / Usage" },
  { href: "/reports", icon: BarChart, label: "Reports" },
  { href: "/users", icon: Users, label: "Users" },
]

function getBreadcrumb(path: string) {
  const pathParts = path.split('/').filter(Boolean);
  const breadcrumb = pathParts[0] || 'Dashboard';
  return breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1);
}

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Tractor className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">FarmSight</span>
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                  pathname.startsWith(item.href) && "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/settings"
              className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                pathname.startsWith('/settings') && "text-foreground"
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathname !== '/dashboard' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{getBreadcrumb(pathname)}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <NotificationsDropdown />
      <UserNav />
    </header>
  )
}
