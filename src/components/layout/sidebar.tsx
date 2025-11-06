
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
  ChevronDown,
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
import { useAuth } from "@/contexts/AuthContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["Admin", "Manager", "Staff", "Storekeeper"] },
  { href: "/inventory", icon: Package, label: "Inventory", roles: ["Admin", "Manager", "Staff", "Storekeeper"] },
  { href: "/sales", icon: ShoppingCart, label: "Sales / Usage", roles: ["Admin", "Manager", "Staff", "Storekeeper"] },
  { href: "/reports", icon: BarChart, label: "Reports", roles: ["Admin", "Manager"] },
  { href: "/users", icon: Users, label: "Users", roles: ["Admin"] },
];

const configItems = [
  { href: "/suppliers", icon: Truck, label: "Suppliers", roles: ["Admin", "Manager", "Storekeeper"] },
  { href: "/categories", icon: FolderKanban, label: "Categories", roles: ["Admin", "Manager"] },
];

const ConfigIcon = Settings;


export default function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, state } = useSidebar();
  const { currentUser } = useAuth();
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);

  const navItems = React.useMemo(() => {
    if (!currentUser?.role) return [];
    return mainNavItems.filter(item => item.roles.includes(currentUser.role));
  }, [currentUser?.role]);

  const configNavItems = React.useMemo(() => {
    if (!currentUser?.role) return [];
    return configItems.filter(item => item.roles.includes(currentUser.role));
  }, [currentUser?.role]);

  const isConfigActive = configNavItems.some(item => pathname.startsWith(item.href));


  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
              <Tractor className="h-5 w-5 text-primary-foreground" />
            </div>
            { (state === 'expanded' || isMobile) && (
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-50">
                FarmSight
              </span>
            )}
        </div>
        {!isMobile && <SidebarTrigger className="ml-auto hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" />}
      </SidebarHeader>
      <SidebarContent className="px-2 py-2 bg-white dark:bg-slate-900">
        <SidebarMenu className="gap-1">
            {/* Dashboard - First item */}
            <SidebarMenuItem>
                <Link href="/dashboard">
                    <SidebarMenuButton
                        isActive={pathname.startsWith('/dashboard')}
                        tooltip="Dashboard"
                        className="h-9 rounded-lg transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm data-[active=true]:font-semibold"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-sm font-medium">Dashboard</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>

            {/* Configuration - Collapsible section immediately after Dashboard */}
            {configNavItems.length > 0 && (
              <Collapsible
                open={isConfigOpen}
                onOpenChange={setIsConfigOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Configuration"
                      className="h-9 rounded-lg transition-all hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                      <ConfigIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Configuration</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-0.5">
                    <div className="ml-3 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                      {configNavItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            tooltip={item.label}
                            className="h-8 rounded-lg transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm"
                          >
                            <item.icon className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">{item.label}</span>
                          </SidebarMenuButton>
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}

            {/* Rest of navigation items */}
            {navItems.slice(1).map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            tooltip={item.label}
                            className="h-9 rounded-lg transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm data-[active=true]:font-semibold"
                        >
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 px-2 py-2 bg-white dark:bg-slate-900">
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/settings">
                    <SidebarMenuButton
                      isActive={pathname.startsWith('/settings')}
                      tooltip="Settings"
                      className="h-9 rounded-lg transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm data-[active=true]:font-semibold"
                    >
                        <Settings className="h-4 w-4" />
                        <span className="text-sm font-medium">Settings</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
