
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
  Sparkles,
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
    <Sidebar className="border-r-0 bg-white dark:bg-slate-950 shadow-[0_0_40px_rgba(0,0,0,0.08)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
      <SidebarHeader className="border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-7 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="flex items-center gap-4 w-full">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Tractor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950 animate-pulse shadow-sm"></div>
            </div>
            { (state === 'expanded' || isMobile) && (
              <div className="flex flex-col flex-1">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  FarmSight
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">INVENTORY SYSTEM</span>
              </div>
            )}
        </div>
        {!isMobile && <SidebarTrigger className="absolute top-6 right-5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-all hover:scale-110" />}
      </SidebarHeader>
      <SidebarContent className="px-3 py-4 bg-transparent">
        <SidebarMenu className="gap-1">
            {/* Dashboard - First item */}
            <SidebarMenuItem>
                <Link href="/dashboard">
                    <SidebarMenuButton
                        isActive={pathname.startsWith('/dashboard')}
                        tooltip="Dashboard"
                        className="group h-12 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent hover:text-primary hover:shadow-md hover:shadow-primary/5 hover:translate-x-1 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:shadow-primary/25 data-[active=true]:font-bold data-[active=true]:translate-x-1"
                    >
                        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 group-data-[active=true]:from-primary-foreground/20 group-data-[active=true]:to-primary-foreground/10 transition-all">
                          <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide">Dashboard</span>
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
                      className="group h-12 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-900 dark:hover:from-slate-800 dark:hover:to-slate-850 dark:hover:text-slate-100 hover:shadow-md hover:translate-x-1"
                    >
                      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-slate-200/70 to-slate-100/50 dark:from-slate-700/70 dark:to-slate-800/50 group-hover:from-slate-300 group-hover:to-slate-200 dark:group-hover:from-slate-600 dark:group-hover:to-slate-700 transition-all">
                        <ConfigIcon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold tracking-wide">Configuration</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1.5">
                    <div className="ml-5 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-4 py-1">
                      {configNavItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            tooltip={item.label}
                            className="group h-10 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:shadow-sm hover:translate-x-0.5 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/90 data-[active=true]:to-primary/80 data-[active=true]:text-primary-foreground data-[active=true]:shadow-md data-[active=true]:font-semibold data-[active=true]:translate-x-0.5"
                          >
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/15 group-hover:from-primary/25 group-hover:to-primary/15 group-data-[active=true]:from-primary-foreground/20 group-data-[active=true]:to-primary-foreground/10 transition-all">
                              <item.icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium tracking-wide">{item.label}</span>
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
                            className="group h-12 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent hover:text-primary hover:shadow-md hover:shadow-primary/5 hover:translate-x-1 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:shadow-primary/25 data-[active=true]:font-bold data-[active=true]:translate-x-1"
                        >
                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 group-data-[active=true]:from-primary-foreground/20 group-data-[active=true]:to-primary-foreground/10 transition-all">
                              <item.icon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200/80 dark:border-slate-800/80 px-3 py-4 bg-gradient-to-tr from-slate-50/80 via-transparent to-transparent dark:from-slate-900/50">
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/settings">
                    <SidebarMenuButton
                      isActive={pathname.startsWith('/settings')}
                      tooltip="Settings"
                      className="group h-12 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent hover:text-primary hover:shadow-md hover:shadow-primary/5 hover:translate-x-1 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:shadow-primary/25 data-[active=true]:font-bold data-[active=true]:translate-x-1"
                    >
                        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 group-data-[active=true]:from-primary-foreground/20 group-data-[active=true]:to-primary-foreground/10 transition-all">
                          <Settings className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide">Settings</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
