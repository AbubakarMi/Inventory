
"use client"

import { useState } from "react"
import { AlertCircle, X, Package, AlertTriangle, ShoppingCart, BarChart, PartyPopper } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import StatCard from "@/components/dashboard/stat-card"
import { inventoryItems, topSellingItems, sales } from "@/lib/data"
import { TopProductsTable } from "@/components/dashboard/top-products-table"
import { DashboardCharts } from "@/components/dashboard/charts"
import { RecentSales } from "@/components/dashboard/recent-sales"

export default function DashboardPage() {
  const [isLowStockAlertVisible, setIsLowStockAlertVisible] = useState(true);
  const [isWelcomeAlertVisible, setIsWelcomeAlertVisible] = useState(true);

  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = inventoryItems.filter(item => item.status === 'Low Stock').length
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + item.cost * item.quantity, 0)
  const totalSales = 2856.50 // static value

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

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard title="Total Inventory Value" value={`₦${inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<Package />} />
        <StatCard title="Low Stock Items" value={lowStockItems} icon={<AlertTriangle />} />
        <StatCard title="Total Sales" value={`₦${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<ShoppingCart />} />
        <StatCard title="Total Items in Stock" value={totalItems.toLocaleString()} icon={<BarChart />} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <DashboardCharts />
        </div>
         <div className="lg:col-span-1 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
          <RecentSales sales={sales.slice(0, 5)} />
          <TopProductsTable items={topSellingItems} />
        </div>
      </div>
    </div>
  )
}
