
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
        const [inventoryRes, salesRes, usersRes, suppliersRes] = await Promise.all([
          api.get('/inventory'),
          api.get('/sales'),
          api.get('/users').catch(() => ({ users: [] })), // May fail for non-admin users
          api.get('/suppliers'),
        ]);

        // Transform snake_case from API to camelCase for frontend
        const transformSale = (sale: any): Sale => ({
          id: sale.id,
          itemName: sale.item_name,
          quantity: sale.quantity,
          type: sale.type,
          date: sale.date,
          total: sale.total,
        });

        setInventoryItems(inventoryRes.items || []);
        setSales((salesRes.sales || []).map(transformSale));
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
    const lowStockItems = inventoryItems.filter(item => item.status === 'Low Stock').length;
    const outOfStockItems = inventoryItems.filter(item => item.status === 'Out of Stock').length;
    
    const expiringSoon = inventoryItems.filter(item => 
        item.expiry && isBefore(new Date(item.expiry), addDays(new Date(), 7))
    ).length;

    const inventoryValue = inventoryItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    const totalSalesValue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalUsers = users.length;
    const totalSuppliers = suppliers.length;

    const categoryCounts: { [key: string]: number } = {};
    inventoryItems.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const categoryColors: { [key: string]: string } = {
        'Fruits': 'var(--color-fruits)',
        'Vegetables': 'var(--color-vegetables)',
        'Dairy': 'var(--color-dairy)',
        'Feed': 'var(--color-feed)',
        'Supplies': 'var(--color-supplies)',
        'Processed Goods': 'var(--color-processed-goods)',
    }

    const categoryBreakdown: PieChartData[] = Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        value,
        fill: categoryColors[name] || 'hsl(var(--muted-foreground))',
    }));
    
    // This is a simplified version of top selling items based on sales records
    const salesByItem: { [key: string]: { quantity: number; profit: number } } = {};
    sales.forEach(sale => {
        const item = inventoryItems.find(i => i.name === sale.itemName);
        if (item) {
            const profit = sale.total - (sale.quantity * item.cost);
            if (!salesByItem[sale.itemName]) {
                salesByItem[sale.itemName] = { quantity: 0, profit: 0 };
            }
            salesByItem[sale.itemName].quantity += sale.quantity;
            salesByItem[sale.itemName].profit += profit;
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

  // Simplified stat cards - only show the most important metrics
  const statCards = [
    { title: "Inventory Value", value: `₦${inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <Package />, roles: ["Admin", "Manager"], linkHref: "/inventory", description: "Total stock value" },
    { title: "Total Sales", value: `₦${totalSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <ShoppingCart />, roles: ["Admin", "Manager"], linkHref: "/sales", description: "All-time revenue" },
    { title: "Items in Stock", value: totalItems.toLocaleString(), icon: <BarChart />, roles: ["Admin", "Manager", "Storekeeper", "Staff"], linkHref: "/inventory", description: "Total quantity" },
    { title: "Low Stock Alerts", value: lowStockItems + outOfStockItems, icon: <AlertTriangle />, roles: ["Admin", "Manager", "Storekeeper", "Staff"], linkHref: "/inventory?status=low", description: "Needs attention", variant: lowStockItems + outOfStockItems > 0 ? "warning" : "default" },
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
    <div className="flex flex-1 flex-col gap-4 md:gap-5">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">Overview of your inventory and operations</p>
          </div>
      </div>

      {isLowStockAlertVisible && lowStockItems > 0 && (
        <Alert variant="warning" className="relative shadow-sm">
          <AlertCircle className="h-5 w-5" />
          <div className="ml-3">
            <AlertTitle className="font-semibold">Low Stock Alert!</AlertTitle>
            <AlertDescription className="text-sm">
              You have {lowStockItems} items running low on stock. Please reorder soon.
            </AlertDescription>
          </div>
           <button
            onClick={() => setIsLowStockAlertVisible(false)}
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      {/* Key Metrics - Cleaner 4-column grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(card => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Main Content Area - Enhanced chart layout */}
      <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-4 md:space-y-5">
          <CategoryBreakdownChart data={categoryBreakdown} />
          <div className="grid gap-4 md:gap-5 md:grid-cols-2">
            { (isAdmin || isManager) && <SalesTrendChart sales={sales} /> }
            <StockLevelsChart items={inventoryItems} />
          </div>
          { (isAdmin || isManager) && <TopProductsTable items={topSellingItems} /> }
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="lg:col-span-1 space-y-4 md:space-y-5">
          <RecentSales sales={(sales || []).slice(0, 5)} />

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link href="/inventory" passHref>
                <Button variant="outline" size="sm" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all">
                  <PlusCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Add Item</span>
                </Button>
              </Link>
              <Link href="/sales" passHref>
                <Button variant="outline" size="sm" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all">
                  <PenSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Record Sale</span>
                </Button>
              </Link>
              { (isAdmin || isManager) && (
                <Link href="/reports" passHref>
                  <Button variant="outline" size="sm" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs font-medium">Reports</span>
                  </Button>
                </Link>
              )}
              { isAdmin && (
                <Link href="/users" passHref>
                  <Button variant="outline" size="sm" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all">
                    <Users className="h-5 w-5" />
                    <span className="text-xs font-medium">Manage Users</span>
                  </Button>
                </Link>
              )}
              <Link href="/suppliers" passHref>
                <Button variant="outline" size="sm" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all">
                  <Truck className="h-5 w-5" />
                  <span className="text-xs font-medium">Suppliers</span>
                </Button>
              </Link>
              <Link href="/categories" passHref>
                <Button variant="outline" size="sm" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all">
                  <Package className="h-5 w-5" />
                  <span className="text-xs font-medium">Categories</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stock Status Summary */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50">Stock Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="text-slate-600 dark:text-slate-400">In Stock</span>
                  <span className="font-semibold text-green-600 dark:text-green-500">{inventoryItems.filter(i => i.status === 'In Stock').length} items</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="text-slate-600 dark:text-slate-400">Low Stock</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-500">{lowStockItems} items</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="text-slate-600 dark:text-slate-400">Out of Stock</span>
                  <span className="font-semibold text-red-600 dark:text-red-500">{outOfStockItems} items</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="text-slate-600 dark:text-slate-400">Expiring Soon</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-500">{expiringSoon} items</span>
                </div>
              </div>
              { (isAdmin || isManager) && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-slate-600 dark:text-slate-400">Total Suppliers</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{totalSuppliers}</span>
                  </div>
                  { isAdmin && (
                    <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors mt-1">
                      <span className="text-slate-600 dark:text-slate-400">Total Users</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">{totalUsers}</span>
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

    