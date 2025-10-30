
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"

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

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       {isMobile && <SidebarTrigger className="sm:hidden" />}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathname !== '/dashboard' && pathname !== '/' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{getBreadcrumb(pathname)}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <NotificationsDropdown />
        <Link href="/login">
            <Button variant="outline" size="icon" className="h-8 w-8">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
            </Button>
        </Link>
      </div>
    </header>
  )
}
