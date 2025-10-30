"use client"

import { useState } from "react"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import StatCard from "@/components/dashboard/stat-card"
import { inventoryItems, topSellingItems } from "@/lib/data"
import { TopProductsTable } from "@/components/dashboard/top-products-table"
import { DashboardCharts } from "@/components/dashboard/charts"

export default function DashboardPage() {
  const [isAlertVisible, setIsAlertVisible] = useState(true);

  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = inventoryItems.filter(item => item.status === 'Low Stock').length
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + item.cost * item.quantity, 0)
  const totalSales = 2856.50 // static value

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
      </div>

      {isAlertVisible && lowStockItems > 0 && (
        <Alert variant="warning" className="relative">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-3">
            <AlertTitle className="font-semibold">Low Stock Alert!</AlertTitle>
            <AlertDescription>
              You have {lowStockItems} items running low on stock.
            </AlertDescription>
          </div>
           <button
            onClick={() => setIsAlertVisible(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/50"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard title="Total Items in Stock" value={totalItems.toLocaleString()} />
        <StatCard title="Low Stock Items" value={lowStockItems} />
        <StatCard title="Total Sales" value={`₦${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard title="Total Inventory Value" value={`₦${inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardCharts />
        </div>
        <div>
          <TopProductsTable items={topSellingItems} />
        </div>
      </div>
    </div>
  )
}
