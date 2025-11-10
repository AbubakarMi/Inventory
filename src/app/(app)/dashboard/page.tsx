
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AlertCircle, X, Package, AlertTriangle, ShoppingCart, BarChart, Users, FileText, PlusCircle, PenSquare, PackageX, CalendarClock, Truck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import StatCard from "@/components/dashboard/stat-card"
import { TopProductsTable } from "@/components/dashboard/top-products-table"
import { CategoryBreakdownChart } from "@/components/dashboard/category-breakdown-chart"
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart"
import { StockLevelsChart } from "@/components/dashboard/stock-levels-chart"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-client"
import { useAuth } from "@/contexts/AuthContext"
import type { InventoryItem, Sale, User as AppUser, PieChartData, Supplier } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { isBefore, addDays } from "date-fns"

export default function DashboardPage() {
  const { currentUser } = useAuth();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data with individual error handling to prevent one failure from blocking all data
        const [inventoryRes, salesRes, usersRes, suppliersRes] = await Promise.all([
          api.get('/inventory').catch((error) => {
            // Silently handle expected errors (401 Unauthorized)
            if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
              console.error('Error fetching inventory:', error);
            }
            return { items: [] };
          }),
          api.get('/sales').catch((error) => {
            if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
              console.error('Error fetching sales:', error);
            }
            return { sales: [] };
          }),
          api.get('/users').catch((error) => {
            if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
              console.error('Error fetching users:', error);
            }
            return { users: [] };
          }),
          api.get('/suppliers').catch((error) => {
            if (error?.status !== 401 && process.env.NODE_ENV === 'development') {
              console.error('Error fetching suppliers:', error);
            }
            return { suppliers: [] };
          }),
        ]);

        setInventoryItems(inventoryRes.items || []);
        setSales(salesRes.sales || []);
        setUsers(usersRes.users || []);
        setSuppliers(suppliersRes.suppliers || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [isLowStockAlertVisible, setIsLowStockAlertVisible] = useState(true);

  const userRole = currentUser?.role;

  const { 
      totalItems, 
      lowStockItems,
      outOfStockItems,
      expiringSoon,
      inventoryValue, 
      totalSalesValue, 
      totalUsers,
      totalSuppliers,
      categoryBreakdown, 
      topSellingItems 
    } = useMemo(() => {
    if (!inventoryItems || !sales || !users || !suppliers) {
      return {
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        expiringSoon: 0,
        inventoryValue: 0,
        totalSalesValue: 0,
        totalUsers: 0,
        totalSuppliers: 0,
        categoryBreakdown: [],
        topSellingItems: [],
      };
    }
    
    const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventoryItems.filter(item => {
      const quantity = Number(item.quantity) || 0;
      const threshold = Number(item.threshold) || 0;
      return quantity > 0 && quantity <= threshold;
    }).length;
    const outOfStockItems = inventoryItems.filter(item => Number(item.quantity) === 0).length;
    
    const expiringSoon = inventoryItems.filter(item => 
        item.expiry && isBefore(new Date(item.expiry), addDays(new Date(), 7))
    ).length;

    const inventoryValue = inventoryItems.reduce((sum, item) => sum + (Number(item.cost) * Number(item.quantity)), 0);
    const totalSalesValue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalUsers = users.length;
    const totalSuppliers = suppliers.length;

    const categoryCounts: { [key: string]: number } = {};
    inventoryItems.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    // Predefined colors for common categories
    const categoryColors: { [key: string]: string } = {
        'Fruits': 'hsl(var(--chart-1))',
        'Vegetables': 'hsl(var(--chart-2))',
        'Dairy': 'hsl(var(--chart-3))',
        'Feed': 'hsl(var(--chart-4))',
        'Supplies': 'hsl(var(--chart-5))',
        'Processed Goods': 'hsl(var(--destructive))',
    }

    // Dynamic color palette for additional categories
    const dynamicColors = [
        'hsl(220, 70%, 50%)',  // Blue
        'hsl(340, 75%, 55%)',  // Pink
        'hsl(160, 60%, 45%)',  // Teal
        'hsl(40, 85%, 55%)',   // Orange
        'hsl(280, 65%, 55%)',  // Purple
        'hsl(140, 70%, 45%)',  // Green
        'hsl(20, 80%, 50%)',   // Red-Orange
        'hsl(200, 70%, 50%)',  // Sky Blue
        'hsl(300, 70%, 50%)',  // Magenta
        'hsl(60, 80%, 50%)',   // Yellow
    ];

    const categoryBreakdown: PieChartData[] = Object.entries(categoryCounts).map(([name, value], index) => ({
        name,
        value,
        fill: categoryColors[name] || dynamicColors[index % dynamicColors.length],
    }));
    
    // This is a simplified version of top selling items based on sales records
    const salesByItem: { [key: string]: { quantity: number; profit: number } } = {};
    sales.forEach(sale => {
        const item = inventoryItems.find(i => i.name === sale.item_name);
        if (item) {
            const profit = sale.total - (sale.quantity * item.cost);
            if (!salesByItem[sale.item_name]) {
                salesByItem[sale.item_name] = { quantity: 0, profit: 0 };
            }
            salesByItem[sale.item_name].quantity += sale.quantity;
            salesByItem[sale.item_name].profit += profit;
        }
    });
    const topSellingItems = Object.entries(salesByItem)
        .sort((a, b) => b[1].profit - a[1].profit)
        .slice(0, 4)
        .map(([name, data]) => ({ name, ...data }));


    return { totalItems, lowStockItems, outOfStockItems, expiringSoon, inventoryValue, totalSalesValue, totalUsers, totalSuppliers, categoryBreakdown, topSellingItems };

  }, [inventoryItems, sales, users, suppliers]);

  const isAdmin = userRole === 'Admin';
  const isManager = userRole === 'Manager';

  // Helper function for consistent currency formatting
  const formatCurrency = (value: number): string => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function for number formatting with commas
  const formatNumber = (value: number): string => {
    return value.toLocaleString('en-US');
  };

  // Simplified stat cards - only show the most important metrics
  const statCards = [
    { title: "Inventory Value", value: formatCurrency(inventoryValue), icon: <Package />, roles: ["Admin", "Manager"], linkHref: "/inventory", description: "Total stock value" },
    { title: "Total Sales", value: formatCurrency(totalSalesValue), icon: <ShoppingCart />, roles: ["Admin", "Manager"], linkHref: "/sales", description: "All-time revenue" },
    { title: "Items in Stock", value: formatNumber(totalItems), icon: <BarChart />, roles: ["Admin", "Manager", "Storekeeper", "Staff"], linkHref: "/inventory", description: "Total quantity" },
    { title: "Low Stock Alerts", value: formatNumber(lowStockItems + outOfStockItems), icon: <AlertTriangle />, roles: ["Admin", "Manager", "Storekeeper", "Staff"], linkHref: "/inventory?status=low", description: "Needs attention", variant: lowStockItems + outOfStockItems > 0 ? "warning" : "default" },
  ].filter(card => userRole && card.roles.includes(userRole));


  if (loading) {
      return (
          <div className="flex flex-1 flex-col gap-4 md:gap-8">
              <div className="flex items-center justify-between">
                  <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                  {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
              </div>
              <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2 grid gap-4">
                      <Skeleton className="h-72 w-full" />
                      <Skeleton className="h-72 w-full" />
                  </div>
                  <div className="lg:col-span-1 grid grid-cols-1 gap-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-72 w-full" />
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto w-full bg-gradient-to-br from-slate-50 via-white to-slate-100/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/80 min-h-screen">

      {isLowStockAlertVisible && lowStockItems > 0 && (
        <Alert variant="warning" className="relative shadow-xl border-2 border-yellow-300/50 dark:border-yellow-700/50 rounded-2xl bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100/50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-yellow-900/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <div className="ml-3">
            <AlertTitle className="font-bold text-lg text-yellow-900 dark:text-yellow-100">Low Stock Alert!</AlertTitle>
            <AlertDescription className="text-sm mt-1.5 font-medium text-yellow-800 dark:text-yellow-200">
              You have <span className="font-bold">{lowStockItems}</span> items running low on stock. Please reorder soon.
            </AlertDescription>
          </div>
           <button
            onClick={() => setIsLowStockAlertVisible(false)}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-yellow-200/80 dark:hover:bg-yellow-900/50 transition-all hover:scale-110 text-yellow-700 dark:text-yellow-300"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </Alert>
      )}

      {/* Key Metrics - Enhanced responsive grid */}
      <div className="grid gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {statCards.map(card => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Main Content Area - Improved responsive chart layout */}
      <div className="grid gap-5 md:gap-6 lg:gap-7 xl:grid-cols-3">
        {/* Left Column - Primary Charts */}
        <div className="xl:col-span-2 space-y-5 md:space-y-6">
          {/* Category Breakdown - Full width at top */}
          <CategoryBreakdownChart data={categoryBreakdown} />

          {/* Stock Levels and Sales Trend - Priority charts */}
          <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
            <StockLevelsChart items={inventoryItems} />
            { (isAdmin || isManager) && <SalesTrendChart sales={sales} /> }
          </div>

          {/* Top Products Table - Full width at bottom */}
          { (isAdmin || isManager) && <TopProductsTable items={topSellingItems} /> }
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="xl:col-span-1 space-y-5 md:space-y-6">
          <RecentSales sales={(sales || []).slice(0, 5)} />

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
            <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pt-6">
              <Link href="/inventory" passHref>
                <Button variant="outline" size="sm" className="w-full h-auto py-5 flex-col gap-2 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-200 rounded-xl border-2">
                  <PlusCircle className="h-5 w-5" />
                  <span className="text-xs font-semibold">Add Item</span>
                </Button>
              </Link>
              <Link href="/sales" passHref>
                <Button variant="outline" size="sm" className="w-full h-auto py-5 flex-col gap-2 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-200 rounded-xl border-2">
                  <PenSquare className="h-5 w-5" />
                  <span className="text-xs font-semibold">Record Sale</span>
                </Button>
              </Link>
              { (isAdmin || isManager) && (
                <Link href="/reports" passHref>
                  <Button variant="outline" size="sm" className="w-full h-auto py-5 flex-col gap-2 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-200 rounded-xl border-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs font-semibold">Reports</span>
                  </Button>
                </Link>
              )}
              { isAdmin && (
                <Link href="/users" passHref>
                  <Button variant="outline" size="sm" className="w-full h-auto py-5 flex-col gap-2 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-200 rounded-xl border-2">
                    <Users className="h-5 w-5" />
                    <span className="text-xs font-semibold">Manage Users</span>
                  </Button>
                </Link>
              )}
              <Link href="/suppliers" passHref>
                <Button variant="outline" size="sm" className="w-full h-auto py-5 flex-col gap-2 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-200 rounded-xl border-2">
                  <Truck className="h-5 w-5" />
                  <span className="text-xs font-semibold">Suppliers</span>
                </Button>
              </Link>
              <Link href="/categories" passHref>
                <Button variant="outline" size="sm" className="w-full h-auto py-5 flex-col gap-2 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-200 rounded-xl border-2">
                  <Package className="h-5 w-5" />
                  <span className="text-xs font-semibold">Categories</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stock Status Summary */}
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
            <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50">Stock Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-50/50 dark:hover:from-green-950/30 dark:hover:to-green-950/10 transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-900">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">In Stock</span>
                  <span className="font-bold text-green-600 dark:text-green-500 px-3 py-1 bg-green-100 dark:bg-green-950 rounded-lg">{inventoryItems.filter(i => i.status === 'In Stock').length} items</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-50/50 dark:hover:from-yellow-950/30 dark:hover:to-yellow-950/10 transition-all duration-200 border border-transparent hover:border-yellow-200 dark:hover:border-yellow-900">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Low Stock</span>
                  <span className="font-bold text-yellow-600 dark:text-yellow-500 px-3 py-1 bg-yellow-100 dark:bg-yellow-950 rounded-lg">{lowStockItems} items</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50/50 dark:hover:from-red-950/30 dark:hover:to-red-950/10 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-900">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Out of Stock</span>
                  <span className="font-bold text-red-600 dark:text-red-500 px-3 py-1 bg-red-100 dark:bg-red-950 rounded-lg">{outOfStockItems} items</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-50/50 dark:hover:from-orange-950/30 dark:hover:to-orange-950/10 transition-all duration-200 border border-transparent hover:border-orange-200 dark:hover:border-orange-900">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Expiring Soon</span>
                  <span className="font-bold text-orange-600 dark:text-orange-500 px-3 py-1 bg-orange-100 dark:bg-orange-950 rounded-lg">{expiringSoon} items</span>
                </div>
              </div>
              { (isAdmin || isManager) && (
                <div className="pt-4 border-t-2 border-slate-200/60 dark:border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50/50 dark:hover:from-blue-950/30 dark:hover:to-blue-950/10 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-900">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Total Suppliers</span>
                    <span className="font-bold text-blue-600 dark:text-blue-500 px-3 py-1 bg-blue-100 dark:bg-blue-950 rounded-lg">{totalSuppliers}</span>
                  </div>
                  { isAdmin && (
                    <div className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50/50 dark:hover:from-purple-950/30 dark:hover:to-purple-950/10 transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-900">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Total Users</span>
                      <span className="font-bold text-purple-600 dark:text-purple-500 px-3 py-1 bg-purple-100 dark:bg-purple-950 rounded-lg">{totalUsers}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

    