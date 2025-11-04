
"use client";

import Link from "next/link";
import {
  Tractor,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  FolderKanban,
  Truck,
  BarChart,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/firebase";


const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["Admin", "Manager", "Staff", "Storekeeper"] },
  { href: "/inventory", icon: Package, label: "Inventory", roles: ["Admin", "Manager", "Staff", "Storekeeper"] },
  { href: "/categories", icon: FolderKanban, label: "Categories", roles: ["Admin", "Manager"] },
  { href: "/sales", icon: ShoppingCart, label: "Sales / Usage", roles: ["Admin", "Manager", "Staff", "Storekeeper"] },
  { href: "/suppliers", icon: Truck, label: "Suppliers", roles: ["Admin", "Manager", "Storekeeper"] },
  { href: "/reports", icon: BarChart, label: "Reports", roles: ["Admin", "Manager"] },
  { href: "/users", icon: Users, label: "Users", roles: ["Admin"] },
];


export default function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, state } = useSidebar();
  const { claims } = useUser();
  const userRole = claims?.role;

  const navItems = React.useMemo(() => {
    // Admin sees everything. This is the highest priority check.
    if (userRole === 'Admin') {
      return allNavItems;
    }
    
    if (!userRole) return [];

    // For other roles, filter based on their allowed roles.
    return allNavItems.filter(item => item.roles.includes(userRole));
  }, [userRole]);


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Tractor className="h-6 w-6 text-primary" />
            { (state === 'expanded' || isMobile) && <span className="font-semibold text-lg">FarmSight</span> }
        </div>
        {!isMobile && <SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            tooltip={item.label}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/settings">
                    <SidebarMenuButton isActive={pathname.startsWith('/settings')} tooltip="Settings">
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
