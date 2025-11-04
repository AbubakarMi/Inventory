
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AlertCircle, X, Package, AlertTriangle, ShoppingCart, BarChart, PartyPopper, Users, FileText, PlusCircle, PenSquare, PackageX, CalendarClock, Truck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import StatCard from "@/components/dashboard/stat-card"
import { TopProductsTable } from "@/components/dashboard/top-products-table"
import { CategoryBreakdownChart } from "@/components/dashboard/category-breakdown-chart"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { initializeFirebase, useCollection, useUser } from "@/firebase"
import { collection, query } from "firebase/firestore"
import type { InventoryItem, Sale, User as AppUser, PieChartData, Supplier } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { isBefore, addDays } from "date-fns"

export default function DashboardPage() {
  const { firestore } = initializeFirebase();
  const { user } = useUser();

  const inventoryQuery = useMemo(() => firestore ? query(collection(firestore, 'inventory')) : null, [firestore]);
  const salesQuery = useMemo(() => firestore ? query(collection(firestore, 'sales')) : null, [firestore]);
  const usersQuery = useMemo(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const suppliersQuery = useMemo(() => firestore ? query(collection(firestore, 'suppliers')) : null, [firestore]);
  
  const { data: inventoryItems, loading: loadingInventory } = useCollection<InventoryItem>(inventoryQuery);
  const { data: sales, loading: loadingSales } = useCollection<Sale>(salesQuery);
  const { data: users, loading: loadingUsers } = useCollection<AppUser>(usersQuery);
  const { data: suppliers, loading: loadingSuppliers } = useCollection<Supplier>(suppliersQuery);


  const [isLowStockAlertVisible, setIsLowStockAlertVisible] = useState(true);
  const [isWelcomeAlertVisible, setIsWelcomeAlertVisible] = useState(true);

  const userRole = user?.claims?.role;

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

  const loading = loadingInventory || loadingSales || loadingUsers || loadingSuppliers;

  const isAdmin = userRole === 'Admin';
  const isManager = userRole === 'Manager';

  const statCards = [
    { title: "Total Inventory Value", value: `₦${inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <Package />, roles: ["Admin", "Manager"], link: "/inventory", description: "Across all items" },
    { title: "Total Sales", value: `₦${totalSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <ShoppingCart />, roles: ["Admin", "Manager"], link: "/sales", description: "This month" },
    { title: "Total Items in Stock", value: totalItems.toLocaleString(), icon: <BarChart />, roles: ["Admin", "Manager", "Storekeeper", "Staff"], link: "/inventory", description: "Sum of all quantities" },
    { title: "Low Stock Items", value: lowStockItems, icon: <AlertTriangle />, roles: ["Admin", "Manager", "Storekeeper", "Staff"], link: "/inventory?status=low", description: "Items below threshold", variant: "warning" },
    { title: "Out of Stock Items", value: outOfStockItems, icon: <PackageX />, roles: ["Admin", "Manager", "Storekeeper", "Staff"], link: "/inventory?status=out", description: "Items to restock", variant: "destructive" },
    { title: "Expiring Soon", value: expiringSoon, icon: <CalendarClock />, roles: ["Admin", "Manager", "Storekeeper"], link: "/inventory?status=expiring", description: "Items expiring in 7 days" },
    { title: "Total Users", value: totalUsers, icon: <Users />, roles: ["Admin"], link: "/users", description: "System-wide users" },
    { title: "Total Suppliers", value: totalSuppliers, icon: <Truck />, roles: ["Admin", "Manager"], link: "/suppliers", description: "All registered suppliers" },
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
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
      </div>

       {isWelcomeAlertVisible && (
        <Alert className="relative bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
          <PartyPopper className="h-4 w-4 text-green-600 dark:text-green-400" />
          <div className="ml-3">
            <AlertTitle className="font-semibold text-green-800 dark:text-green-200">Welcome back!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              You have successfully logged in. Here's your farm's overview.
            </AlertDescription>
          </div>
           <button
            onClick={() => setIsWelcomeAlertVisible(false)}
            className="absolute top-2 right-2 p-1 rounded-full text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800/50"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      {isLowStockAlertVisible && lowStockItems > 0 && (
        <Alert variant="warning" className="relative">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-3">
            <AlertTitle className="font-semibold">Low Stock Alert!</AlertTitle>
            <AlertDescription>
              You have {lowStockItems} items running low on stock.
            </AlertDescription>
          </div>
           <button
            onClick={() => setIsLowStockAlertVisible(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/50"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(card => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4">
          <RecentSales sales={(sales || []).slice(0, 5)} />
          { (isAdmin || isManager) && <TopProductsTable items={topSellingItems} /> }
        </div>
         <div className="lg:col-span-1 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link href="/inventory" passHref>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </Link>
              <Link href="/sales" passHref>
                <Button variant="outline" className="w-full">
                  <PenSquare className="mr-2 h-4 w-4" /> Record Sale
                </Button>
              </Link>
              { (isAdmin || isManager) && (
                <Link href="/reports" passHref>
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> Reports
                  </Button>
                </Link>
              )}
              { isAdmin && (
                <Link href="/users" passHref>
                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 h-4 w-4" /> Users
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
          
          <CategoryBreakdownChart data={categoryBreakdown} />
          
        </div>
      </div>
    </div>
  )
}

    